import { useState } from 'react'
import { BIOME_CONFIG, biomeForStageId, type WeatherKind } from '../../data/biomes'
import { ALL_STAGES, getStageById } from '../../data/stages'
import { DIFFICULTY_LABELS } from '../../data/difficulty'
import { getTowerConfig, towerConfigsList } from '../../data/towers'
import { getAudioManager } from '../../game/audio/AudioManager'
import { isStageUnlocked, stageStarsFor } from '../../meta/stageUnlock'
import type { Difficulty } from '../../store/progressStore'
import { useGameStore } from '../../store/gameStore'
import { useProgressStore } from '../../store/progressStore'
import { StageSelectScreen } from '../menus/StageSelectScreen'
import { TutorialTip } from '../menus/TutorialTip'
import { InfoCard } from './InfoCard'

function tapUi(): void {
  getAudioManager().playSfx('uiClick')
}

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard']

function weatherShort(w: WeatherKind): string {
  switch (w) {
    case 'wind':
      return 'Wind'
    case 'sandstorm':
      return 'Sand'
    case 'snow':
      return 'Snow'
    case 'ash':
      return 'Ash'
    case 'darkfog':
      return 'Fog'
    default: {
      const _exhaustive: never = w
      return _exhaustive
    }
  }
}

export function GameHud() {
  const [stageMapOpen, setStageMapOpen] = useState(false)
  const status = useGameStore((s) => s.status)
  const wave = useGameStore((s) => s.wave)
  const nextWaveIndex = useGameStore((s) => s.nextWaveIndex)
  const gold = useGameStore((s) => s.gold)
  const isGameOver = useGameStore((s) => s.isGameOver)
  const placementMode = useGameStore((s) => s.placementMode)
  const enemies = useGameStore((s) => s.enemies)
  const activeStageId = useGameStore((s) => s.activeStageId)
  const runDifficulty = useGameStore((s) => s.runDifficulty)

  const stagesProgress = useProgressStore((s) => s.stages)
  const selectedDifficulty = useProgressStore((s) => s.selectedDifficulty)
  const setSelectedDifficulty = useProgressStore((s) => s.setSelectedDifficulty)

  const resetRun = useGameStore((s) => s.resetRun)
  const returnToMenu = useGameStore((s) => s.returnToMenu)
  const setPlacementMode = useGameStore((s) => s.setPlacementMode)
  const setActiveStageId = useGameStore((s) => s.setActiveStageId)
  const syncMenuGold = useGameStore((s) => s.syncMenuGold)
  const startNextWave = useGameStore((s) => s.startNextWave)
  const selectedEntity = useGameStore((s) => s.selectedEntity)
  const clearSelection = useGameStore((s) => s.clearSelection)

  const stage = getStageById(activeStageId)
  const biomeId = biomeForStageId(activeStageId)
  const biomeCfg = BIOME_CONFIG[biomeId]
  const wavesTotal = stage.waves.length

  const canStartWave =
    status === 'playing' && !isGameOver && wave === null && nextWaveIndex < wavesTotal
  const waveLabel = wave
    ? `Wave ${stage.waves[wave.waveIndex]?.waveNumber ?? 0} active · ${enemies.length} enemies`
    : nextWaveIndex >= wavesTotal
      ? 'All waves cleared'
      : `Ready: wave ${stage.waves[nextWaveIndex]?.waveNumber ?? nextWaveIndex + 1}`

  return (
    <div className="relative z-40 flex flex-col gap-2 border-t border-slate-800 pt-3 text-left">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Campaign · {biomeCfg.label}{' '}
        <span className="text-slate-600">({weatherShort(biomeCfg.weather)})</span>
      </h2>

      {status === 'menu' ? (
        <div className="flex flex-col gap-2">
          <TutorialTip />
          <div className="flex flex-wrap gap-1">
            <span className="self-center text-[10px] text-slate-500">Difficulty</span>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                  selectedDifficulty === d
                    ? 'bg-amber-700 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                onClick={() => {
                  tapUi()
                  setSelectedDifficulty(d)
                  const prog = useProgressStore.getState().stages
                  const currentId = useGameStore.getState().activeStageId
                  if (!isStageUnlocked(currentId, d, prog)) {
                    const first = ALL_STAGES.find((s) => isStageUnlocked(s.id, d, prog))?.id ?? 1
                    setActiveStageId(first)
                  } else {
                    syncMenuGold()
                  }
                }}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-slate-500">
            Open the 3D map to pick a biome and stage plate. Gold reflects the selected stage.
          </p>
          <button
            type="button"
            className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700"
            onClick={() => {
              tapUi()
              setStageMapOpen(true)
            }}
          >
            Open stage map
          </button>
          {stageMapOpen ? (
            <StageSelectScreen
              fullscreen
              onClose={() => setStageMapOpen(false)}
              activeStageId={activeStageId}
              setActiveStageId={setActiveStageId}
              selectedDifficulty={selectedDifficulty}
              stagesProgress={stagesProgress}
              onTapUi={tapUi}
            />
          ) : null}

          <p className="text-[10px] text-slate-500">
            Selected:{' '}
            <span className="text-slate-300">
              {stage.id}. {stage.name} · {stage.startingGold}g ·{' '}
              {isStageUnlocked(activeStageId, selectedDifficulty, stagesProgress)
                ? `${stageStarsFor(activeStageId, selectedDifficulty, stagesProgress)}★`
                : 'locked'}
            </span>
          </p>
          <p className="text-[10px] text-slate-500">
            Unlock: clear prior stage on this difficulty (≥1★). Easier modes give more starting gold;
            Harder spawns tougher creeps.
          </p>
          <button
            type="button"
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!isStageUnlocked(activeStageId, selectedDifficulty, stagesProgress)}
            onClick={() => {
              tapUi()
              resetRun()
            }}
          >
            Start battle
          </button>
        </div>
      ) : null}

      {status === 'playing' || status === 'paused' ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-slate-300">
            {biomeCfg.label} · {stage.id}. {stage.name}{' '}
            <span className="text-slate-500">({DIFFICULTY_LABELS[runDifficulty]})</span>{' '}
            <span className="text-slate-600">· {weatherShort(biomeCfg.weather)}</span>
          </p>
          <p className="text-xs text-slate-400">{waveLabel}</p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canStartWave}
              className="rounded-md bg-sky-700 px-2 py-1.5 text-xs font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => {
                tapUi()
                startNextWave()
              }}
            >
              Send next wave
            </button>
            <button
              type="button"
              className={`rounded-md px-2 py-1.5 text-xs font-medium ${
                placementMode === 'upgrade'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
              }`}
              onClick={() => {
                tapUi()
                clearSelection()
                setPlacementMode(placementMode === 'upgrade' ? null : 'upgrade')
              }}
            >
              Upgrade (click tower)
            </button>
          </div>

          {selectedEntity ? (
            <InfoCard />
          ) : (
            <div className="max-h-40 overflow-y-auto rounded border border-slate-800/80 bg-slate-950/40 p-1.5">
              <div className="flex flex-wrap gap-1">
                {towerConfigsList.map((cfg) => (
                  <button
                    key={cfg.type}
                    type="button"
                    disabled={gold < cfg.baseCost}
                    className={`rounded px-1.5 py-1 text-[10px] font-medium leading-tight ${
                      placementMode === cfg.type
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                    onClick={() => {
                      tapUi()
                      clearSelection()
                      setPlacementMode(placementMode === cfg.type ? null : cfg.type)
                    }}
                    title={cfg.name}
                  >
                    {cfg.name} · {cfg.baseCost}g
                  </button>
                ))}
              </div>
            </div>
          )}

          {placementMode != null && placementMode !== 'upgrade' ? (
            <p className="text-xs text-amber-200/90">
              Placing {getTowerConfig(placementMode).name}. Click terrain; path to goal must stay open.
            </p>
          ) : null}
          {placementMode === 'upgrade' ? (
            <p className="text-xs text-amber-200/90">
              Click an existing tower to upgrade (max ×3, +22% dmg / level).
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="self-start text-xs text-slate-500 underline hover:text-slate-300"
              onClick={() => {
                tapUi()
                returnToMenu()
              }}
            >
              Back to menu
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
