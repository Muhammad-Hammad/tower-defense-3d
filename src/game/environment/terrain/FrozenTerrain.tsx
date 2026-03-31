import { useMemo } from 'react'
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

function displaceSnow(geo: BufferGeometry) {
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i)
    const dist = Math.sqrt(v.x * v.x + v.z * v.z)
    const edge = THREE.MathUtils.smoothstep(dist, 10, 22)
    const h = Math.abs(Math.sin(v.x * 0.2 + v.z * 0.15)) * 1.2 * edge
    v.y = h
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
}

const BANKS: readonly [number, number, number][] = [
  [17, 0, 15],
  [-17, 0, 14],
  [14, 0, -17],
  [-15, 0, -15],
  [19, 0, -10],
  [-12, 0, 18],
]

export function FrozenTerrain({
  subdiv,
  groundTint,
  roughness,
  metalness,
  terrainEmissive,
  matRef,
  onPointerDown,
}: Props) {
  const segs = Math.max(28, Math.min(subdiv, 96))
  const geom = useMemo(() => {
    const g = new THREE.PlaneGeometry(48, 48, segs, segs)
    displaceSnow(g)
    return g
  }, [segs])

  return (
    <group>
      <mesh geometry={geom} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onPointerDown}>
        <meshStandardMaterial
          ref={matRef}
          color={groundTint}
          roughness={roughness}
          metalness={metalness}
          emissive={terrainEmissive ?? '#b8d4f0'}
          emissiveIntensity={terrainEmissive ? 0.08 : 0.05}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[48, 48, 1, 1]} />
        <meshStandardMaterial
          color="#f0f8ff"
          transparent
          opacity={0.22}
          roughness={0.3}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>
      {BANKS.map(([x, , z], i) => (
        <mesh key={i} position={[x, 0.45, z]} scale={[3, 0.6, 2]}>
          <sphereGeometry args={[0.42, 14, 12]} />
          <meshStandardMaterial
            color="#eef6ff"
            roughness={0.22}
            metalness={0.28}
            emissive="#cfe8ff"
            emissiveIntensity={0.12}
          />
        </mesh>
      ))}
    </group>
  )
}
