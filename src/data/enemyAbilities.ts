import type { EnemyConfig } from './enemies'

export type EnemyAbilityBadge = {
  label: string
  detail: string
}

export function getEnemyAbilities(cfg: EnemyConfig): EnemyAbilityBadge[] {
  const out: EnemyAbilityBadge[] = []
  if (cfg.canFly) {
    out.push({
      label: 'Flies',
      detail: 'Uses air path; ground troops cannot block this unit',
    })
  }
  if (cfg.invisible) {
    out.push({
      label: 'Invisible',
      detail: 'Hidden until struck by magic damage; then fully targetable',
    })
  }
  if (cfg.splitter) {
    out.push({
      label: 'Splits on death',
      detail: 'Spawns two smaller runts at the same position when destroyed',
    })
  }
  if (cfg.healPerSec > 0) {
    out.push({
      label: 'Regeneration',
      detail: `Restores ${cfg.healPerSec} HP per second (self)`,
    })
  }
  if (cfg.ignoresTroops) {
    out.push({
      label: 'Ignores troops',
      detail: 'Does not stop for barracks units; runs past toward the goal',
    })
  }
  return out
}
