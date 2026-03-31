import { create } from 'zustand'
import { difficultyCombatMods } from '../data/difficulty'
import { ALL_STAGES, getStageById } from '../data/stages'
import { getTowerConfig, type TowerType } from '../data/towers'
import { playFeelEvents } from '../game/audio/playFeelEvents'
import { getAudioManager } from '../game/audio/AudioManager'
import {
  GOAL_CELL,
  SPAWN_CELL,
  gridToWorld,
  worldToGrid,
} from '../game/core/gridConfig'
import {
  buildEnemyPath,
  createInitialWaveRuntime,
  recomputeAllEnemyPaths,
  runSimulationTick,
  towerBlockedKeys,
} from '../game/systems/runTick'
import { tryPushStageClear } from '../services/supabase/stageProgressRemote'
import { useProgressStore } from './progressStore'
import type {
  EnemyInst,
  GameStatus,
  ProjectileInst,
  TowerInst,
  TroopInst,
  WaveRuntime,
} from '../game/types'
import type { Difficulty } from './progressStore'

export type PlacementMode = TowerType | 'upgrade' | null

export type SelectedEntity =
  | { kind: 'tower'; id: string }
  | { kind: 'enemy'; id: string }

const STARTING_HP = 20

function starsFromHp(playerHp: number, maxHp: number): 1 | 2 | 3 {
  if (maxHp <= 0) {
    return 1
  }
  if (playerHp >= maxHp) {
    return 3
  }
  if (playerHp >= maxHp * 0.5) {
    return 2
  }
  return 1
}

function getStage(id: number) {
  return getStageById(id)
}

function startingGoldForMenu(stageId: number, difficulty: Difficulty): number {
  const stage = getStage(stageId)
  const mul = difficultyCombatMods(difficulty).startingGoldMul
  return Math.round(stage.startingGold * mul)
}

export type GameStoreState = {
  status: GameStatus
  isGameOver: boolean
  stageCleared: boolean
  playerHp: number
  maxPlayerHp: number
  gold: number
  activeStageId: number
  towers: TowerInst[]
  enemies: EnemyInst[]
  projectiles: ProjectileInst[]
  troops: TroopInst[]
  wave: WaveRuntime
  currentWave: number
  nextWaveIndex: number
  nextEntityId: number
  runStartedAt: number | null
  /** Seconds for last stage clear (for victory modal). */
  lastVictoryTimeSec: number | null
  /** Count of enemy goal leaks this run (for defeat modal). */
  leaksThisRun: number
  /** Frozen from `selectedDifficulty` at run start. */
  runDifficulty: Difficulty
  placementMode: PlacementMode
  /** Inspected tower/enemy for HUD info card. */
  selectedEntity: SelectedEntity | null
  selectEntity: (sel: SelectedEntity | null) => void
  clearSelection: () => void
  upgradeSelectedTower: () => boolean
  tick: (dt: number) => void
  setStatus: (s: GameStatus) => void
  setActiveStageId: (id: number) => void
  syncMenuGold: () => void
  setPlacementMode: (t: PlacementMode) => void
  tryPlaceTowerAtCell: (gx: number, gz: number) => boolean
  tryPlaceTowerAtWorld: (x: number, z: number) => boolean
  startNextWave: () => void
  resetRun: () => void
  returnToMenu: () => void
  /** After victory: load next stage or return to menu if campaign complete. */
  advanceToNextStage: () => void
}

function initialRun(): Omit<
  GameStoreState,
  | 'tick'
  | 'setStatus'
  | 'setActiveStageId'
  | 'syncMenuGold'
  | 'setPlacementMode'
  | 'selectEntity'
  | 'clearSelection'
  | 'upgradeSelectedTower'
  | 'tryPlaceTowerAtCell'
  | 'tryPlaceTowerAtWorld'
  | 'startNextWave'
  | 'resetRun'
  | 'returnToMenu'
  | 'advanceToNextStage'
> {
  return {
    status: 'menu',
    isGameOver: false,
    stageCleared: false,
    playerHp: STARTING_HP,
    maxPlayerHp: STARTING_HP,
    gold: startingGoldForMenu(1, useProgressStore.getState().selectedDifficulty),
    activeStageId: 1,
    towers: [],
    enemies: [],
    projectiles: [],
    troops: [],
    wave: null,
    currentWave: 0,
    nextWaveIndex: 0,
    nextEntityId: 1,
    runStartedAt: null,
    lastVictoryTimeSec: null,
    leaksThisRun: 0,
    runDifficulty: 'normal',
    placementMode: null,
    selectedEntity: null,
  }
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  ...initialRun(),

  tick: (dt) => {
    set((s) => {
      if (s.status !== 'playing' || s.isGameOver) {
        return s
      }
      const stage = getStage(s.activeStageId)
      const hadWave = s.wave !== null
      const wasGameOver = s.isGameOver
      const wasStageCleared = s.stageCleared
      const enemyHpMul = difficultyCombatMods(s.runDifficulty).enemyHpMul
      const out = runSimulationTick({
        towers: s.towers,
        enemies: s.enemies,
        projectiles: s.projectiles,
        troops: s.troops,
        wave: s.wave,
        stageWaves: stage.waves,
        playerHp: s.playerHp,
        gold: s.gold,
        currentWave: s.currentWave,
        nextEntityId: s.nextEntityId,
        enemyHpMul,
        dt,
      })

      const { feelEvents, ...sim } = out
      playFeelEvents(feelEvents)
      const leakDelta = feelEvents.filter((e) => e.type === 'enemy_leak').length

      let nextWaveIndex = s.nextWaveIndex
      if (hadWave && sim.wave === null) {
        nextWaveIndex = s.nextWaveIndex + 1
      }

      const isGameOver = sim.playerHp <= 0
      const stageCleared =
        nextWaveIndex >= stage.waves.length &&
        sim.wave === null &&
        sim.enemies.length === 0

      if (!wasGameOver && isGameOver) {
        getAudioManager().playSfx('gameOver')
      }
      let lastVictoryTimeSec = s.lastVictoryTimeSec
      if (!wasStageCleared && stageCleared) {
        getAudioManager().playSfx('victory')
        const bestTimeSec =
          s.runStartedAt != null ? Math.max(1, Math.floor((Date.now() - s.runStartedAt) / 1000)) : null
        lastVictoryTimeSec = bestTimeSec
        const entry = {
          stageId: s.activeStageId,
          difficulty: s.runDifficulty,
          stars: starsFromHp(sim.playerHp, s.maxPlayerHp),
          bestTimeSec,
        }
        useProgressStore.getState().recordStageClear(entry)
        void tryPushStageClear(entry)
      }

      return {
        ...s,
        ...sim,
        nextWaveIndex,
        isGameOver,
        stageCleared,
        leaksThisRun: s.leaksThisRun + leakDelta,
        lastVictoryTimeSec,
        runStartedAt: stageCleared ? null : s.runStartedAt,
        playerHp: Math.max(0, sim.playerHp),
        status: isGameOver ? ('paused' as const) : s.status,
      }
    })
  },

  setStatus: (status) => set({ status }),

  setActiveStageId: (activeStageId) => {
    const diff = useProgressStore.getState().selectedDifficulty
    set({
      activeStageId,
      gold: startingGoldForMenu(activeStageId, diff),
    })
  },

  syncMenuGold: () =>
    set((s) => {
      if (s.status !== 'menu') {
        return s
      }
      const diff = useProgressStore.getState().selectedDifficulty
      return { gold: startingGoldForMenu(s.activeStageId, diff) }
    }),

  setPlacementMode: (placementMode) => set({ placementMode }),

  selectEntity: (sel) => set({ selectedEntity: sel }),

  clearSelection: () => set({ selectedEntity: null }),

  upgradeSelectedTower: () => {
    const s = get()
    if (s.status !== 'playing' || s.isGameOver) {
      return false
    }
    const sel = s.selectedEntity
    if (sel?.kind !== 'tower') {
      return false
    }
    const tower = s.towers.find((t) => t.id === sel.id)
    if (!tower || tower.upgradeLevel >= 2) {
      return false
    }
    const cfg = getTowerConfig(tower.type)
    const cost = cfg.upgradeCostBase * (tower.upgradeLevel + 1)
    if (s.gold < cost) {
      return false
    }
    getAudioManager().playSfx('build')
    set({
      gold: s.gold - cost,
      towers: s.towers.map((t) =>
        t.id === tower.id ? { ...t, upgradeLevel: t.upgradeLevel + 1 } : t
      ),
      placementMode: null,
    })
    return true
  },

  tryPlaceTowerAtCell: (gx, gz) => {
    const s = get()
    if (s.status !== 'playing' || s.isGameOver) {
      return false
    }

    if (s.placementMode === 'upgrade') {
      const tower = s.towers.find((t) => t.gx === gx && t.gz === gz)
      if (!tower || tower.upgradeLevel >= 2) {
        return false
      }
      const cfg = getTowerConfig(tower.type)
      const cost = cfg.upgradeCostBase * (tower.upgradeLevel + 1)
      if (s.gold < cost) {
        return false
      }
      getAudioManager().playSfx('build')
      set({
        gold: s.gold - cost,
        towers: s.towers.map((t) =>
          t.id === tower.id ? { ...t, upgradeLevel: t.upgradeLevel + 1 } : t
        ),
        placementMode: null,
      })
      return true
    }

    if (!s.placementMode) {
      return false
    }

    const towerType = s.placementMode

    if (gx === SPAWN_CELL.gx && gz === SPAWN_CELL.gz) {
      return false
    }
    if (gx === GOAL_CELL.gx && gz === GOAL_CELL.gz) {
      return false
    }
    if (s.towers.some((t) => t.gx === gx && t.gz === gz)) {
      return false
    }

    const cfg = getTowerConfig(towerType)
    if (s.gold < cfg.baseCost) {
      return false
    }

    const candidate: TowerInst = {
      id: `t-${s.nextEntityId}`,
      type: towerType,
      gx,
      gz,
      cooldown: 0,
      facingY: 0,
      upgradeLevel: 0,
      barracksSpawnCd: towerType === 'barracks' ? 0 : 0,
    }
    const blocked = towerBlockedKeys([...s.towers, candidate])
    if (!buildEnemyPath(blocked)) {
      return false
    }

    const nextId = s.nextEntityId + 1
    getAudioManager().playSfx('build')
    set({
      gold: s.gold - cfg.baseCost,
      towers: [...s.towers, candidate],
      enemies: recomputeAllEnemyPaths([...s.towers, candidate], s.enemies),
      nextEntityId: nextId,
      placementMode: null,
    })
    return true
  },

  tryPlaceTowerAtWorld: (x, z) => {
    const { gx, gz } = worldToGrid(x, z)
    return get().tryPlaceTowerAtCell(gx, gz)
  },

  startNextWave: () => {
    const s = get()
    if (s.status !== 'playing' || s.isGameOver || s.wave !== null) {
      return
    }
    const stage = getStage(s.activeStageId)
    if (s.nextWaveIndex >= stage.waves.length) {
      return
    }
    const wr = createInitialWaveRuntime(s.nextWaveIndex, stage.waves)
    getAudioManager().playSfx('waveStart')
    set({ wave: wr })
  },

  resetRun: () => {
    const s = get()
    const diff = useProgressStore.getState().selectedDifficulty
    set({
      ...initialRun(),
      status: 'playing',
      activeStageId: s.activeStageId,
      gold: startingGoldForMenu(s.activeStageId, diff),
      playerHp: STARTING_HP,
      maxPlayerHp: STARTING_HP,
      nextEntityId: 1,
      runStartedAt: Date.now(),
      lastVictoryTimeSec: null,
      leaksThisRun: 0,
      runDifficulty: diff,
    })
  },

  returnToMenu: () =>
    set((s) => {
      const diff = useProgressStore.getState().selectedDifficulty
      return {
        ...initialRun(),
        status: 'menu',
        nextEntityId: 1,
        runStartedAt: null,
        lastVictoryTimeSec: null,
        leaksThisRun: 0,
        activeStageId: s.activeStageId,
        gold: startingGoldForMenu(s.activeStageId, diff),
        runDifficulty: diff,
      }
    }),

  advanceToNextStage: () => {
    const s = get()
    const diff = useProgressStore.getState().selectedDifficulty
    const idx = ALL_STAGES.findIndex((st) => st.id === s.activeStageId)
    const nextStage = idx >= 0 && idx < ALL_STAGES.length - 1 ? ALL_STAGES[idx + 1] : undefined
    if (!nextStage) {
      return
    }
    set({
      ...initialRun(),
      status: 'playing',
      activeStageId: nextStage.id,
      gold: startingGoldForMenu(nextStage.id, diff),
      playerHp: STARTING_HP,
      maxPlayerHp: STARTING_HP,
      nextEntityId: 1,
      runStartedAt: Date.now(),
      lastVictoryTimeSec: null,
      leaksThisRun: 0,
      runDifficulty: diff,
    })
  },
}))

/** World position for UI highlights (spawn / goal). */
export function getGoalWorldPosition() {
  return gridToWorld(GOAL_CELL.gx, GOAL_CELL.gz)
}

export function getSpawnWorldPosition() {
  return gridToWorld(SPAWN_CELL.gx, SPAWN_CELL.gz)
}

export function getCurrentStageWaves(activeStageId: number) {
  return getStage(activeStageId).waves
}
