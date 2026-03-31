import type { BiomeType } from '../biomes'
import type { WaveSpec } from './stagePrototype'

export type StageDef = {
  id: number
  name: string
  biome: BiomeType
  startingGold: number
  waves: WaveSpec[]
}
