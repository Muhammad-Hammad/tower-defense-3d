import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Difficulty = 'easy' | 'normal' | 'hard'

export type StageProgressEntry = {
  stageId: number
  difficulty: Difficulty
  stars: number
  bestTimeSec: number | null
}

/**
 * Client-side progress mirror before Supabase sync (guest mode + optimistic updates).
 */
export type ProgressState = {
  totalStars: number
  stages: Record<string, StageProgressEntry>
  tutorialComplete: boolean
  /** Active difficulty for new runs and stage unlock checks. */
  selectedDifficulty: Difficulty
  setSelectedDifficulty: (d: Difficulty) => void
  setTutorialComplete: (v: boolean) => void
  recordStageClear: (entry: StageProgressEntry) => void
  /** Replace local progress (e.g. after choosing “use cloud” or merged result). */
  replaceProgressFromEntries: (entries: readonly StageProgressEntry[]) => void
}

export function progressStageKey(stageId: number, difficulty: Difficulty): string {
  return `${stageId}:${difficulty}`
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      totalStars: 0,
      stages: {},
      tutorialComplete: false,
      selectedDifficulty: 'normal',
      setSelectedDifficulty: (selectedDifficulty) => set({ selectedDifficulty }),
      setTutorialComplete: (tutorialComplete) => set({ tutorialComplete }),
      replaceProgressFromEntries: (entries) => {
        const stages: Record<string, StageProgressEntry> = {}
        for (const e of entries) {
          const k = progressStageKey(e.stageId, e.difficulty)
          stages[k] = { ...e }
        }
        const totalStars = Object.values(stages).reduce((acc, s) => acc + s.stars, 0)
        set({ stages, totalStars })
      },
      recordStageClear: (entry) => {
        const key = progressStageKey(entry.stageId, entry.difficulty)
        const prev = get().stages[key]
        const nextStars = Math.max(prev?.stars ?? 0, entry.stars)
        const nextBest =
          entry.bestTimeSec == null
            ? (prev?.bestTimeSec ?? null)
            : prev?.bestTimeSec == null
              ? entry.bestTimeSec
              : Math.min(prev.bestTimeSec, entry.bestTimeSec)

        const stages = {
          ...get().stages,
          [key]: {
            stageId: entry.stageId,
            difficulty: entry.difficulty,
            stars: nextStars,
            bestTimeSec: nextBest,
          },
        }

        const totalStars = Object.values(stages).reduce((acc, s) => acc + s.stars, 0)
        set({ stages, totalStars })
      },
    }),
    { name: 'td3d-progress' }
  )
)
