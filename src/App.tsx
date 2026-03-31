import { GameCanvasLazy } from './GameCanvasLazy'
import { useAuthSession } from './hooks/useAuthSession'
import { useGameStore } from './store/gameStore'
import { useProgressStore } from './store/progressStore'
import { useSettingsStore } from './store/settingsStore'
import { DefeatModal } from './ui/overlays/DefeatModal'
import { VictoryModal } from './ui/overlays/VictoryModal'
import { GameHud } from './ui/hud/GameHud'
import { WaveBanner } from './ui/hud/WaveBanner'
import { CloudSync } from './sync/CloudSync'
import { AuthPanel } from './ui/menus/AuthPanel'

function App() {
  const auth = useAuthSession()
  const status = useGameStore((s) => s.status)
  const playerHp = useGameStore((s) => s.playerHp)
  const gold = useGameStore((s) => s.gold)
  const totalStars = useProgressStore((s) => s.totalStars)
  const setShowFps = useSettingsStore((s) => s.setShowFps)
  const showFps = useSettingsStore((s) => s.showFps)
  const stageCleared = useGameStore((s) => s.stageCleared)
  const isGameOver = useGameStore((s) => s.isGameOver)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CloudSync user={auth.user} authLoading={auth.loading} />
      <WaveBanner />
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-slate-800 bg-slate-950/95 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">Tower Defense 3D</h1>
          <p className="text-xs text-slate-500">Phase 9 — biome terrain, scale, end-run modals</p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={showFps}
              onChange={(e) => setShowFps(e.target.checked)}
              className="rounded border-slate-600"
            />
            FPS (dev)
          </label>
          <div className="rounded-md bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Run: <span className="font-mono text-emerald-300">{status}</span> · HP{' '}
            <span className="font-mono text-rose-300">{playerHp}</span> · Gold{' '}
            <span className="font-mono text-amber-300">{gold}</span> · Stars{' '}
            <span className="font-mono text-yellow-200/90">{totalStars}</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-3 md:w-72">
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Account</h2>
            <AuthPanel auth={auth} />
          </div>
          <GameHud />
        </aside>

        <main className="relative min-h-[280px] min-w-0 flex-1 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-inner">
          <GameCanvasLazy />
        </main>
      </div>
      {status !== 'menu' && stageCleared && !isGameOver ? <VictoryModal /> : null}
      {status !== 'menu' && isGameOver ? <DefeatModal /> : null}
    </div>
  )
}

export default App
