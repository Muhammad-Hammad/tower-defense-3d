import type { EnemyTypeId } from '../../data/enemies'

/** Discrete events emitted by `runSimulationTick` for audio / VFX (no Howler import). */
export type GameFeelEvent =
  | { type: 'tower_fire' }
  | { type: 'enemy_spawn' }
  | { type: 'enemy_leak' }
  | { type: 'enemy_death'; enemyType: EnemyTypeId }
