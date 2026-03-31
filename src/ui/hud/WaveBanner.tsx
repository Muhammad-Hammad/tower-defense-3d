import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { getStageById } from '../../data/stages'
import { useGameStore } from '../../store/gameStore'

export function WaveBanner() {
  const wave = useGameStore((s) => s.wave)
  const activeStageId = useGameStore((s) => s.activeStageId)
  const el = useRef<HTMLDivElement>(null)

  const stageWaves = getStageById(activeStageId).waves

  useEffect(() => {
    if (!wave || !el.current) {
      return
    }
    gsap.fromTo(
      el.current,
      { opacity: 0, scale: 0.55, y: 24 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: 'back.out(2)',
        yoyo: true,
        repeat: 1,
        repeatDelay: 0.12,
      }
    )
  }, [wave?.waveIndex])

  if (!wave) {
    return null
  }

  const n = stageWaves[wave.waveIndex]?.waveNumber ?? 0

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center pt-14">
      <div
        ref={el}
        className="rounded-xl border border-sky-400/50 bg-slate-950/88 px-10 py-3 text-2xl font-bold tracking-tight text-sky-100 shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
      >
        Wave {n}
      </div>
    </div>
  )
}
