import { useMemo } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { DoubleSide } from 'three'
import { getTowerConfig, scaledTowerRange } from '../../data/towers'
import { useGameStore } from '../../store/gameStore'
import type { EnemyInst } from '../types'
import { gridToWorld } from '../core/gridConfig'
import { EnemyModel } from './EnemyModel'
import { TowerModel } from './TowerModel'

function TowerRangeRing({ radius }: { radius: number }) {
  const inner = Math.max(0.05, radius - 0.18)
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
      <ringGeometry args={[inner, radius, 48]} />
      <meshBasicMaterial color="#ffee88" transparent opacity={0.45} side={DoubleSide} />
    </mesh>
  )
}

export function GameEntities() {
  const towers = useGameStore((s) => s.towers)
  const enemies = useGameStore((s) => s.enemies)
  const projectiles = useGameStore((s) => s.projectiles)
  const troops = useGameStore((s) => s.troops)
  const selectedEntity = useGameStore((s) => s.selectedEntity)
  const selectEntity = useGameStore((s) => s.selectEntity)

  const towerMeshes = useMemo(
    () =>
      towers.map((t) => {
        const p = gridToWorld(t.gx, t.gz)
        return { id: t.id, x: p.x, z: p.z, kind: t.type, facingY: t.facingY, up: t.upgradeLevel }
      }),
    [towers]
  )

  const onTowerClick = (e: ThreeEvent<MouseEvent>, id: string) => {
    e.stopPropagation()
    selectEntity({ kind: 'tower', id })
  }

  const onEnemyClick = (e: ThreeEvent<MouseEvent>, id: string) => {
    e.stopPropagation()
    selectEntity({ kind: 'enemy', id })
  }

  return (
    <group>
      {towerMeshes.map((t) => {
        const selected = selectedEntity?.kind === 'tower' && selectedEntity.id === t.id
        const r = selected
          ? scaledTowerRange(getTowerConfig(t.kind), t.up)
          : 0
        return (
          <group
            key={t.id}
            position={[t.x, 0, t.z]}
            rotation={[0, t.facingY, 0]}
            onClick={(e) => onTowerClick(e, t.id)}
          >
            {selected ? <TowerRangeRing radius={r} /> : null}
            <TowerModel kind={t.kind} up={t.up} />
          </group>
        )
      })}
      {enemies.map((e: EnemyInst) => (
        <group
          key={e.id}
          position={[e.pos.x, 0, e.pos.z]}
          onClick={(ev) => onEnemyClick(ev, e.id)}
        >
          <EnemyModel enemy={e} />
        </group>
      ))}
      {troops.map((tr) => (
        <group key={tr.id} position={[tr.pos.x, 0, tr.pos.z]} rotation={[0, tr.facingY, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.4]} />
            <meshToonMaterial color="#7a6a4a" />
          </mesh>
        </group>
      ))}
      {projectiles.map((p) => (
        <mesh key={p.id} position={[p.pos.x, p.kind === 'mortar' ? 1.4 : 0.85, p.pos.z]}>
          <sphereGeometry args={[p.kind === 'mortar' ? 0.2 : 0.12, 8, 8]} />
          <meshToonMaterial
            color={p.kind === 'mortar' ? '#ff8844' : '#f5e6a6'}
            emissive={p.kind === 'mortar' ? '#aa4400' : '#ffcc33'}
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
    </group>
  )
}
