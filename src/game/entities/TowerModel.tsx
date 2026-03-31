import { Center, useGLTF } from '@react-three/drei'
import { Suspense, useLayoutEffect, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import type { Mesh, MeshStandardMaterial } from 'three'
import type { TowerType } from '../../data/towers'
import { ModelErrorBoundary } from './ModelErrorBoundary'

export const TOWER_COLORS: Record<TowerType, string> = {
  archer: '#c9a227',
  cannon: '#4a4a55',
  mage: '#6b3fa3',
  tesla: '#3d6e8c',
  sniper: '#2d5a3d',
  barracks: '#8b5a2b',
  freeze: '#87ceeb',
  mortar: '#8b4513',
}

function UpgradeGlowRings({
  up,
  tint,
}: {
  up: number
  tint: string
}) {
  if (up <= 0) {
    return null
  }
  const emissive = new THREE.Color(tint).multiplyScalar(0.85)
  return (
    <group position={[0, 0.08, 0]}>
      {Array.from({ length: up }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, i * 0.075, 0]}>
          <torusGeometry args={[1.1 + i * 0.08, 0.08, 10, 28]} />
          <meshStandardMaterial
            color={tint}
            emissive={emissive}
            emissiveIntensity={1.1 + i * 0.15}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

type ProcDims = {
  baseR: number
  baseH: number
  bodyR: number
  bodyH: number
  cap: 'cone' | 'sphere' | 'flat'
}

const PROC_DIMS: Record<TowerType, ProcDims> = {
  archer: { baseR: 0.55, baseH: 1.2, bodyR: 0.34, bodyH: 7.2, cap: 'cone' },
  cannon: { baseR: 1.0, baseH: 1.35, bodyR: 0.66, bodyH: 4.0, cap: 'flat' },
  mage: { baseR: 0.65, baseH: 1.26, bodyR: 0.38, bodyH: 5.5, cap: 'sphere' },
  tesla: { baseR: 0.7, baseH: 1.2, bodyR: 0.36, bodyH: 6.1, cap: 'cone' },
  sniper: { baseR: 0.6, baseH: 1.14, bodyR: 0.26, bodyH: 8.5, cap: 'cone' },
  barracks: { baseR: 1.1, baseH: 1.5, bodyR: 0.58, bodyH: 4.6, cap: 'flat' },
  freeze: { baseR: 0.75, baseH: 1.26, bodyR: 0.4, bodyH: 6.0, cap: 'sphere' },
  mortar: { baseR: 1.0, baseH: 1.44, bodyR: 0.62, bodyH: 5.0, cap: 'flat' },
}

export function ProceduralTower({ kind, up }: { kind: TowerType; up: number }) {
  const color = TOWER_COLORS[kind]
  const d = PROC_DIMS[kind]
  const baseY = d.baseH / 2
  const bodyY = d.baseH + d.bodyH / 2
  const capY = d.baseH + d.bodyH

  let capEl: ReactNode = null
  if (d.cap === 'cone') {
    capEl = (
      <mesh position={[0, capY + 1.65, 0]}>
        <coneGeometry args={[d.bodyR * 1.1, 3.15, 12]} />
        <meshToonMaterial color={color} />
      </mesh>
    )
  } else if (d.cap === 'sphere') {
    capEl = (
      <mesh position={[0, capY + 1.35, 0]}>
        <sphereGeometry args={[1.65, 12, 12]} />
        <meshToonMaterial color={color} />
      </mesh>
    )
  } else {
    capEl = (
      <mesh position={[0, capY + 0.24, 0]}>
        <cylinderGeometry args={[d.bodyR * 1.15, d.bodyR * 1.15, 0.6, 12]} />
        <meshToonMaterial color={color} />
      </mesh>
    )
  }

  return (
    <group>
      <mesh position={[0, baseY, 0]}>
        <cylinderGeometry args={[d.baseR, d.baseR * 1.08, d.baseH, 12]} />
        <meshToonMaterial color={color} />
      </mesh>
      <mesh position={[0, bodyY, 0]}>
        <cylinderGeometry args={[d.bodyR * 0.92, d.bodyR, d.bodyH, 12]} />
        <meshToonMaterial color={color} />
      </mesh>
      {capEl}
      <UpgradeGlowRings up={up} tint="#f0e68c" />
    </group>
  )
}

function TowerGltf({ kind, up }: { kind: TowerType; up: number }) {
  const path = `/models/towers/${kind}.glb`
  const { scene } = useGLTF(path) as { scene: import('three').Object3D }
  const root = useMemo(() => scene.clone(true), [scene, kind])
  const tintHex = TOWER_COLORS[kind]

  useLayoutEffect(() => {
    const tint = new THREE.Color(tintHex)
    root.traverse((obj) => {
      const mesh = obj as Mesh
      if (mesh.isMesh && mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const mat of mats) {
          const m = mat as MeshStandardMaterial
          if (m.color) {
            m.color.copy(tint)
          }
          if (m.emissive) {
            m.emissive.lerp(tint, 0.35)
            m.emissive.r += 0.08 + up * 0.12
            m.emissive.g += 0.06 + up * 0.08
            m.emissive.b += 0.04 * up
          }
          if (typeof m.emissiveIntensity === 'number') {
            m.emissiveIntensity = 0.28 + up * 0.5
          }
        }
      }
    })
  }, [root, up, tintHex])

  return (
    <group rotation={[0, Math.PI, 0]}>
      <Center scale={3.5}>
        <primitive object={root} />
      </Center>
      <UpgradeGlowRings up={up} tint={tintHex} />
    </group>
  )
}

export function TowerModel({ kind, up }: { kind: TowerType; up: number }) {
  return (
    <ModelErrorBoundary fallback={<ProceduralTower kind={kind} up={up} />}>
      <Suspense fallback={<ProceduralTower kind={kind} up={up} />}>
        <TowerGltf kind={kind} up={up} />
      </Suspense>
    </ModelErrorBoundary>
  )
}
