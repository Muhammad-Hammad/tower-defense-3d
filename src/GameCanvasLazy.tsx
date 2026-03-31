import { lazy, Suspense } from 'react'

const GameCanvas = lazy(async () => {
  const m = await import('./game/core/GameCanvas')
  return { default: m.GameCanvas }
})

function GameCanvasFallback() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-center"
      aria-busy="true"
      aria-label="Loading 3D scene"
    >
      <div className="h-8 w-8 animate-pulse rounded-full border-2 border-emerald-500/40 border-t-emerald-400" />
      <p className="text-xs text-slate-500">Loading scene…</p>
    </div>
  )
}

export function GameCanvasLazy() {
  return (
    <Suspense fallback={<GameCanvasFallback />}>
      <GameCanvas />
    </Suspense>
  )
}
