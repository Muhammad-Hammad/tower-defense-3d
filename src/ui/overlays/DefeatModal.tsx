import { useEffect, useState } from 'react'
import { getStageById } from '../../data/stages'
import { DIFFICULTY_LABELS } from '../../data/difficulty'
import { getAudioManager } from '../../game/audio/AudioManager'
import { useGameStore } from '../../store/gameStore'
import type { Difficulty } from '../../store/progressStore'

export function DefeatModal() {
  const [visible, setVisible] = useState(false)
  const activeStageId = useGameStore((s) => s.activeStageId)
  const nextWaveIndex = useGameStore((s) => s.nextWaveIndex)
  const wave = useGameStore((s) => s.wave)
  const runDifficulty = useGameStore((s) => s.runDifficulty)
  const leaksThisRun = useGameStore((s) => s.leaksThisRun)
  const resetRun = useGameStore((s) => s.resetRun)
  const returnToMenu = useGameStore((s) => s.returnToMenu)

  useEffect(() => {
    setVisible(true)
  }, [])

  const stage = getStageById(activeStageId)
  const waveReach =
    wave != null
      ? (stage.waves[wave.waveIndex]?.waveNumber ?? wave.waveIndex + 1)
      : Math.max(1, nextWaveIndex)

  const tap = () => getAudioManager().playSfx('uiClick')

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="defeat-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-rose-800/60 bg-slate-950/95 p-6 text-center shadow-2xl">
        <h2 id="defeat-title" className="text-3xl font-bold text-rose-400">
          Defeat
        </h2>
        <p className="mt-2 text-sm text-slate-400">Base destroyed</p>
        <p className="mt-1 text-xs text-slate-500">
          {stage.id}. {stage.name} · {DIFFICULTY_LABELS[runDifficulty as Difficulty]}
        </p>
        <p className="mt-6 text-sm text-slate-300">
          Wave reached:{' '}
          <span className="font-mono text-lg text-rose-200">{waveReach}</span>
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Enemies leaked: <span className="font-mono text-rose-200/90">{leaksThisRun}</span>
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
            onClick={() => {
              tap()
              resetRun()
            }}
          >
            Retry
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
      </div>
    </div>
  )
}
