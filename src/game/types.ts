import type { DamageKind } from '../data/damageKinds'
import type { EnemyTypeId } from '../data/enemies'
import type { TowerType } from '../data/towers'
import type { GridCell, Vec2 } from './core/gridConfig'

export type { DamageKind } from '../data/damageKinds'
export type { GridCell, Vec2 } from './core/gridConfig'

export type GameStatus = 'menu' | 'playing' | 'paused'

export type ProjectileKind = 'seeking' | 'mortar'

export type TowerInst = {
  id: string
  type: TowerType
  gx: number
  gz: number
  cooldown: number
  facingY: number
  /** 0–2 linear buffs (+20% damage per level). */
  upgradeLevel: number
  /** Barracks: time until next spawn. */
  barracksSpawnCd: number
}

export type EnemyPathMode = 'ground' | 'air'

export type EnemyInst = {
  id: string
  type: EnemyTypeId
  hp: number
  maxHp: number
  path: GridCell[]
  waypointIndex: number
  pos: Vec2
  pathMode: EnemyPathMode
  /** Invisible (wraith) until magic damage hits. */
  revealed: boolean
  slowMul: number
  slowTimer: number
}

export type ProjectileInst = {
  id: string
  damage: number
  damageKind: DamageKind
  speed: number
  pos: Vec2
  /** Seeking target; mortar uses impactPos instead for terminal phase. */
  targetEnemyId: string | null
  kind: ProjectileKind
  splashRadius: number
  towerSourceType: TowerType
  /** Mortar landing point (world xz). */
  impactPos?: Vec2
}

export type TroopInst = {
  id: string
  ownerTowerId: string
  pos: Vec2
  hp: number
  maxHp: number
  damage: number
  attackCooldown: number
  facingY: number
}

export type WaveRuntime = {
  waveIndex: number
  events: { at: number; enemyId: EnemyTypeId }[]
  elapsed: number
  nextEventIndex: number
  finishedSpawning: boolean
} | null
