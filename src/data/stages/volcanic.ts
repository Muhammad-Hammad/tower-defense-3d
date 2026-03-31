import type { EnemyTypeId } from '../enemies'
import type { WaveSpec } from './stagePrototype'
import type { StageDef } from './stageDef'

function wave(
  waveNumber: number,
  groups: readonly {
    enemyId: EnemyTypeId
    count: number
    spawnInterval: number
    startDelay: number
  }[]
): WaveSpec {
  return { waveNumber, groups: [...groups] }
}

/** Volcanic acts 21–25 — kamikaze, tanks, splitters. */
export const VOLCANIC_STAGES: readonly StageDef[] = [
  {
    id: 21,
    name: 'Ash Path',
    biome: 'volcanic',
    startingGold: 780,
    waves: [
      wave(1, [{ enemyId: 'kamikaze', count: 10, spawnInterval: 0.35, startDelay: 0.1 }]),
      wave(2, [{ enemyId: 'grunt', count: 14, spawnInterval: 0.3, startDelay: 0.08 }]),
      wave(3, [{ enemyId: 'tank', count: 2, spawnInterval: 1.18, startDelay: 0.15 }]),
    ],
  },
  {
    id: 22,
    name: 'Cinder Field',
    biome: 'volcanic',
    startingGold: 800,
    waves: [
      wave(1, [
        { enemyId: 'runner', count: 14, spawnInterval: 0.26, startDelay: 0.08 },
        { enemyId: 'kamikaze', count: 6, spawnInterval: 0.4, startDelay: 0.35 },
      ]),
      wave(2, [{ enemyId: 'splitter', count: 7, spawnInterval: 0.6, startDelay: 0.1 }]),
      wave(3, [{ enemyId: 'armored', count: 10, spawnInterval: 0.46, startDelay: 0.1 }]),
    ],
  },
  {
    id: 23,
    name: 'Magma Throat',
    biome: 'volcanic',
    startingGold: 820,
    waves: [
      wave(1, [{ enemyId: 'brute', count: 3, spawnInterval: 1.55, startDelay: 0.18 }]),
      wave(2, [
        { enemyId: 'flyer', count: 13, spawnInterval: 0.36, startDelay: 0.1 },
        { enemyId: 'wraith', count: 5, spawnInterval: 0.8, startDelay: 0.42 },
      ]),
      wave(3, [{ enemyId: 'tank', count: 3, spawnInterval: 1.05, startDelay: 0.12 }]),
    ],
  },
  {
    id: 24,
    name: 'Ember Ridge',
    biome: 'volcanic',
    startingGold: 840,
    waves: [
      wave(1, [
        { enemyId: 'medic', count: 8, spawnInterval: 0.52, startDelay: 0.12 },
        { enemyId: 'grunt', count: 16, spawnInterval: 0.28, startDelay: 0.25 },
      ]),
      wave(2, [{ enemyId: 'kamikaze', count: 12, spawnInterval: 0.32, startDelay: 0.1 }]),
      wave(3, [
        { enemyId: 'splitter', count: 8, spawnInterval: 0.55, startDelay: 0.1 },
        { enemyId: 'tank', count: 3, spawnInterval: 1.08, startDelay: 0.55 },
      ]),
    ],
  },
  {
    id: 25,
    name: 'Caldera',
    biome: 'volcanic',
    startingGold: 880,
    waves: [
      wave(1, [
        { enemyId: 'runner', count: 16, spawnInterval: 0.24, startDelay: 0.08 },
        { enemyId: 'kamikaze', count: 10, spawnInterval: 0.34, startDelay: 0.28 },
      ]),
      wave(2, [
        { enemyId: 'brute', count: 4, spawnInterval: 1.45, startDelay: 0.15 },
        { enemyId: 'wraith', count: 6, spawnInterval: 0.72, startDelay: 0.55 },
      ]),
      wave(3, [
        { enemyId: 'tank', count: 4, spawnInterval: 1, startDelay: 0.1 },
        { enemyId: 'flyer', count: 15, spawnInterval: 0.32, startDelay: 0.45 },
        { enemyId: 'medic', count: 7, spawnInterval: 0.52, startDelay: 0.85 },
      ]),
    ],
  },
]
