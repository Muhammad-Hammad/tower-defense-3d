import { getTowerConfig, type TowerType } from './towers'

/** Max secondary targets for mage chain (matches `runTick` mageChain cap). */
export const MAGE_CHAIN_MAX_TARGETS = 4

export type TowerAbilityInfo = {
  label: string
  detail: string
}

const c = getTowerConfig

export const TOWER_ABILITIES: Record<TowerType, TowerAbilityInfo | null> = {
  archer: null,
  cannon: {
    label: 'Splash',
    detail: `Deals 100% damage in a ${c('cannon').splashRadius}u radius on impact`,
  },
  mage: {
    label: 'Chain Lightning',
    detail: `Hits up to ${MAGE_CHAIN_MAX_TARGETS} enemies within ${c('mage').chainRadius}u, ${Math.round(c('mage').chainDamageFactor * 100)}% damage each`,
  },
  tesla: {
    label: 'Slow',
    detail: `Slows target by ${Math.round((1 - c('tesla').teslaSlow) * 100)}% for ${c('tesla').teslaSlowDuration}s`,
  },
  sniper: {
    label: 'Critical Hit',
    detail: `${Math.round(c('sniper').critChance * 100)}% chance for ${c('sniper').critMultiplier}x damage`,
  },
  barracks: {
    label: 'Spawn Troops',
    detail: `Deploys up to ${c('barracks').barracksCap} melee troops (${c('barracks').troopDamage} dmg, ${c('barracks').troopHp} HP each)`,
  },
  freeze: {
    label: 'Freeze Aura',
    detail: `Slows all enemies in range to ${Math.round(c('freeze').freezeSlow * 100)}% speed`,
  },
  mortar: {
    label: 'Mortar Strike',
    detail: `Lobs shell dealing ${c('mortar').baseDamage} ${c('mortar').damageKind} dmg in ${c('mortar').splashRadius}u radius`,
  },
}
