import { Center, useGLTF } from '@react-three/drei'
import { Suspense, useMemo, type ReactNode } from 'react'
import * as THREE from 'three'
import type { BiomeType } from '../../data/biomes'
import { ModelErrorBoundary } from '../entities/ModelErrorBoundary'

type Vec3 = readonly [number, number, number]

function KenneyPropGltf({
  file,
  position,
  rotation = [0, 0, 0] as Vec3,
  scale = 1,
  emissiveTint,
}: {
  file: string
  position: Vec3
  rotation?: Vec3
  scale?: number
  emissiveTint?: string
}) {
  const path = `/models/props/${file}`
  const { scene } = useGLTF(path) as { scene: THREE.Object3D }
  const root = useMemo(() => {
    const c = scene.clone(true)
    if (emissiveTint) {
      const col = new THREE.Color(emissiveTint)
      c.traverse((obj) => {
        const m = obj as THREE.Mesh
        if (m.isMesh && m.material) {
          const mats = Array.isArray(m.material) ? m.material : [m.material]
          for (const mat of mats) {
            const std = mat as THREE.MeshStandardMaterial
            if (std.emissive) {
              std.emissive.lerp(col, 0.55)
            }
            if (typeof std.emissiveIntensity === 'number') {
              std.emissiveIntensity = Math.max(std.emissiveIntensity, 0.4)
            }
          }
        }
      })
    }
    return c
  }, [scene, emissiveTint])

  return (
    <group position={[...position]} rotation={[...rotation]}>
      <Center scale={scale}>
        <primitive object={root} />
      </Center>
    </group>
  )
}

function KenneyProp({
  file,
  position,
  rotation,
  scale,
  emissiveTint,
  fallback,
}: {
  file: string
  position: Vec3
  rotation?: Vec3
  scale?: number
  emissiveTint?: string
  fallback: ReactNode
}) {
  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <KenneyPropGltf
          file={file}
          position={position}
          rotation={rotation}
          scale={scale}
          emissiveTint={emissiveTint}
        />
      </Suspense>
    </ModelErrorBoundary>
  )
}

function ProceduralTree({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1.0, 8]} />
        <meshStandardMaterial color="#5a3d28" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <coneGeometry args={[0.55, 1.1, 8]} />
        <meshStandardMaterial color="#2d6b38" roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <coneGeometry args={[0.4, 0.85, 8]} />
        <meshStandardMaterial color="#3a8048" roughness={0.75} />
      </mesh>
    </group>
  )
}

function IceCrystalFallback({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  return (
    <group position={[x, 0.45, z]} rotation={[0, rot, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0.35]}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#d8f0ff"
          emissive="#a8d8ff"
          emissiveIntensity={0.35}
          metalness={0.25}
          roughness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>
    </group>
  )
}

export function KenneyBiomeDecorations({ biomeId }: { biomeId: BiomeType }) {
  switch (biomeId) {
    case 'grasslands':
      return (
        <>
          <KenneyProp
            file="detail-tree-large.glb"
            position={[18, 0, 14]}
            scale={3.1}
            fallback={<ProceduralTree x={18} z={14} s={1.05} />}
          />
          <KenneyProp
            file="detail-tree-small.glb"
            position={[-16, 0, 12]}
            scale={2.85}
            fallback={
              <KenneyProp
                file="detail-tree-large.glb"
                position={[-16, 0, 12]}
                scale={2.55}
                rotation={[0, 0.9, 0]}
                fallback={<ProceduralTree x={-16} z={12} s={0.92} />}
              />
            }
          />
          <KenneyProp
            file="detail-tree-large.glb"
            position={[15, 0, -17]}
            scale={3.25}
            rotation={[0, 1.1, 0]}
            fallback={<ProceduralTree x={15} z={-17} s={1.1} />}
          />
          <KenneyProp
            file="detail-tree-small.glb"
            position={[-18, 0, -14]}
            scale={2.75}
            rotation={[0, 2.4, 0]}
            fallback={
              <KenneyProp
                file="detail-tree-large.glb"
                position={[-18, 0, -14]}
                scale={2.45}
                rotation={[0, 2.4, 0]}
                fallback={<ProceduralTree x={-18} z={-14} s={0.88} />}
              />
            }
          />
        </>
      )
    case 'desert':
      return (
        <>
          <KenneyProp
            file="rock-large.glb"
            position={[17, 0, 15]}
            scale={2.4}
            fallback={
              <KenneyProp
                file="tile-rock.glb"
                position={[17, 0, 15]}
                scale={2.6}
                fallback={null}
              />
            }
          />
          <KenneyProp
            file="rock-flat.glb"
            position={[-15, 0, 13]}
            scale={2.2}
            rotation={[0, 0.7, 0]}
            fallback={
              <KenneyProp
                file="selection-a.glb"
                position={[-15, 0, 13]}
                scale={1.15}
                rotation={[0, 0.7, 0]}
                fallback={null}
              />
            }
          />
          <KenneyProp
            file="rock-large.glb"
            position={[14, 0, -16]}
            scale={2.1}
            rotation={[0, 2.2, 0]}
            fallback={
              <KenneyProp
                file="tower-square-bottom-a.glb"
                position={[14, 0, -16]}
                scale={1.8}
                rotation={[0, 2.2, 0]}
                fallback={null}
              />
            }
          />
          <KenneyProp
            file="wood-log.glb"
            position={[-17, 0, -12]}
            scale={2.6}
            rotation={[0, 1.4, 0]}
            fallback={
              <KenneyProp
                file="tower-round-bottom-a.glb"
                position={[-17, 0, -12]}
                scale={1.7}
                rotation={[0, 1.4, 0]}
                fallback={null}
              />
            }
          />
        </>
      )
    case 'frozen':
      return (
        <>
          <KenneyProp
            file="snow-detail-tree.glb"
            position={[17, 0, 16]}
            scale={3.0}
            fallback={<IceCrystalFallback x={17} z={16} rot={0.5} />}
          />
          <KenneyProp
            file="snow-detail-crystal-large.glb"
            position={[-16, 0, 14]}
            scale={2.0}
            fallback={<IceCrystalFallback x={-16} z={14} rot={1.1} />}
          />
          <KenneyProp
            file="snow-detail-dirt-large.glb"
            position={[14, 0, -17]}
            scale={2.3}
            fallback={<IceCrystalFallback x={14} z={-17} rot={2.2} />}
          />
          <KenneyProp
            file="snow-detail-crystal-large.glb"
            position={[-14, 0, -16]}
            scale={1.85}
            rotation={[0, 0.9, 0]}
            fallback={<IceCrystalFallback x={-14} z={-16} rot={0.8} />}
          />
        </>
      )
    case 'volcanic':
      return (
        <>
          <KenneyProp
            file="rock-large.glb"
            position={[16, 0, 11]}
            scale={2.35}
            fallback={
              <KenneyProp
                file="tile-rock.glb"
                position={[16, 0, 11]}
                scale={2.9}
                fallback={null}
              />
            }
          />
          <KenneyProp
            file="rock-flat.glb"
            position={[-13, 0, -12]}
            scale={2.0}
            fallback={
              <KenneyProp
                file="selection-a.glb"
                position={[-13, 0, -12]}
                scale={1.05}
                fallback={null}
              />
            }
          />
          <KenneyProp
            file="tile-rock.glb"
            position={[11, 0, -14]}
            scale={2.8}
            rotation={[0, 0.5, 0]}
            fallback={null}
          />
        </>
      )
    case 'nightmare':
      return (
        <>
          <KenneyProp
            file="detail-crystal-large.glb"
            position={[13, 0, 11]}
            scale={2.2}
            emissiveTint="#6622aa"
            fallback={null}
          />
          <KenneyProp
            file="detail-crystal-large.glb"
            position={[-14, 0, 9]}
            scale={1.95}
            rotation={[0, 1.2, 0]}
            emissiveTint="#441888"
            fallback={null}
          />
          <KenneyProp
            file="selection-b.glb"
            position={[10, 0.02, -14]}
            scale={1.1}
            emissiveTint="#8844cc"
            fallback={null}
          />
        </>
      )
    default:
      return null
  }
}
