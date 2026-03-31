import type { GameFeelEvent } from '../audio/feelEvents'
import type { EnemyTypeId } from '../../data/enemies'
import { enemyConfigs } from '../../data/enemies'
import type { WaveSpec } from '../../data/stages/stagePrototype'
import { expandWaveToSpawnEvents } from '../../data/stages/stagePrototype'
import {
  getTowerConfig,
  scaledAttackSpeed,
  scaledTowerDamage,
  scaledTowerRange,
} from '../../data/towers'
import { gridToWorld, vecDist, vecDistSq, type GridCell, type Vec2 } from '../core/gridConfig'
import type { EnemyInst, ProjectileInst, TowerInst, TroopInst, WaveRuntime } from '../types'
import { applyHitDamage } from './combatMath'
import {
  buildEnemyPath,
  nearestPathCellToTower,
  towerBlockedKeys,
} from './pathingUtils'
import { stepAirEnemy } from './combatMath'

const REACH_EPS = 0.2
const PROJ_HIT_R = 0.55
const MORTAR_HIT_R = 0.35
const MAGE_CHAIN_FALL = 0.55
const CANNON_SPLASH_FALL = 0.62
const MEDIC_HEAL_RANGE = 2.85
const MEDIC_HEAL_RANGE_SQ = MEDIC_HEAL_RANGE * MEDIC_HEAL_RANGE
const TROOP_MOVE_SPEED = 4.1
const TROOP_ATTACK_CD = 0.52

export { buildEnemyPath, towerBlockedKeys } from './pathingUtils'
export { recomputeAllEnemyPaths } from './pathingUtils'

function spawnEnemy(id: string, type: EnemyTypeId, path: GridCell[], enemyHpMul: number): EnemyInst | null {
  if (path.length < 2) {
    return null
  }
  const cfg = enemyConfigs[type]
  const maxHp = Math.max(1, Math.round(cfg.maxHp * enemyHpMul))
  const p0 = gridToWorld(path[0].gx, path[0].gz)
  const pathMode = cfg.canFly ? 'air' : 'ground'
  return {
    id,
    type,
    hp: maxHp,
    maxHp,
    path,
    waypointIndex: 1,
    pos: { x: p0.x, z: p0.z },
    pathMode,
    revealed: !cfg.invisible,
    slowMul: 1,
    slowTimer: 0,
  }
}

function stepGroundEnemy(e: EnemyInst, dt: number, freezeAuraMul: number): { enemy: EnemyInst; leaked: boolean } {
  if (e.waypointIndex >= e.path.length) {
    return { enemy: e, leaked: true }
  }

  const targetCell = e.path[e.waypointIndex]!
  const target: Vec2 = gridToWorld(targetCell.gx, targetCell.gz)
  const dx = target.x - e.pos.x
  const dz = target.z - e.pos.z
  const cfg = enemyConfigs[e.type]
  const dist = vecDist(e.pos, target)
  const spd = cfg.speed * e.slowMul * freezeAuraMul * dt

  if (dist <= REACH_EPS) {
    const nextIndex = e.waypointIndex + 1
    if (nextIndex >= e.path.length) {
      return { enemy: { ...e, pos: target, waypointIndex: nextIndex }, leaked: true }
    }
    return { enemy: { ...e, pos: target, waypointIndex: nextIndex }, leaked: false }
  }

  if (spd >= dist) {
    const nextIndex = e.waypointIndex + 1
    const nextEnemy: EnemyInst = { ...e, pos: target, waypointIndex: nextIndex }
    if (nextIndex >= e.path.length) {
      return { enemy: nextEnemy, leaked: true }
    }
    return { enemy: nextEnemy, leaked: false }
  }

  return {
    enemy: {
      ...e,
      pos: {
        x: e.pos.x + (dx / dist) * spd,
        z: e.pos.z + (dz / dist) * spd,
      },
    },
    leaked: false,
  }
}

function towerWorld(t: TowerInst): Vec2 {
  return gridToWorld(t.gx, t.gz)
}

function freezeAuraMulAt(pos: Vec2, towers: TowerInst[]): number {
  let f = 1
  for (const t of towers) {
    if (t.type !== 'freeze') {
      continue
    }
    const cfg = getTowerConfig('freeze')
    const r = scaledTowerRange(cfg, t.upgradeLevel)
    const d = vecDistSq(pos, towerWorld(t))
    if (d <= r * r) {
      f = Math.min(f, cfg.freezeSlow)
    }
  }
  return f
}

function applyMedicHeals(enemies: EnemyInst[], dt: number): EnemyInst[] {
  if (enemies.length < 2 || dt <= 0) {
    return enemies
  }
  const buf = enemies.slice()

  for (let i = 0; i < buf.length; i += 1) {
    const medic = buf[i]!
    const mcfg = enemyConfigs[medic.type]
    if (mcfg.healPerSec <= 0) {
      continue
    }
    for (let j = 0; j < buf.length; j += 1) {
      if (j === i) {
        continue
      }
      const o = buf[j]!
      if (vecDistSq(medic.pos, o.pos) > MEDIC_HEAL_RANGE_SQ) {
        continue
      }
      buf[j] = { ...o, hp: Math.min(o.maxHp, o.hp + mcfg.healPerSec * dt) }
    }
  }
  return buf
}

function applyTeslaSlow(
  enemies: EnemyInst[],
  enemyId: string,
  slowMul: number,
  duration: number
): EnemyInst[] {
  return enemies.map((e) => {
    if (e.id !== enemyId) {
      return e
    }
    return {
      ...e,
      slowMul: Math.min(e.slowMul, slowMul),
      slowTimer: Math.max(e.slowTimer, duration),
    }
  })
}

function troopTargetsEnemy(e: EnemyInst): boolean {
  return !enemyConfigs[e.type].canFly
}

export function createInitialWaveRuntime(
  waveIndex: number,
  stageWaves: readonly WaveSpec[]
): WaveRuntime {
  const spec = stageWaves[waveIndex]
  if (!spec) {
    return null
  }
  return {
    waveIndex,
    events: expandWaveToSpawnEvents(spec),
    elapsed: 0,
    nextEventIndex: 0,
    finishedSpawning: false,
  }
}

export type TickInput = {
  towers: TowerInst[]
  enemies: EnemyInst[]
  projectiles: ProjectileInst[]
  troops: TroopInst[]
  wave: WaveRuntime
  stageWaves: readonly WaveSpec[]
  playerHp: number
  gold: number
  currentWave: number
  nextEntityId: number
  /** From active difficulty (easy below 1, hard above 1). */
  enemyHpMul: number
  dt: number
}

export type TickOutput = {
  towers: TowerInst[]
  enemies: EnemyInst[]
  projectiles: ProjectileInst[]
  troops: TroopInst[]
  wave: WaveRuntime
  playerHp: number
  gold: number
  currentWave: number
  nextEntityId: number
  feelEvents: GameFeelEvent[]
}

export function runSimulationTick(input: TickInput): TickOutput {
  const feelEvents: GameFeelEvent[] = []
  const dt = input.dt
  const { stageWaves, enemyHpMul } = input
  let {
    towers,
    enemies,
    projectiles,
    troops,
    wave,
    playerHp,
    gold,
    currentWave,
    nextEntityId,
  } = input

  if (wave) {
    const elapsed = wave.elapsed + dt
    let nextIdx = wave.nextEventIndex
    const blocked = towerBlockedKeys(towers)

    while (nextIdx < wave.events.length && wave.events[nextIdx]!.at <= elapsed) {
      const ev = wave.events[nextIdx]!
      nextIdx += 1
      const path = buildEnemyPath(blocked)
      if (path) {
        const spawned = spawnEnemy(`e-${nextEntityId}`, ev.enemyId, path, enemyHpMul)
        nextEntityId += 1
        if (spawned) {
          enemies = [...enemies, spawned]
          feelEvents.push({ type: 'enemy_spawn' })
        }
      }
    }

    const finishedSpawning = nextIdx >= wave.events.length
    const waveNext: WaveRuntime = {
      ...wave,
      elapsed,
      nextEventIndex: nextIdx,
      finishedSpawning,
    }

    if (finishedSpawning && enemies.length === 0) {
      const cleared = stageWaves[wave.waveIndex]
      currentWave = cleared?.waveNumber ?? currentWave
      wave = null
    } else {
      wave = waveNext
    }
  }

  enemies = enemies.map((e) => {
    const slowTimer = Math.max(0, e.slowTimer - dt)
    const slowMul = slowTimer <= 0 ? 1 : e.slowMul
    return { ...e, slowTimer, slowMul }
  })

  let leakDamage = 0
  const moved: EnemyInst[] = []
  for (const e of enemies) {
    const fra = freezeAuraMulAt(e.pos, towers)
    const step =
      e.pathMode === 'air'
        ? stepAirEnemy({ ...e, pos: e.pos }, dt)
        : stepGroundEnemy(e, dt, fra)
    const { enemy: nextE, leaked } = step
    if (leaked) {
      leakDamage += enemyConfigs[nextE.type].leakPlayerDamage
    } else {
      moved.push(nextE)
    }
  }
  enemies = moved
  playerHp -= leakDamage
  if (leakDamage > 0) {
    feelEvents.push({ type: 'enemy_leak' })
  }

  enemies = applyMedicHeals(enemies, dt)

  if (leakDamage > 0) {
    const alive = new Set(enemies.map((e) => e.id))
    projectiles = projectiles.filter(
      (p) => p.kind === 'mortar' || (p.targetEnemyId != null && alive.has(p.targetEnemyId))
    )
  }

  const newProjectiles: ProjectileInst[] = []
  const newTroops: TroopInst[] = []

  towers = towers.map((t) => {
    const cfg = getTowerConfig(t.type)
    const origin = towerWorld(t)

    if (t.type === 'freeze') {
      return t
    }

    if (t.type === 'barracks') {
      let cd = Math.max(0, t.barracksSpawnCd - dt)
      const alivePath = buildEnemyPath(towerBlockedKeys(towers))
      const aliveMyTroops = troops.filter((tr) => tr.ownerTowerId === t.id).length
      if (alivePath && cd <= 0 && aliveMyTroops < cfg.barracksCap) {
        const cell = nearestPathCellToTower(t.gx, t.gz, alivePath)
        if (cell) {
          const w = gridToWorld(cell.gx, cell.gz)
          newTroops.push({
            id: `tr-${nextEntityId}`,
            ownerTowerId: t.id,
            pos: { x: w.x, z: w.z },
            hp: cfg.troopHp,
            maxHp: cfg.troopHp,
            damage: cfg.troopDamage,
            attackCooldown: 0,
            facingY: t.facingY,
          })
          nextEntityId += 1
          cd = cfg.barracksInterval
          feelEvents.push({ type: 'enemy_spawn' })
        }
      }
      return { ...t, barracksSpawnCd: cd }
    }

    let cd = Math.max(0, t.cooldown - dt)
    const range = scaledTowerRange(cfg, t.upgradeLevel)
    const rangeSq = range * range
    let pick: EnemyInst | null = null
    let best = Infinity
    for (const e of enemies) {
      const d = vecDistSq(origin, e.pos)
      if (d <= rangeSq && d < best) {
        best = d
        pick = e
      }
    }

    const facingY =
      pick != null ? Math.atan2(pick.pos.x - origin.x, pick.pos.z - origin.z) : t.facingY

    if (!pick || cd > 0) {
      return { ...t, cooldown: cd, facingY }
    }

    const atkSpd = scaledAttackSpeed(cfg, t.upgradeLevel)
    cd = atkSpd > 0 ? 1 / atkSpd : 999

    let rawDmg = scaledTowerDamage(cfg, t.upgradeLevel)
    if (cfg.critChance > 0 && Math.random() < cfg.critChance) {
      rawDmg *= cfg.critMultiplier
    }

    if (t.type === 'mortar' && pick) {
      newProjectiles.push({
        id: `p-${nextEntityId}`,
        damage: rawDmg,
        damageKind: cfg.damageKind,
        speed: cfg.mortarSpeed,
        pos: { x: origin.x, z: origin.z + 0.35 },
        targetEnemyId: null,
        kind: 'mortar',
        splashRadius: cfg.splashRadius,
        towerSourceType: t.type,
        impactPos: { ...pick.pos },
      })
      nextEntityId += 1
      feelEvents.push({ type: 'tower_fire' })
      return { ...t, cooldown: cd, facingY }
    }

    if (pick) {
      newProjectiles.push({
        id: `p-${nextEntityId}`,
        damage: rawDmg,
        damageKind: cfg.damageKind,
        speed: 32,
        pos: { x: origin.x, z: origin.z + 0.35 },
        targetEnemyId: pick.id,
        kind: 'seeking',
        splashRadius: cfg.splashRadius,
        towerSourceType: t.type,
      })
      nextEntityId += 1
      feelEvents.push({ type: 'tower_fire' })
    }

    return { ...t, cooldown: cd, facingY }
  })

  if (newTroops.length) {
    troops = [...troops, ...newTroops]
  }

  if (newProjectiles.length) {
    projectiles = [...projectiles, ...newProjectiles]
  }

  const aliveIds = new Set(enemies.map((e) => e.id))
  const kept: ProjectileInst[] = []

  const splashOthers = (
    center: Vec2,
    radius: number,
    primaryId: string | null,
    dmg: number,
    kind: import('../../data/damageKinds').DamageKind
  ) => {
    const rSq = radius * radius
    const snapshot = enemies.slice()
    for (const e of snapshot) {
      if (primaryId != null && e.id === primaryId) {
        continue
      }
      if (!aliveIds.has(e.id)) {
        continue
      }
      if (vecDistSq(center, e.pos) > rSq) {
        continue
      }
      const snap = Math.round(dmg)
      const r = applyHitDamage(enemies, e.id, snap, kind, gold, nextEntityId, towers, enemyHpMul)
      enemies = r.enemies
      gold = r.gold
      nextEntityId = r.nextId
      feelEvents.push(...r.feelEvents)
      aliveIds.clear()
      enemies.forEach((x) => aliveIds.add(x.id))
    }
  }

  const mageChain = (fromPos: Vec2, primaryId: string, chainR: number, chainDmg: number) => {
    const rSq = chainR * chainR
    const snapDmg = Math.round(chainDmg)
    let chained = 0
    const snapshot = enemies.slice()
    for (const e of snapshot) {
      if (e.id === primaryId || !aliveIds.has(e.id)) {
        continue
      }
      if (vecDistSq(fromPos, e.pos) > rSq) {
        continue
      }
      const r = applyHitDamage(enemies, e.id, snapDmg, 'magic', gold, nextEntityId, towers, enemyHpMul)
      enemies = r.enemies
      gold = r.gold
      nextEntityId = r.nextId
      feelEvents.push(...r.feelEvents)
      aliveIds.clear()
      enemies.forEach((x) => aliveIds.add(x.id))
      chained += 1
      if (chained >= 4) {
        break
      }
    }
  }

  const mortarSplashAt = (ip: Vec2, p: ProjectileInst) => {
    const rSq = p.splashRadius * p.splashRadius
    const snapshot = enemies.slice()
    for (const e of snapshot) {
      if (!aliveIds.has(e.id)) {
        continue
      }
      if (vecDistSq(ip, e.pos) > rSq) {
        continue
      }
      const hr = applyHitDamage(
        enemies,
        e.id,
        Math.round(p.damage),
        p.damageKind,
        gold,
        nextEntityId,
        towers,
        enemyHpMul
      )
      enemies = hr.enemies
      gold = hr.gold
      nextEntityId = hr.nextId
      feelEvents.push(...hr.feelEvents)
      aliveIds.clear()
      enemies.forEach((x) => aliveIds.add(x.id))
    }
  }

  for (const p of projectiles) {
    if (p.kind === 'seeking') {
      if (!p.targetEnemyId || !aliveIds.has(p.targetEnemyId)) {
        continue
      }
    }

    if (p.kind === 'mortar') {
      const ip = p.impactPos
      if (!ip) {
        continue
      }
      const dist = vecDist(p.pos, ip)
      const dx = ip.x - p.pos.x
      const dz = ip.z - p.pos.z
      const len = Math.hypot(dx, dz)
      const step = p.speed * dt
      if (dist <= MORTAR_HIT_R || len <= step) {
        mortarSplashAt(ip, p)
        continue
      }
      kept.push({
        ...p,
        pos: { x: p.pos.x + (dx / len) * step, z: p.pos.z + (dz / len) * step },
      })
      continue
    }

    const target = enemies.find((e) => e.id === p.targetEnemyId)
    if (!target) {
      continue
    }

    const dist = vecDist(p.pos, target.pos)
    const hit = dist <= PROJ_HIT_R

    const advanceSeeking = () => {
      const dx = target.pos.x - p.pos.x
      const dz = target.pos.z - p.pos.z
      const len = Math.hypot(dx, dz)
      const step = p.speed * dt
      if (len <= step) {
        return { ...p, pos: { ...target.pos } }
      }
      return {
        ...p,
        pos: { x: p.pos.x + (dx / len) * step, z: p.pos.z + (dz / len) * step },
      }
    }

    if (!hit) {
      kept.push(advanceSeeking())
      continue
    }

    const src = p.towerSourceType
    const srcCfg = getTowerConfig(src)

    const hitResult = applyHitDamage(
      enemies,
      target.id,
      Math.round(p.damage),
      p.damageKind,
      gold,
      nextEntityId,
      towers,
      enemyHpMul
    )
    enemies = hitResult.enemies
    gold = hitResult.gold
    nextEntityId = hitResult.nextId
    feelEvents.push(...hitResult.feelEvents)
    aliveIds.clear()
    enemies.forEach((e) => aliveIds.add(e.id))

    if (src === 'tesla' && enemies.some((e) => e.id === target.id)) {
      enemies = applyTeslaSlow(
        enemies,
        target.id,
        srcCfg.teslaSlow,
        srcCfg.teslaSlowDuration
      )
    }

    if (src === 'cannon' && p.splashRadius > 0) {
      splashOthers(
        target.pos,
        p.splashRadius,
        target.id,
        p.damage * CANNON_SPLASH_FALL,
        p.damageKind
      )
    }

    if (src === 'mage' && srcCfg.chainRadius > 0) {
      mageChain(
        target.pos,
        target.id,
        srcCfg.chainRadius,
        p.damage * srcCfg.chainDamageFactor * MAGE_CHAIN_FALL
      )
    }
  }

  projectiles = kept

  const nextTroops: TroopInst[] = []
  for (const tr of troops) {
    let trNext = { ...tr }
    const owner = towers.find((x) => x.id === tr.ownerTowerId)

    if (!owner || owner.type !== 'barracks') {
      continue
    }
    const ocfg = getTowerConfig('barracks')
    const trRange = ocfg.troopRange
    const trRangeSq = trRange * trRange

    let target: EnemyInst | null = null
    let bestT = Infinity
    for (const e of enemies) {
      if (!troopTargetsEnemy(e)) {
        continue
      }
      const d = vecDistSq(tr.pos, e.pos)
      if (d < bestT) {
        bestT = d
        target = e
      }
    }

    if (!target) {
      trNext.attackCooldown = Math.max(0, tr.attackCooldown - dt)
      nextTroops.push(trNext)
      continue
    }

    if (bestT <= trRangeSq) {
      let acd = Math.max(0, tr.attackCooldown - dt)
      const fy = Math.atan2(target.pos.x - tr.pos.x, target.pos.z - tr.pos.z)
      trNext = { ...trNext, facingY: fy }
      if (acd <= 0) {
        const hr = applyHitDamage(
          enemies,
          target.id,
          Math.round(tr.damage),
          'physical',
          gold,
          nextEntityId,
          towers,
          enemyHpMul
        )
        enemies = hr.enemies
        gold = hr.gold
        nextEntityId = hr.nextId
        feelEvents.push(...hr.feelEvents)
        aliveIds.clear()
        enemies.forEach((e) => aliveIds.add(e.id))
        acd = TROOP_ATTACK_CD
      }
      trNext.attackCooldown = acd
      nextTroops.push(trNext)
      continue
    }

    const dx = target.pos.x - tr.pos.x
    const dz = target.pos.z - tr.pos.z
    const len = Math.hypot(dx, dz)
    const step = TROOP_MOVE_SPEED * dt
    if (len > step) {
      const fy = Math.atan2(dx, dz)
      trNext = {
        ...trNext,
        pos: { x: tr.pos.x + (dx / len) * step, z: tr.pos.z + (dz / len) * step },
        facingY: fy,
        attackCooldown: Math.max(0, tr.attackCooldown - dt),
      }
    } else {
      trNext = {
        ...trNext,
        pos: { ...target.pos },
        attackCooldown: Math.max(0, tr.attackCooldown - dt),
      }
    }
    nextTroops.push(trNext)
  }
  troops = nextTroops

  return {
    towers,
    enemies,
    projectiles,
    troops,
    wave,
    playerHp,
    gold,
    currentWave,
    nextEntityId,
    feelEvents,
  }
}
