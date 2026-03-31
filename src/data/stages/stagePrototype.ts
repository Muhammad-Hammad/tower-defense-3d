import type { EnemyTypeId } from '../enemies'

export type WaveSpawnSpec = {
  enemyId: EnemyTypeId
  count: number
  spawnInterval: number
  startDelay: number
}

export type WaveSpec = {
  waveNumber: number
  groups: WaveSpawnSpec[]
}

/** Flatten into timed spawn events for the wave runner (Phase 2 — two waves). */
export function expandWaveToSpawnEvents(wave: WaveSpec): { at: number; enemyId: EnemyTypeId }[] {
  const events: { at: number; enemyId: EnemyTypeId }[] = []
  for (const g of wave.groups) {
    for (let i = 0; i < g.count; i += 1) {
      events.push({
        at: g.startDelay + i * g.spawnInterval,
        enemyId: g.enemyId,
      })
    }
  }
  return events.sort((a, b) => a.at - b.at)
}

export const prototypeStageWaves: readonly WaveSpec[] = [
  {
    waveNumber: 1,
    groups: [{ enemyId: 'grunt', count: 4, spawnInterval: 0.65, startDelay: 0.2 }],
  },
  {
    waveNumber: 2,
    groups: [{ enemyId: 'grunt', count: 7, spawnInterval: 0.45, startDelay: 0.15 }],
  },
]
