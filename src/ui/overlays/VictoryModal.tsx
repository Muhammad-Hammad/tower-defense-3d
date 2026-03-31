import { useEffect, useState } from 'react'
import { ALL_STAGES, getStageById } from '../../data/stages'
import { DIFFICULTY_LABELS } from '../../data/difficulty'
import { getAudioManager } from '../../game/audio/AudioManager'
import { progressStageKey, useProgressStore } from '../../store/progressStore'
import { useGameStore } from '../../store/gameStore'
import type { Difficulty } from '../../store/progressStore'

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

export function VictoryModal() {
  const [visible, setVisible] = useState(false)
  const activeStageId = useGameStore((s) => s.activeStageId)
  const playerHp = useGameStore((s) => s.playerHp)
  const maxPlayerHp = useGameStore((s) => s.maxPlayerHp)
  const gold = useGameStore((s) => s.gold)
  const runDifficulty = useGameStore((s) => s.runDifficulty)
  const lastVictoryTimeSec = useGameStore((s) => s.lastVictoryTimeSec)
  const resetRun = useGameStore((s) => s.resetRun)
  const returnToMenu = useGameStore((s) => s.returnToMenu)
  const advanceToNextStage = useGameStore((s) => s.advanceToNextStage)
  const stagesProgress = useProgressStore((s) => s.stages)

  useEffect(() => {
    setVisible(true)
  }, [])

  const stage = getStageById(activeStageId)
  const stars = starsFromHp(playerHp, maxPlayerHp)
  const lastStage = ALL_STAGES[ALL_STAGES.length - 1]?.id === activeStageId
  const wavesSurvived = stage.waves.length
  const key = progressStageKey(activeStageId, runDifficulty)
  const bestStarsEver = stagesProgress[key]?.stars ?? stars

  const tap = () => getAudioManager().playSfx('uiClick')

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-amber-600/50 bg-slate-950/95 p-6 text-center shadow-2xl">
        <h2 id="victory-title" className="text-3xl font-bold tracking-tight text-amber-300">
          Stage cleared!
        </h2>
        <p className="mt-2 text-lg font-semibold text-white">
          {stage.id}. {stage.name}
        </p>
        <p className="mt-1 text-xs text-slate-400">{DIFFICULTY_LABELS[runDifficulty as Difficulty]}</p>
        <p className="mt-5 text-3xl tracking-widest text-amber-300" aria-label={`${stars} stars`}>
          {'★'.repeat(stars)}
          <span className="text-slate-600">{'★'.repeat(3 - stars)}</span>
        </p>
        <p className="mt-1 text-[10px] text-slate-500">Best on file: {bestStarsEver}★</p>
        <dl className="mt-6 grid grid-cols-2 gap-3 text-left text-sm">
          <div className="rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2">
            <dt className="text-[10px] uppercase tracking-wide text-slate-500">HP left</dt>
            <dd className="font-mono text-emerald-300">
              {playerHp} / {maxPlayerHp}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2">
            <dt className="text-[10px] uppercase tracking-wide text-slate-500">Gold</dt>
            <dd className="font-mono text-amber-300">{gold}</dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2">
            <dt className="text-[10px] uppercase tracking-wide text-slate-500">Waves survived</dt>
            <dd className="font-mono text-sky-300">{wavesSurvived}</dd>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-2">
            <dt className="text-[10px] uppercase tracking-wide text-slate-500">Time</dt>
            <dd className="font-mono text-slate-200">
              {lastVictoryTimeSec != null ? `${lastVictoryTimeSec}s` : '—'}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          {!lastStage ? (
            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
              onClick={() => {
                tap()
                advanceToNextStage()
              }}
            >
              Next stage
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
            onClick={() => {
              tap()
              resetRun()
            }}
          >
            Replay
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700"
            onClick={() => {
              tap()
              returnToMenu()
            }}
          >
            Back to menu
          </button>
        </div>
        {lastStage ? (
          <p className="mt-4 text-xs text-slate-500">Final stage cleared — replay or return to menu.</p>
        ) : null}
      </div>
    </div>
  )
}
