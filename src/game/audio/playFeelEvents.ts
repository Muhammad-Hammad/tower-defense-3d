import type { GameFeelEvent } from './feelEvents'
import { getAudioManager } from './AudioManager'

export function playFeelEvents(events: readonly GameFeelEvent[]): void {
  if (events.length === 0) {
    return
  }
  const a = getAudioManager()
  for (const ev of events) {
    switch (ev.type) {
      case 'tower_fire':
        a.playSfx('towerFire')
        break
      case 'enemy_spawn':
        a.playSfx('enemySpawn')
        break
      case 'enemy_leak':
        a.playSfx('enemyLeak')
        break
      case 'enemy_death':
        a.playSfx('enemyDeath')
        a.playSfx('gold')
        break
      default:
        break
    }
  }
}
