import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { MeshStandardMaterial } from 'three'

type Props = {
  subdiv: number
  groundTint: string
  roughness: number
  metalness: number
  terrainEmissive?: string
  matRef: React.RefObject<MeshStandardMaterial | null>
  onPointerDown: (e: ThreeEvent<MouseEvent>) => void
}

export function VolcanicTerrain({
  subdiv,
  groundTint,
  roughness,
  metalness,
  terrainEmissive,
  matRef,
  onPointerDown,
}: Props) {
  const segs = Math.max(24, Math.min(subdiv, 80))
  const craterRef = useRef<MeshStandardMaterial>(null)
  const lavaTopRef = useRef<MeshStandardMaterial>(null)
  const lavaRiverA = useRef<MeshStandardMaterial>(null)
  const lavaRiverB = useRef<MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pulse = 0.65 + 0.35 * Math.sin(t * 2.8)
    if (craterRef.current) {
      craterRef.current.emissiveIntensity = 1.1 + 0.4 * pulse
    }
    if (lavaTopRef.current) {
      lavaTopRef.current.emissiveIntensity = 0.95 + 0.35 * Math.cos(t * 2.2)
    }
    if (lavaRiverA.current) {
      lavaRiverA.current.emissiveIntensity = 1.15 + 0.25 * Math.sin(t * 1.9)
    }
    if (lavaRiverB.current) {
      lavaRiverB.current.emissiveIntensity = 1.05 + 0.3 * Math.cos(t * 2.4)
    }
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

      <group position={[-18, 0, -16]}>
        <mesh position={[0, 6, 0]}>
          <coneGeometry args={[6, 12, 16]} />
          <meshStandardMaterial color="#2a1810" roughness={0.9} metalness={0.12} />
        </mesh>
        <mesh position={[0, 11.2, 0]}>
          <coneGeometry args={[2.2, 2.8, 12]} />
          <meshStandardMaterial
            ref={craterRef}
            color="#1a0804"
            emissive="#ff4400"
            emissiveIntensity={1.2}
            roughness={0.42}
          />
        </mesh>
        <mesh position={[0, 12.15, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.4, 0.8, 12]} />
          <meshStandardMaterial
            ref={lavaTopRef}
            color="#ff2200"
            emissive="#ffaa00"
            emissiveIntensity={1}
            roughness={0.35}
          />
        </mesh>
      </group>

      <mesh position={[14, 0.12, 8]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[14, 0.22, 2.2]} />
        <meshStandardMaterial
          ref={lavaRiverA}
          color="#3a0a04"
          emissive="#ff3300"
          emissiveIntensity={1.2}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[-10, 0.12, -14]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[18, 0.2, 2]} />
        <meshStandardMaterial
          ref={lavaRiverB}
          color="#3a1008"
          emissive="#ff4400"
          emissiveIntensity={1.15}
          roughness={0.42}
          metalness={0.18}
        />
      </mesh>
      <mesh position={[6, 0.08, -12]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[10, 0.18, 1.7]} />
        <meshStandardMaterial
          color="#3a0806"
          emissive="#ff5500"
          emissiveIntensity={1}
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>
    </group>
  )
}
