import type { Difficulty, StageProgressEntry } from '../store/progressStore'
import { progressStageKey } from '../store/progressStore'

/** In `npm run dev`, all stages unlock for biome/testing. Production keeps gating. */
const DEV_UNLOCK_ALL = import.meta.env.DEV

export function isStageUnlocked(
  stageId: number,
  difficulty: Difficulty,
  stages: Record<string, StageProgressEntry>
): boolean {
  if (DEV_UNLOCK_ALL) {
    return true
  }
  if (stageId <= 1) {
    return true
  }
  const prev = stages[progressStageKey(stageId - 1, difficulty)]
  return (prev?.stars ?? 0) > 0
}

export function stageStarsFor(
  stageId: number,
  difficulty: Difficulty,
  stages: Record<string, StageProgressEntry>
): number {
  return stages[progressStageKey(stageId, difficulty)]?.stars ?? 0
}
