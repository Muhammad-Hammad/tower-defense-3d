import type { Difficulty } from '../store/progressStore'

export type DifficultyMods = {
  /** Multiplier applied to enemy `maxHp` on spawn (and splitter runts). */
  enemyHpMul: number
  /** Multiplier for stage `startingGold` in menu / run start. */
  startingGoldMul: number
}

export function difficultyCombatMods(d: Difficulty): DifficultyMods {
  switch (d) {
    case 'easy':
      return { enemyHpMul: 0.88, startingGoldMul: 1.12 }
    case 'hard':
      return { enemyHpMul: 1.18, startingGoldMul: 0.9 }
    default:
      return { enemyHpMul: 1, startingGoldMul: 1 }
  }
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
}
