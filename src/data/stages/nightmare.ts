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

/** Nightmare acts 26–30 — full roster pressure. */
export const NIGHTMARE_STAGES: readonly StageDef[] = [
  {
    id: 26,
    name: 'Dread Step',
    biome: 'nightmare',
    startingGold: 920,
    waves: [
      wave(1, [
        { enemyId: 'wraith', count: 6, spawnInterval: 0.72, startDelay: 0.12 },
        { enemyId: 'grunt', count: 14, spawnInterval: 0.28, startDelay: 0.22 },
      ]),
      wave(2, [{ enemyId: 'splitter', count: 8, spawnInterval: 0.52, startDelay: 0.1 }]),
      wave(3, [{ enemyId: 'brute', count: 3, spawnInterval: 1.5, startDelay: 0.15 }]),
    ],
  },
  {
    id: 27,
    name: 'Bleak Hollow',
    biome: 'nightmare',
    startingGold: 940,
    waves: [
      wave(1, [
        { enemyId: 'flyer', count: 14, spawnInterval: 0.34, startDelay: 0.08 },
        { enemyId: 'kamikaze', count: 10, spawnInterval: 0.32, startDelay: 0.28 },
      ]),
      wave(2, [{ enemyId: 'tank', count: 4, spawnInterval: 1.02, startDelay: 0.12 }]),
      wave(3, [
        { enemyId: 'runner', count: 18, spawnInterval: 0.22, startDelay: 0.08 },
        { enemyId: 'armored', count: 11, spawnInterval: 0.44, startDelay: 0.35 },
      ]),
    ],
  },
  {
    id: 28,
    name: 'Echo Labyrinth',
    biome: 'nightmare',
    startingGold: 960,
    waves: [
      wave(1, [{ enemyId: 'medic', count: 9, spawnInterval: 0.48, startDelay: 0.12 }]),
      wave(2, [
        { enemyId: 'wraith', count: 8, spawnInterval: 0.65, startDelay: 0.1 },
        { enemyId: 'splitter', count: 8, spawnInterval: 0.5, startDelay: 0.45 },
      ]),
      wave(3, [
        { enemyId: 'brute', count: 4, spawnInterval: 1.35, startDelay: 0.15 },
        { enemyId: 'tank', count: 4, spawnInterval: 0.98, startDelay: 0.55 },
      ]),
    ],
  },
  {
    id: 29,
    name: 'Wound Sky',
    biome: 'nightmare',
    startingGold: 1000,
    waves: [
      wave(1, [
        { enemyId: 'grunt', count: 18, spawnInterval: 0.25, startDelay: 0.08 },
        { enemyId: 'flyer', count: 14, spawnInterval: 0.32, startDelay: 0.22 },
        { enemyId: 'kamikaze', count: 10, spawnInterval: 0.3, startDelay: 0.45 },
      ]),
      wave(2, [
        { enemyId: 'armored', count: 14, spawnInterval: 0.42, startDelay: 0.1 },
        { enemyId: 'wraith', count: 8, spawnInterval: 0.68, startDelay: 0.45 },
      ]),
      wave(3, [{ enemyId: 'splitter', count: 10, spawnInterval: 0.48, startDelay: 0.1 }]),
    ],
  },
  {
    id: 30,
    name: 'Last Night',
    biome: 'nightmare',
    startingGold: 1100,
    waves: [
      wave(1, [
        { enemyId: 'runner', count: 20, spawnInterval: 0.2, startDelay: 0.06 },
        { enemyId: 'kamikaze', count: 12, spawnInterval: 0.28, startDelay: 0.25 },
        { enemyId: 'medic', count: 8, spawnInterval: 0.45, startDelay: 0.4 },
      ]),
      wave(2, [
        { enemyId: 'brute', count: 5, spawnInterval: 1.25, startDelay: 0.12 },
        { enemyId: 'tank', count: 5, spawnInterval: 0.92, startDelay: 0.48 },
        { enemyId: 'flyer', count: 18, spawnInterval: 0.28, startDelay: 0.65 },
      ]),
      wave(3, [
        { enemyId: 'grunt', count: 22, spawnInterval: 0.22, startDelay: 0.06 },
        { enemyId: 'wraith', count: 10, spawnInterval: 0.58, startDelay: 0.35 },
        { enemyId: 'splitter', count: 10, spawnInterval: 0.45, startDelay: 0.7 },
        { enemyId: 'armored', count: 14, spawnInterval: 0.38, startDelay: 1.1 },
      ]),
    ],
  },
]
