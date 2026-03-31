import type { GameFeelEvent } from '../audio/feelEvents'
import type { DamageKind } from '../../data/damageKinds'
import type { EnemyTypeId } from '../../data/enemies'
import { enemyConfigs } from '../../data/enemies'
import type { EnemyInst } from '../types'
import { GOAL_CELL, SPAWN_CELL, gridToWorld, worldToGrid, type Vec2 } from '../core/gridConfig'
import { pathFromCell, towerBlockedKeys } from './pathingUtils'
import type { TowerInst } from '../types'

export function effectiveResist(kind: DamageKind, cfg: (typeof enemyConfigs)[EnemyTypeId]): number {
  if (kind === 'physical') {
    return cfg.physicalResist
  }
  if (kind === 'magic' || kind === 'fire' || kind === 'ice' || kind === 'electric') {
    return cfg.magicResist
  }
  return 0
}

export function computeDamage(raw: number, kind: DamageKind, enemy: EnemyInst): number {
  const cfg = enemyConfigs[enemy.type]
  if (cfg.invisible && !enemy.revealed && kind !== 'magic') {
    return 0
  }
  const res = effectiveResist(kind, cfg)
  const mul = Math.max(0.15, 1 - res)
  return Math.max(1, Math.round(raw * mul))
}

export function spawnFromSplitter(
  id1: string,
  id2: string,
  pos: Vec2,
  towers: TowerInst[],
  enemyHpMul: number
): EnemyInst[] {
  const blocked = towerBlockedKeys(towers)
  const cell = worldToGrid(pos.x, pos.z)
  const path = pathFromCell(cell, blocked)
  if (!path || path.length < 2) {
    return []
  }

  const mk = (id: string): EnemyInst => {
    const cfg = enemyConfigs.runt
    const maxHp = Math.max(1, Math.round(cfg.maxHp * enemyHpMul))
    return {
      id,
      type: 'runt',
      hp: maxHp,
      maxHp,
      path,
      waypointIndex: 1,
      pos: { ...pos },
      pathMode: 'ground',
      revealed: true,
      slowMul: 1,
      slowTimer: 0,
    }
  }
  return [mk(id1), mk(id2)]
}

type DamageResult = {
  enemies: EnemyInst[]
  gold: number
  feelEvents: GameFeelEvent[]
  nextId: number
}

/** Single-target hit; handles kill, splitter, reveal from magic. */
export function applyHitDamage(
  enemies: EnemyInst[],
  targetId: string,
  rawDamage: number,
  kind: DamageKind,
  gold: number,
  nextEntityId: number,
  towers: TowerInst[],
  enemyHpMul = 1
): DamageResult {
  const feelEvents: GameFeelEvent[] = []
  const idx = enemies.findIndex((x) => x.id === targetId)
  if (idx === -1) {
    return { enemies, gold, feelEvents, nextId: nextEntityId }
  }

  const e = enemies[idx]!
  const cfg0 = enemyConfigs[e.type]
  let next = { ...e }
  if (kind === 'magic' && cfg0.invisible) {
    next = { ...next, revealed: true }
  }

  const dmg = computeDamage(rawDamage, kind, next)
  const hp = next.hp - dmg

  if (hp <= 0) {
    const cfg = enemyConfigs[next.type]
    let list = enemies.filter((x) => x.id !== targetId)
    gold += cfg.rewardGold
    feelEvents.push({ type: 'enemy_death', enemyType: next.type })

    if (cfg.splitter) {
      const a = `e-${nextEntityId}`
      const b = `e-${nextEntityId + 1}`
      const sp = spawnFromSplitter(a, b, next.pos, towers, enemyHpMul)
      list = [...list, ...sp]
      feelEvents.push(
        { type: 'enemy_spawn' },
        { type: 'enemy_spawn' }
      )
      return {
        enemies: list,
        gold,
        feelEvents,
        nextId: nextEntityId + 2,
      }
    }

    return { enemies: list, gold, feelEvents, nextId: nextEntityId }
  }

  const arr = enemies.slice()
  arr[idx] = { ...next, hp }
  return { enemies: arr, gold, feelEvents, nextId: nextEntityId }
}

/** Advance air unit toward goal in a straight line. */
export function stepAirEnemy(enemy: EnemyInst, dt: number): { enemy: EnemyInst; leaked: boolean } {
  const cfg = enemyConfigs[enemy.type]
  const goal = gridToWorld(GOAL_CELL.gx, GOAL_CELL.gz)
  const dx = goal.x - enemy.pos.x
  const dz = goal.z - enemy.pos.z
  const dist = Math.hypot(dx, dz)
  const REACH = 0.25
  const spd = cfg.speed * enemy.slowMul * dt

  if (dist <= REACH) {
    return { enemy: { ...enemy, pos: goal }, leaked: true }
  }

  const nx = enemy.pos.x + (dx / dist) * spd
  const nz = enemy.pos.z + (dz / dist) * spd
  return {
    enemy: { ...enemy, pos: { x: nx, z: nz } },
    leaked: false,
  }
}

export function goalWorld(): Vec2 {
  return gridToWorld(GOAL_CELL.gx, GOAL_CELL.gz)
}

export function spawnWorld(): Vec2 {
  return gridToWorld(SPAWN_CELL.gx, SPAWN_CELL.gz)
}
