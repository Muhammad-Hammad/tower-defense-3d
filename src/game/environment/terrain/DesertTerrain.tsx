import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { BufferGeometry, MeshStandardMaterial } from 'three'
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

function displaceDesert(geo: BufferGeometry) {
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i)
    const outer = Math.abs(v.x) > 14 || Math.abs(v.z) > 14 ? 1 : 0
    const taper = THREE.MathUtils.smoothstep(Math.max(Math.abs(v.x), Math.abs(v.z)), 10, 14)
    const w = outer > 0 ? 1 : taper
    const h = Math.sin(v.x * 0.3) * Math.cos(v.z * 0.25) * 1.8 * w
    v.y = h
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
}

const ROCK_SPOTS: readonly [number, number, number][] = [
  [18, 0, 16],
  [-16, 0, 17],
  [13, 0, -18],
  [-18, 0, -13],
]

export function DesertTerrain({
  subdiv,
  groundTint,
  roughness,
  metalness,
  terrainEmissive,
  matRef,
  onPointerDown,
}: Props) {
  const segs = Math.max(32, Math.min(subdiv, 128))
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(48, 48, segs, segs)
    displaceDesert(g)
    return g
  }, [segs])

  const shimmerRef = useRef<MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    const m = shimmerRef.current
    if (!m) {
      return
    }
    const t = clock.elapsedTime
    m.opacity = 0.08 + 0.06 * Math.sin(t * 1.8)
    m.emissiveIntensity = 0.06 + 0.05 * Math.sin(t * 2.1)
  })

  return (
    <group>
      <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onPointerDown}>
        <meshStandardMaterial
          ref={matRef}
          color={groundTint}
          roughness={roughness}
          metalness={metalness}
          emissive={terrainEmissive ?? '#000000'}
          emissiveIntensity={terrainEmissive ? 0.06 : 0}
        />
      </mesh>
      {ROCK_SPOTS.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y + 0.4, z]} scale={[1.15, 0.75, 1]}>
          <dodecahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial color="#a67c52" roughness={0.9} metalness={0.06} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[52, 52, 1, 1]} />
        <meshStandardMaterial
          ref={shimmerRef}
          color="#f5e6c8"
          transparent
          opacity={0.12}
          depthWrite={false}
          emissive="#ffe4a8"
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  )
}
