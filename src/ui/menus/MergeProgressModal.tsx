import type { StageProgressEntry } from '../../store/progressStore'

export type MergeChoice = 'local' | 'remote' | 'merge'

export type MergeProgressModalProps = {
  open: boolean
  remoteCount: number
  localCount: number
  onChoose: (choice: MergeChoice) => void
}

export function MergeProgressModal({ open, remoteCount, localCount, onChoose }: MergeProgressModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="merge-title"
        className="max-w-md rounded-xl border border-amber-500/40 bg-slate-900 px-5 py-4 text-slate-100 shadow-xl"
      >
        <h2 id="merge-title" className="text-base font-semibold text-amber-100">
          Sync stage progress
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          This device has <span className="font-mono text-emerald-300">{localCount}</span> cleared-stage
          entries and your account has <span className="font-mono text-sky-300">{remoteCount}</span>. Choose
          how to combine them.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            className="rounded-lg bg-sky-700 px-3 py-2 text-left text-sm font-medium text-white hover:bg-sky-600"
            onClick={() => onChoose('remote')}
          >
            Use cloud only — overwrite this device
          </button>
          <button
            type="button"
            className="rounded-lg bg-emerald-700 px-3 py-2 text-left text-sm font-medium text-white hover:bg-emerald-600"
            onClick={() => onChoose('local')}
          >
            Keep this device — overwrite cloud
          </button>
          <button
            type="button"
            className="rounded-lg bg-amber-700 px-3 py-2 text-left text-sm font-medium text-white hover:bg-amber-600"
            onClick={() => onChoose('merge')}
          >
            Merge — best stars and fastest time per stage, then upload
          </button>
        </div>
      </div>
    </div>
  )
}

export function countProgressEntries(stages: Record<string, StageProgressEntry>): number {
  return Object.values(stages).filter((s) => s.stars > 0).length
}
