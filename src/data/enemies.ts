export type EnemyTypeId =
  | 'grunt'
  | 'armored'
  | 'flyer'
  | 'runner'
  | 'brute'
  | 'wraith'
  | 'splitter'
  | 'medic'
  | 'tank'
  | 'kamikaze'
  | 'runt'

export type EnemyConfig = {
  id: EnemyTypeId
  name: string
  maxHp: number
  speed: number
  rewardGold: number
  leakPlayerDamage: number
  physicalResist: number
  magicResist: number
  canFly: boolean
  /** Skips fighting troops (nuisance runners). */
  ignoresTroops: boolean
  /** Starts unrevealed; only magic damage can hit until revealed. */
  invisible: boolean
  /** Spawns two `runt` on death at same position. */
  splitter: boolean
  /** Self heal per second. */
  healPerSec: number
}

export const enemyConfigs: Record<EnemyTypeId, EnemyConfig> = {
  grunt: {
    id: 'grunt',
    name: 'Grunt',
    maxHp: 40,
    speed: 5,
    rewardGold: 12,
    leakPlayerDamage: 1,
    physicalResist: 0,
    magicResist: 0,
    canFly: false,
    ignoresTroops: false,
    invisible: false,
    splitter: false,
    healPerSec: 0,
  },
  armored: {
    id: 'armored',
    name: 'Armored',
    maxHp: 70,
    speed: 3.6,
    rewardGold: 22,
    leakPlayerDamage: 2,
    physicalResist: 0.45,
    magicResist: 0,
    canFly: false,
    ignoresTroops: false,
    invisible: false,
    splitter: false,
    healPerSec: 0,
  },
  flyer: {
    id: 'flyer',
    name: 'Flyer',
    maxHp: 32,
    speed: 6.2,
    rewardGold: 16,
    leakPlayerDamage: 1,
    physicalResist: 0,
    magicResist: 0,
    canFly: true,
    ignoresTroops: true,
    invisible: false,
    splitter: false,
    healPerSec: 0,
  },
  runner: {
    id: 'runner',
    name: 'Runner',
    maxHp: 22,
    speed: 8,
    rewardGold: 14,
    leakPlayerDamage: 1,
    physicalResist: 0,
    magicResist: 0,
    canFly: false,
    ignoresTroops: true,
    invisible: false,
    splitter: false,
    healPerSec: 0,
  },
  brute: {
    id: 'brute',
    name: 'Brute',
    maxHp: 200,
    speed: 2.8,
    rewardGold: 55,
    leakPlayerDamage: 4,
    physicalResist: 0.2,
    magicResist: 0.15,
    canFly: false,
    ignoresTroops: false,
    invisible: false,
    splitter: false,
    healPerSec: 0,
  },
  wraith: {
    id: 'wraith',
    name: 'Wraith',
    maxHp: 48,
    speed: 4.2,
    rewardGold: 28,
    leakPlayerDamage: 2,
    physicalResist: 0,
    magicResist: 0.25,
    canFly: false,
    ignoresTroops: false,
    invisible: true,
    splitter: false,
    healPerSec: 0,
  },
  splitter: {
    id: 'splitter',
    name: 'Splitter',
    maxHp: 55,
    speed: 3.9,
    rewardGold: 20,
    leakPlayerDamage: 2,
    physicalResist: 0,
    magicResist: 0,
    canFly: false,
    ignoresTroops: false,
    invisible: false,
    splitter: true,
    healPerSec: 0,
  },
  medic: {
    id: 'medic',
    name: 'Medic',
    maxHp: 38,
    speed: 4,
    rewardGold: 18,
    leakPlayerDamage: 1,
    physicalResist: 0,
    magicResist: 0,
    canFly: false,
    ignoresTroops: false,
    invisible: false,
    splitter: false,
    healPerSec: 2.5,
  },
  tank: {
    id: 'tank',
    name: 'Tank',
    maxHp: 130,
    speed: 2.5,
    rewardGold: 35,
    leakPlayerDamage: 3,
    physicalResist: 0.55,
    magicResist: 0.35,
    canFly: false,
    ignoresTroops: false,
    invisible: false,
    splitter: false,
    healPerSec: 0,
  },
  kamikaze: {
    id: 'kamikaze',
    name: 'Kamikaze',
    maxHp: 26,
    speed: 6.5,
    rewardGold: 10,
    leakPlayerDamage: 3,
    physicalResist: 0,
    magicResist: 0,
    canFly: false,
    ignoresTroops: false,
    invisible: false,
    splitter: false,
    healPerSec: 0,
  },
  runt: {
    id: 'runt',
    name: 'Runt',
    maxHp: 16,
    speed: 5.2,
    rewardGold: 4,
    leakPlayerDamage: 1,
    physicalResist: 0,
    magicResist: 0,
    canFly: false,
    ignoresTroops: false,
    invisible: false,
    splitter: false,
    healPerSec: 0,
  },
}
