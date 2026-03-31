import { GOAL_CELL, gridToWorld, worldToGrid } from '../core/gridConfig'
import type { GridCell } from '../core/gridConfig'
import { findPath, findSpawnToGoalPath } from './pathfinding'
import type { EnemyInst, TowerInst } from '../types'

export function towerBlockedKeys(towers: readonly TowerInst[]): Set<string> {
  const s = new Set<string>()
  for (const t of towers) {
    s.add(`${t.gx},${t.gz}`)
  }
  return s
}

export function buildEnemyPath(blocked: ReadonlySet<string>): GridCell[] | null {
  return findSpawnToGoalPath(blocked)
}

export function pathFromCell(from: GridCell, blocked: ReadonlySet<string>): GridCell[] | null {
  return findPath(from, GOAL_CELL, blocked)
}

export function recomputeAllEnemyPaths(towers: TowerInst[], enemies: EnemyInst[]): EnemyInst[] {
  const blocked = towerBlockedKeys(towers)
  return enemies.map((e) => {
    if (e.pathMode === 'air') {
      return e
    }
    const cell = worldToGrid(e.pos.x, e.pos.z)
    const np = pathFromCell(cell, blocked)
    if (!np || np.length < 2) {
      return e
    }
    const start = gridToWorld(np[0].gx, np[0].gz)
    return {
      ...e,
      path: np,
      waypointIndex: 1,
      pos: { x: start.x, z: start.z },
    }
  })
}

/** Closest cell on the path polyline to a tower (for barracks spawns). */
export function nearestPathCellToTower(
  towerGx: number,
  towerGz: number,
  path: readonly GridCell[]
): GridCell | null {
  if (path.length === 0) {
    return null
  }
  let best = path[0]!
  let bestD = Infinity
  for (const c of path) {
    const dx = c.gx - towerGx
    const dz = c.gz - towerGz
    const d = dx * dx + dz * dz
    if (d < bestD) {
      bestD = d
      best = c
    }
  }
  return best
}
