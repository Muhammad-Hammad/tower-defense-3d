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

/** Desert acts 11–15 — heat, runners, flyers. */
export const DESERT_STAGES: readonly StageDef[] = [
  {
    id: 11,
    name: 'Dune Gate',
    biome: 'desert',
    startingGold: 500,
    waves: [
      wave(1, [{ enemyId: 'runner', count: 10, spawnInterval: 0.32, startDelay: 0.1 }]),
      wave(2, [{ enemyId: 'grunt', count: 12, spawnInterval: 0.38, startDelay: 0.08 }]),
      wave(3, [{ enemyId: 'flyer', count: 7, spawnInterval: 0.48, startDelay: 0.12 }]),
    ],
  },
  {
    id: 12,
    name: 'Bone Dry',
    biome: 'desert',
    startingGold: 520,
    waves: [
      wave(1, [
        { enemyId: 'armored', count: 4, spawnInterval: 0.75, startDelay: 0.15 },
        { enemyId: 'grunt', count: 8, spawnInterval: 0.35, startDelay: 0.25 },
      ]),
      wave(2, [{ enemyId: 'kamikaze', count: 6, spawnInterval: 0.42, startDelay: 0.1 }]),
      wave(3, [{ enemyId: 'runner', count: 14, spawnInterval: 0.28, startDelay: 0.08 }]),
    ],
  },
  {
    id: 13,
    name: 'Mirage Line',
    biome: 'desert',
    startingGold: 540,
    waves: [
      wave(1, [{ enemyId: 'wraith', count: 5, spawnInterval: 0.82, startDelay: 0.18 }]),
      wave(2, [
        { enemyId: 'flyer', count: 9, spawnInterval: 0.42, startDelay: 0.1 },
        { enemyId: 'grunt', count: 10, spawnInterval: 0.32, startDelay: 0.35 },
      ]),
      wave(3, [{ enemyId: 'splitter', count: 5, spawnInterval: 0.72, startDelay: 0.12 }]),
    ],
  },
  {
    id: 14,
    name: 'Sirocco',
    biome: 'desert',
    startingGold: 560,
    waves: [
      wave(1, [
        { enemyId: 'brute', count: 2, spawnInterval: 1.6, startDelay: 0.2 },
        { enemyId: 'runner', count: 10, spawnInterval: 0.3, startDelay: 0.45 },
      ]),
      wave(2, [{ enemyId: 'tank', count: 2, spawnInterval: 1.1, startDelay: 0.15 }]),
      wave(3, [
        { enemyId: 'medic', count: 5, spawnInterval: 0.68, startDelay: 0.12 },
        { enemyId: 'armored', count: 8, spawnInterval: 0.52, startDelay: 0.4 },
      ]),
    ],
  },
  {
    id: 15,
    name: 'Sunscar',
    biome: 'desert',
    startingGold: 600,
    waves: [
      wave(1, [
        { enemyId: 'flyer', count: 12, spawnInterval: 0.35, startDelay: 0.08 },
        { enemyId: 'kamikaze', count: 8, spawnInterval: 0.38, startDelay: 0.25 },
      ]),
      wave(2, [{ enemyId: 'brute', count: 3, spawnInterval: 1.7, startDelay: 0.15 }]),
      wave(3, [
        { enemyId: 'tank', count: 3, spawnInterval: 1.05, startDelay: 0.1 },
        { enemyId: 'wraith', count: 5, spawnInterval: 0.78, startDelay: 0.55 },
      ]),
    ],
  },
]
