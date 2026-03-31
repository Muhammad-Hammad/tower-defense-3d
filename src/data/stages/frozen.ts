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

/** Frozen acts 16–20 — flyers, medics, armored. */
export const FROZEN_STAGES: readonly StageDef[] = [
  {
    id: 16,
    name: 'Frostbite',
    biome: 'frozen',
    startingGold: 640,
    waves: [
      wave(1, [{ enemyId: 'flyer', count: 9, spawnInterval: 0.44, startDelay: 0.1 }]),
      wave(2, [{ enemyId: 'medic', count: 7, spawnInterval: 0.62, startDelay: 0.12 }]),
      wave(3, [{ enemyId: 'armored', count: 8, spawnInterval: 0.52, startDelay: 0.1 }]),
    ],
  },
  {
    id: 17,
    name: 'Glacier Maw',
    biome: 'frozen',
    startingGold: 660,
    waves: [
      wave(1, [
        { enemyId: 'grunt', count: 12, spawnInterval: 0.3, startDelay: 0.08 },
        { enemyId: 'wraith', count: 3, spawnInterval: 1, startDelay: 0.35 },
      ]),
      wave(2, [{ enemyId: 'splitter', count: 6, spawnInterval: 0.65, startDelay: 0.1 }]),
      wave(3, [{ enemyId: 'tank', count: 2, spawnInterval: 1.15, startDelay: 0.15 }]),
    ],
  },
  {
    id: 18,
    name: 'Permafrost',
    biome: 'frozen',
    startingGold: 680,
    waves: [
      wave(1, [{ enemyId: 'runner', count: 15, spawnInterval: 0.26, startDelay: 0.08 }]),
      wave(2, [
        { enemyId: 'flyer', count: 11, spawnInterval: 0.38, startDelay: 0.1 },
        { enemyId: 'kamikaze', count: 5, spawnInterval: 0.48, startDelay: 0.4 },
      ]),
      wave(3, [{ enemyId: 'brute', count: 2, spawnInterval: 1.85, startDelay: 0.18 }]),
    ],
  },
  {
    id: 19,
    name: 'Ice Shelf',
    biome: 'frozen',
    startingGold: 700,
    waves: [
      wave(1, [
        { enemyId: 'tank', count: 2, spawnInterval: 1.12, startDelay: 0.15 },
        { enemyId: 'medic', count: 6, spawnInterval: 0.58, startDelay: 0.35 },
      ]),
      wave(2, [{ enemyId: 'wraith', count: 6, spawnInterval: 0.75, startDelay: 0.12 }]),
      wave(3, [
        { enemyId: 'armored', count: 10, spawnInterval: 0.48, startDelay: 0.1 },
        { enemyId: 'splitter', count: 5, spawnInterval: 0.68, startDelay: 0.5 },
      ]),
    ],
  },
  {
    id: 20,
    name: 'Whiteout',
    biome: 'frozen',
    startingGold: 740,
    waves: [
      wave(1, [
        { enemyId: 'flyer', count: 14, spawnInterval: 0.33, startDelay: 0.08 },
        { enemyId: 'runner', count: 12, spawnInterval: 0.28, startDelay: 0.3 },
      ]),
      wave(2, [{ enemyId: 'brute', count: 3, spawnInterval: 1.65, startDelay: 0.15 }]),
      wave(3, [
        { enemyId: 'tank', count: 4, spawnInterval: 1.02, startDelay: 0.12 },
        { enemyId: 'medic', count: 7, spawnInterval: 0.55, startDelay: 0.55 },
        { enemyId: 'wraith', count: 4, spawnInterval: 0.85, startDelay: 0.9 },
      ]),
    ],
  },
]
