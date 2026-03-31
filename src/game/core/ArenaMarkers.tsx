import { GOAL_CELL, SPAWN_CELL, gridToWorld } from './gridConfig'

export function ArenaMarkers() {
  const spawn = gridToWorld(SPAWN_CELL.gx, SPAWN_CELL.gz)
  const goal = gridToWorld(GOAL_CELL.gx, GOAL_CELL.gz)

  return (
    <group>
      <mesh position={[spawn.x, 0.12, spawn.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.85, 24]} />
        <meshBasicMaterial color="#44aaff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[goal.x, 0.12, goal.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.85, 24]} />
        <meshBasicMaterial color="#ff4466" transparent opacity={0.85} />
      </mesh>
    </group>
  )
}
