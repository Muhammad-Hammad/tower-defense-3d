/**
 * All eight tower families. Spec: MASTER SPEC Block 6.
 */

import type { DamageKind } from './damageKinds'

export type TowerType =
  | 'archer'
  | 'cannon'
  | 'mage'
  | 'tesla'
  | 'sniper'
  | 'barracks'
  | 'freeze'
  | 'mortar'

export type TowerConfig = {
  id: string
  name: string
  type: TowerType
  baseCost: number
  baseAttackSpeed: number
  baseDamage: number
  baseRange: number
  damageKind: DamageKind
  /** AoE on primary impact (cannon). */
  splashRadius: number
  /** Secondary chain radius (mage). */
  chainRadius: number
  chainDamageFactor: number
  /** Slow multiplier applied by tesla (multiplicative with freeze). */
  teslaSlow: number
  teslaSlowDuration: number
  critChance: number
  critMultiplier: number
  /** Mortar: world units/sec horizontal; fuse when reaching impactPos. */
  mortarSpeed: number
  /** Freeze aura: minimum enemy speed factor while in range. */
  freezeSlow: number
  barracksInterval: number
  barracksCap: number
  troopDamage: number
  troopHp: number
  troopRange: number
  upgradeCostBase: number
}

export const towerConfigsList: readonly TowerConfig[] = [
  {
    id: 'archer',
    name: 'Archer',
    type: 'archer',
    baseCost: 75,
    baseAttackSpeed: 1.15,
    baseDamage: 14,
    baseRange: 9.5,
    damageKind: 'physical',
    splashRadius: 0,
    chainRadius: 0,
    chainDamageFactor: 0,
    teslaSlow: 1,
    teslaSlowDuration: 0,
    critChance: 0,
    critMultiplier: 1,
    mortarSpeed: 14,
    freezeSlow: 1,
    barracksInterval: 999,
    barracksCap: 0,
    troopDamage: 0,
    troopHp: 0,
    troopRange: 0,
    upgradeCostBase: 45,
  },
  {
    id: 'cannon',
    name: 'Cannon',
    type: 'cannon',
    baseCost: 110,
    baseAttackSpeed: 0.42,
    baseDamage: 32,
    baseRange: 8,
    damageKind: 'physical',
    splashRadius: 3.2,
    chainRadius: 0,
    chainDamageFactor: 0,
    teslaSlow: 1,
    teslaSlowDuration: 0,
    critChance: 0,
    critMultiplier: 1,
    mortarSpeed: 14,
    freezeSlow: 1,
    barracksInterval: 999,
    barracksCap: 0,
    troopDamage: 0,
    troopHp: 0,
    troopRange: 0,
    upgradeCostBase: 65,
  },
  {
    id: 'mage',
    name: 'Mage',
    type: 'mage',
    baseCost: 95,
    baseAttackSpeed: 0.85,
    baseDamage: 18,
    baseRange: 8.5,
    damageKind: 'magic',
    splashRadius: 0,
    chainRadius: 5,
    chainDamageFactor: 0.55,
    teslaSlow: 1,
    teslaSlowDuration: 0,
    critChance: 0,
    critMultiplier: 1,
    mortarSpeed: 14,
    freezeSlow: 1,
    barracksInterval: 999,
    barracksCap: 0,
    troopDamage: 0,
    troopHp: 0,
    troopRange: 0,
    upgradeCostBase: 55,
  },
  {
    id: 'tesla',
    name: 'Tesla',
    type: 'tesla',
    baseCost: 125,
    baseAttackSpeed: 1.05,
    baseDamage: 11,
    baseRange: 7.5,
    damageKind: 'electric',
    splashRadius: 0,
    chainRadius: 0,
    chainDamageFactor: 0,
    teslaSlow: 0.55,
    teslaSlowDuration: 0.85,
    critChance: 0,
    critMultiplier: 1,
    mortarSpeed: 14,
    freezeSlow: 1,
    barracksInterval: 999,
    barracksCap: 0,
    troopDamage: 0,
    troopHp: 0,
    troopRange: 0,
    upgradeCostBase: 70,
  },
  {
    id: 'sniper',
    name: 'Sniper',
    type: 'sniper',
    baseCost: 140,
    baseAttackSpeed: 0.38,
    baseDamage: 62,
    baseRange: 14,
    damageKind: 'physical',
    splashRadius: 0,
    chainRadius: 0,
    chainDamageFactor: 0,
    teslaSlow: 1,
    teslaSlowDuration: 0,
    critChance: 0.18,
    critMultiplier: 2.4,
    mortarSpeed: 14,
    freezeSlow: 1,
    barracksInterval: 999,
    barracksCap: 0,
    troopDamage: 0,
    troopHp: 0,
    troopRange: 0,
    upgradeCostBase: 85,
  },
  {
    id: 'barracks',
    name: 'Barracks',
    type: 'barracks',
    baseCost: 160,
    baseAttackSpeed: 0,
    baseDamage: 0,
    baseRange: 0,
    damageKind: 'physical',
    splashRadius: 0,
    chainRadius: 0,
    chainDamageFactor: 0,
    teslaSlow: 1,
    teslaSlowDuration: 0,
    critChance: 0,
    critMultiplier: 1,
    mortarSpeed: 14,
    freezeSlow: 1,
    barracksInterval: 4.2,
    barracksCap: 3,
    troopDamage: 9,
    troopHp: 95,
    troopRange: 2.8,
    upgradeCostBase: 90,
  },
  {
    id: 'freeze',
    name: 'Freeze',
    type: 'freeze',
    baseCost: 105,
    baseAttackSpeed: 0,
    baseDamage: 0,
    baseRange: 7.2,
    damageKind: 'ice',
    splashRadius: 0,
    chainRadius: 0,
    chainDamageFactor: 0,
    teslaSlow: 1,
    teslaSlowDuration: 0,
    critChance: 0,
    critMultiplier: 1,
    mortarSpeed: 14,
    freezeSlow: 0.42,
    barracksInterval: 999,
    barracksCap: 0,
    troopDamage: 0,
    troopHp: 0,
    troopRange: 0,
    upgradeCostBase: 60,
  },
  {
    id: 'mortar',
    name: 'Mortar',
    type: 'mortar',
    baseCost: 135,
    baseAttackSpeed: 0.32,
    baseDamage: 40,
    baseRange: 11,
    damageKind: 'fire',
    splashRadius: 4.1,
    chainRadius: 0,
    chainDamageFactor: 0,
    teslaSlow: 1,
    teslaSlowDuration: 0,
    critChance: 0,
    critMultiplier: 1,
    mortarSpeed: 11,
    freezeSlow: 1,
    barracksInterval: 999,
    barracksCap: 0,
    troopDamage: 0,
    troopHp: 0,
    troopRange: 0,
    upgradeCostBase: 80,
  },
]

export const towerConfigs = towerConfigsList as readonly TowerConfig[]

export function getTowerConfig(type: TowerType): TowerConfig {
  const c = towerConfigsList.find((t) => t.type === type)
  if (!c) {
    throw new Error(`Unknown tower type: ${type}`)
  }
  return c
}

export function scaledTowerDamage(cfg: TowerConfig, upgradeLevel: number): number {
  const mul = 1 + upgradeLevel * 0.22
  return cfg.baseDamage * mul
}

export function scaledTowerRange(cfg: TowerConfig, upgradeLevel: number): number {
  return cfg.baseRange * (1 + upgradeLevel * 0.06)
}

export function scaledAttackSpeed(cfg: TowerConfig, upgradeLevel: number): number {
  return cfg.baseAttackSpeed * (1 + upgradeLevel * 0.08)
}
