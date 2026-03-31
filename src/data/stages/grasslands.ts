import type { EnemyTypeId } from '../enemies'
import type { WaveSpec } from './stagePrototype'
import type { StageDef } from './stageDef'

export type { StageDef }

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

/** Ten Grasslands stages — rising variety and pressure (Phase 4). */
export const GRASSLAND_STAGES: readonly StageDef[] = [
  {
    id: 1,
    name: 'Green Clearing',
    biome: 'grasslands',
    startingGold: 280,
    waves: [
      wave(1, [{ enemyId: 'grunt', count: 6, spawnInterval: 0.55, startDelay: 0.15 }]),
      wave(2, [{ enemyId: 'grunt', count: 8, spawnInterval: 0.42, startDelay: 0.1 }]),
      wave(3, [{ enemyId: 'runner', count: 5, spawnInterval: 0.35, startDelay: 0.12 }]),
    ],
  },
  {
    id: 2,
    name: 'Stone Path',
    biome: 'grasslands',
    startingGold: 300,
    waves: [
      wave(1, [{ enemyId: 'grunt', count: 8, spawnInterval: 0.45, startDelay: 0.1 }]),
      wave(2, [
        { enemyId: 'armored', count: 3, spawnInterval: 0.8, startDelay: 0.2 },
        { enemyId: 'grunt', count: 5, spawnInterval: 0.4, startDelay: 0.4 },
      ]),
      wave(3, [{ enemyId: 'armored', count: 5, spawnInterval: 0.65, startDelay: 0.15 }]),
    ],
  },
  {
    id: 3,
    name: 'High Meadow',
    biome: 'grasslands',
    startingGold: 320,
    waves: [
      wave(1, [{ enemyId: 'flyer', count: 6, spawnInterval: 0.5, startDelay: 0.12 }]),
      wave(2, [
        { enemyId: 'grunt', count: 6, spawnInterval: 0.38, startDelay: 0.1 },
        { enemyId: 'flyer', count: 4, spawnInterval: 0.55, startDelay: 0.35 },
      ]),
      wave(3, [{ enemyId: 'flyer', count: 8, spawnInterval: 0.42, startDelay: 0.1 }]),
    ],
  },
  {
    id: 4,
    name: 'Fog Border',
    biome: 'grasslands',
    startingGold: 340,
    waves: [
      wave(1, [{ enemyId: 'wraith', count: 4, spawnInterval: 0.9, startDelay: 0.25 }]),
      wave(2, [
        { enemyId: 'wraith', count: 3, spawnInterval: 0.75, startDelay: 0.15 },
        { enemyId: 'grunt', count: 8, spawnInterval: 0.35, startDelay: 0.3 },
      ]),
      wave(3, [{ enemyId: 'splitter', count: 4, spawnInterval: 0.85, startDelay: 0.12 }]),
    ],
  },
  {
    id: 5,
    name: 'Bridge Approach',
    biome: 'grasslands',
    startingGold: 360,
    waves: [
      wave(1, [
        { enemyId: 'runner', count: 10, spawnInterval: 0.28, startDelay: 0.08 },
        { enemyId: 'kamikaze', count: 3, spawnInterval: 0.6, startDelay: 0.5 },
      ]),
      wave(2, [{ enemyId: 'tank', count: 2, spawnInterval: 1.2, startDelay: 0.2 }]),
      wave(3, [
        { enemyId: 'runner', count: 8, spawnInterval: 0.32, startDelay: 0.1 },
        { enemyId: 'armored', count: 4, spawnInterval: 0.7, startDelay: 0.4 },
      ]),
    ],
  },
  {
    id: 6,
    name: 'Old Watch',
    biome: 'grasslands',
    startingGold: 380,
    waves: [
      wave(1, [{ enemyId: 'medic', count: 6, spawnInterval: 0.65, startDelay: 0.15 }]),
      wave(2, [
        { enemyId: 'brute', count: 1, spawnInterval: 0.1, startDelay: 0.2 },
        { enemyId: 'grunt', count: 12, spawnInterval: 0.32, startDelay: 0.5 },
      ]),
      wave(3, [{ enemyId: 'tank', count: 3, spawnInterval: 1, startDelay: 0.12 }]),
    ],
  },
  {
    id: 7,
    name: 'River Fork',
    biome: 'grasslands',
    startingGold: 400,
    waves: [
      wave(1, [
        { enemyId: 'flyer', count: 8, spawnInterval: 0.45, startDelay: 0.1 },
        { enemyId: 'wraith', count: 2, spawnInterval: 1.1, startDelay: 0.5 },
      ]),
      wave(2, [{ enemyId: 'splitter', count: 6, spawnInterval: 0.7, startDelay: 0.1 }]),
      wave(3, [{ enemyId: 'brute', count: 2, spawnInterval: 1.5, startDelay: 0.2 }]),
    ],
  },
  {
    id: 8,
    name: 'Bramble Gate',
    biome: 'grasslands',
    startingGold: 420,
    waves: [
      wave(1, [
        { enemyId: 'kamikaze', count: 8, spawnInterval: 0.4, startDelay: 0.08 },
        { enemyId: 'runner', count: 8, spawnInterval: 0.3, startDelay: 0.35 },
      ]),
      wave(2, [{ enemyId: 'armored', count: 10, spawnInterval: 0.55, startDelay: 0.1 }]),
      wave(3, [
        { enemyId: 'tank', count: 2, spawnInterval: 1.1, startDelay: 0.15 },
        { enemyId: 'medic', count: 5, spawnInterval: 0.75, startDelay: 0.6 },
      ]),
    ],
  },
  {
    id: 9,
    name: 'Shepherd Hill',
    biome: 'grasslands',
    startingGold: 440,
    waves: [
      wave(1, [{ enemyId: 'brute', count: 2, spawnInterval: 2, startDelay: 0.2 }]),
      wave(2, [
        { enemyId: 'flyer', count: 10, spawnInterval: 0.38, startDelay: 0.1 },
        { enemyId: 'wraith', count: 5, spawnInterval: 0.8, startDelay: 0.45 },
      ]),
      wave(3, [{ enemyId: 'splitter', count: 8, spawnInterval: 0.55, startDelay: 0.12 }]),
    ],
  },
  {
    id: 10,
    name: 'Heartland',
    biome: 'grasslands',
    startingGold: 480,
    waves: [
      wave(1, [
        { enemyId: 'grunt', count: 15, spawnInterval: 0.28, startDelay: 0.08 },
        { enemyId: 'kamikaze', count: 6, spawnInterval: 0.45, startDelay: 0.35 },
      ]),
      wave(2, [
        { enemyId: 'brute', count: 3, spawnInterval: 1.8, startDelay: 0.15 },
        { enemyId: 'medic', count: 6, spawnInterval: 0.65, startDelay: 0.5 },
      ]),
      wave(3, [
        { enemyId: 'tank', count: 4, spawnInterval: 1.15, startDelay: 0.1 },
        { enemyId: 'flyer', count: 12, spawnInterval: 0.35, startDelay: 0.4 },
        { enemyId: 'wraith', count: 4, spawnInterval: 0.9, startDelay: 0.9 },
      ]),
    ],
  },
]
