import { getAudioManager } from '../../game/audio/AudioManager'
import { useGameStore } from '../../store/gameStore'
import { useProgressStore } from '../../store/progressStore'

export function TutorialTip() {
  const status = useGameStore((s) => s.status)
  const tutorialComplete = useProgressStore((s) => s.tutorialComplete)
  const setTutorialComplete = useProgressStore((s) => s.setTutorialComplete)

  if (tutorialComplete || status !== 'menu') {
    return null
  }

  return (
    <div className="rounded-lg border border-sky-500/35 bg-sky-950/50 px-3 py-2 text-xs text-sky-100">
      <p className="font-medium text-sky-200">Quick start</p>
      <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-slate-300">
        <li>Pick difficulty and an unlocked stage.</li>
        <li>Start battle, then use Send next wave when you are ready.</li>
        <li>Place towers on grass — keep a path to the goal.</li>
      </ol>
      <button
        type="button"
        className="mt-2 rounded bg-sky-700 px-2 py-1 text-[11px] font-medium text-white hover:bg-sky-600"
        onClick={() => {
          getAudioManager().playSfx('uiClick')
          setTutorialComplete(true)
        }}
      >
        Got it
      </button>
    </div>
  )
}
