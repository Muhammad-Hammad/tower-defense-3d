import { DESERT_STAGES } from './desert'
import { FROZEN_STAGES } from './frozen'
import { GRASSLAND_STAGES } from './grasslands'
import { NIGHTMARE_STAGES } from './nightmare'
import type { StageDef } from './stageDef'
import { VOLCANIC_STAGES } from './volcanic'

export type { StageDef } from './stageDef'
export { GRASSLAND_STAGES } from './grasslands'
export { DESERT_STAGES } from './desert'
export { FROZEN_STAGES } from './frozen'
export { VOLCANIC_STAGES } from './volcanic'
export { NIGHTMARE_STAGES } from './nightmare'

/** All campaign stages in order (1–30). */
export const ALL_STAGES: readonly StageDef[] = [
  ...GRASSLAND_STAGES,
  ...DESERT_STAGES,
  ...FROZEN_STAGES,
  ...VOLCANIC_STAGES,
  ...NIGHTMARE_STAGES,
]

const byId = new Map<number, StageDef>()
for (const s of ALL_STAGES) {
  byId.set(s.id, s)
}

export function getStageById(id: number): StageDef {
  return byId.get(id) ?? ALL_STAGES[0]!
}
