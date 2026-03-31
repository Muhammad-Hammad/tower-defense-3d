import {
  GOAL_CELL,
  GRID_HEIGHT,
  GRID_WIDTH,
  SPAWN_CELL,
  cellKey,
  type GridCell,
} from '../core/gridConfig'

function heuristic(a: GridCell, b: GridCell): number {
  return Math.abs(a.gx - b.gx) + Math.abs(a.gz - b.gz)
}

const NEIGHBORS: readonly GridCell[] = [
  { gx: 1, gz: 0 },
  { gx: -1, gz: 0 },
  { gx: 0, gz: 1 },
  { gx: 0, gz: -1 },
]

/**
 * 4-neighbour A* on a rectangular grid. `blocked` contains "gx,gz" keys (towers only for Phase 2).
 */
export function findPath(
  start: GridCell,
  goal: GridCell,
  blocked: ReadonlySet<string>
): GridCell[] | null {
  if (start.gx === goal.gx && start.gz === goal.gz) {
    return [start]
  }

  const startK = cellKey(start.gx, start.gz)
  const goalK = cellKey(goal.gx, goal.gz)
  if (blocked.has(startK) || blocked.has(goalK)) {
    return null
  }

  const open: string[] = [startK]
  const cameFrom = new Map<string, string>()
  const gScore = new Map<string, number>([[startK, 0]])
  const fScore = new Map<string, number>([[startK, heuristic(start, goal)]])

  const parseKey = (k: string): GridCell => {
    const [gx, gz] = k.split(',').map(Number) as [number, number]
    return { gx, gz }
  }

  while (open.length > 0) {
    open.sort((ka, kb) => (fScore.get(ka) ?? Infinity) - (fScore.get(kb) ?? Infinity))
    const current = open.shift()
    if (!current) {
      break
    }
    if (current === goalK) {
      const path: GridCell[] = []
      let ck: string | undefined = current
      while (ck) {
        path.push(parseKey(ck))
        ck = cameFrom.get(ck)
      }
      path.reverse()
      return path
    }

    const curCell = parseKey(current)
    for (const d of NEIGHBORS) {
      const nx = curCell.gx + d.gx
      const nz = curCell.gz + d.gz
      if (nx < 0 || nz < 0 || nx >= GRID_WIDTH || nz >= GRID_HEIGHT) {
        continue
      }
      const nk = cellKey(nx, nz)
      if (blocked.has(nk)) {
        continue
      }

      const tentativeG = (gScore.get(current) ?? Infinity) + 1
      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, current)
        gScore.set(nk, tentativeG)
        fScore.set(nk, tentativeG + heuristic({ gx: nx, gz: nz }, goal))
        if (!open.includes(nk)) {
          open.push(nk)
        }
      }
    }
  }

  return null
}

/** Main path from global spawn to goal with tower blocks. */
export function findSpawnToGoalPath(blocked: ReadonlySet<string>): GridCell[] | null {
  return findPath(SPAWN_CELL, GOAL_CELL, blocked)
}
