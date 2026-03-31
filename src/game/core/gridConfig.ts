/** Square grid aligned with the 48×48 ground plane (Phase 2 prototype). */

export const GRID_WIDTH = 24
export const GRID_HEIGHT = 24
export const CELL_SIZE = 2

/** Enemy spawn tile (grid coords). */
export const SPAWN_CELL = { gx: 2, gz: 11 } as const

/** Player base tile. */
export const GOAL_CELL = { gx: 21, gz: 11 } as const

export type Vec2 = { x: number; z: number }

export type GridCell = { gx: number; gz: number }

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function gridToWorld(gx: number, gz: number): Vec2 {
  const wx = (gx + 0.5 - GRID_WIDTH / 2) * CELL_SIZE
  const wz = (gz + 0.5 - GRID_HEIGHT / 2) * CELL_SIZE
  return { x: wx, z: wz }
}

export function worldToGrid(x: number, z: number): GridCell {
  const gx = Math.round(x / CELL_SIZE + GRID_WIDTH / 2 - 0.5)
  const gz = Math.round(z / CELL_SIZE + GRID_HEIGHT / 2 - 0.5)
  return {
    gx: clamp(gx, 0, GRID_WIDTH - 1),
    gz: clamp(gz, 0, GRID_HEIGHT - 1),
  }
}

export function cellKey(gx: number, gz: number): string {
  return `${gx},${gz}`
}

export function gridDistanceSq(a: GridCell, b: GridCell): number {
  const dx = a.gx - b.gx
  const dz = a.gz - b.gz
  return dx * dx + dz * dz
}

export function vecDistSq(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x
  const dz = a.z - b.z
  return dx * dx + dz * dz
}

export function vecDist(a: Vec2, b: Vec2): number {
  return Math.sqrt(vecDistSq(a, b))
}

export function normalizeVec(dx: number, dz: number): Vec2 {
  const len = Math.hypot(dx, dz)
  if (len < 1e-6) {
    return { x: 0, z: 0 }
  }
  return { x: dx / len, z: dz / len }
}
