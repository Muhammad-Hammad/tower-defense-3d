import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { MeshStandardMaterial } from 'three'
import * as THREE from 'three'

type Props = {
  subdiv: number
  groundTint: string
  roughness: number
  metalness: number
  terrainEmissive?: string
  matRef: React.RefObject<MeshStandardMaterial | null>
  onPointerDown: (e: ThreeEvent<MouseEvent>) => void
}

const VEIN_ANGLES = [0, 0.45, 0.9, 1.35, 1.8, 2.25, 2.7, 3.1] as const

const DEBRIS_BOXES: readonly [number, number, number][] = [
  [18, 3.2, 16],
  [-17, 2.6, 15],
  [16, 3.8, -17],
  [-18, 2.4, -16],
  [17, 3.5, -15],
]

export function NightmareTerrain({
  subdiv,
  groundTint,
  roughness,
  metalness,
  terrainEmissive,
  matRef,
  onPointerDown,
}: Props) {
  const segs = Math.max(20, Math.min(subdiv, 72))
  const veinRefs = useRef<(MeshStandardMaterial | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    veinRefs.current.forEach((m, i) => {
      if (m) {
        m.emissiveIntensity = 0.35 + 0.25 * Math.sin(t * 1.7 + i * 0.9)
      }
    })
  })

  const debrisState = useMemo(
    () =>
      DEBRIS_BOXES.map((pos, i) => ({
        pos: [...pos] as [number, number, number],
        rotSeed: i * 1.17,
        bobSeed: i * 0.83,
      })),
    []
  )

  const debrisGroup = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const g = debrisGroup.current
    if (!g) {
      return
    }
    const t = clock.elapsedTime
    g.children.forEach((ch, i) => {
      const s = debrisState[i]
      if (!s) {
        return
      }
      ch.position.y = s.pos[1] + Math.sin(t * 0.9 + s.bobSeed) * 0.35
      ch.rotation.x = s.rotSeed + t * 0.12
      ch.rotation.y = s.rotSeed * 1.3 + t * 0.18
    })
  })

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onPointerDown}>
        <planeGeometry args={[48, 48, segs, segs]} />
        <meshStandardMaterial
          ref={matRef}
          color={groundTint}
          roughness={roughness}
          metalness={metalness}
          emissive={terrainEmissive ?? '#000000'}
          emissiveIntensity={terrainEmissive ? 0.12 : 0}
        />
      </mesh>
      {VEIN_ANGLES.map((ang, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, ang]}
          position={[Math.cos(ang) * 1.2, 0.04, Math.sin(ang) * 1.2]}
        >
          <planeGeometry args={[22, 0.08]} />
          <meshStandardMaterial
            ref={(el) => {
              veinRefs.current[i] = el
            }}
            color="#1a0a28"
            emissive="#6622aa"
            emissiveIntensity={0.45}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <group ref={debrisGroup}>
        {DEBRIS_BOXES.map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <boxGeometry args={[0.55 + (i % 2) * 0.15, 0.4, 0.5]} />
            <meshStandardMaterial
              color="#2a1538"
              emissive="#501878"
              emissiveIntensity={0.5}
              roughness={0.6}
              metalness={0.35}
            />
          </mesh>
        ))}
      </group>
    </group>
  )
}
