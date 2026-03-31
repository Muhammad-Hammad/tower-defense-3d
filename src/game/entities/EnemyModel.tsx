import { Center, useGLTF } from '@react-three/drei'
import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import { enemyConfigs } from '../../data/enemies'
import type { EnemyInst } from '../types'
import { ModelErrorBoundary } from './ModelErrorBoundary'

const HUE: Partial<Record<EnemyInst['type'], string>> = {
  flyer: '#6eb8d4',
  wraith: '#5c3d6b',
  tank: '#4a5d4a',
}

function ProceduralEnemy({ enemy }: { enemy: EnemyInst }) {
  const ref = useRef<Mesh>(null)
  const cfg = enemyConfigs[enemy.type]
  const dim = cfg.invisible && !enemy.revealed
  const hue = HUE[enemy.type] ?? '#8b2942'

  useFrame(({ clock }) => {
    if (!ref.current) {
      return
    }
    const bob = Math.sin(clock.elapsedTime * 9 + enemy.pos.x * 0.65) * 0.08
    ref.current.position.y = 0.55 + bob
  })

  return (
    <mesh ref={ref} position={[0, enemy.pathMode === 'air' ? 1.1 : 0.55, 0]}>
      <sphereGeometry args={[enemy.type === 'brute' ? 0.62 : 0.48, 14, 14]} />
      <meshToonMaterial color={hue} transparent={dim} opacity={dim ? 0.35 : 1} />
    </mesh>
  )
}

function EnemyGltf({ enemy }: { enemy: EnemyInst }) {
  const path = `/models/enemies/${enemy.type}.glb`
  const { scene } = useGLTF(path) as { scene: import('three').Object3D }
  const cfg = enemyConfigs[enemy.type]
  const dim = cfg.invisible && !enemy.revealed
  const root = useMemo(() => scene.clone(true), [scene, enemy.type])
  const bobRef = useRef<import('three').Group>(null)

  const scale =
    enemy.type === 'runt' ? 0.32 : enemy.type === 'brute' ? 0.72 : enemy.type === 'tank' ? 0.62 : 0.52

  useLayoutEffect(() => {
    root.traverse((obj) => {
      const mesh = obj as Mesh
      if (mesh.isMesh && mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const mat of mats) {
          mat.transparent = dim
          mat.opacity = dim ? 0.35 : 1
          mat.depthWrite = !dim
        }
      }
    })
  }, [root, dim])

  useFrame(({ clock }) => {
    if (!bobRef.current) {
      return
    }
    const bob = Math.sin(clock.elapsedTime * 9 + enemy.pos.x * 0.65) * 0.08
    const yBase = enemy.pathMode === 'air' ? 1.35 : 0.2
    bobRef.current.position.y = yBase + bob
  })

  return (
    <group ref={bobRef}>
      <group rotation={[0, Math.PI, 0]}>
        <Center scale={scale}>
          <primitive object={root} />
        </Center>
      </group>
    </group>
  )
}

export function EnemyModel({ enemy }: { enemy: EnemyInst }) {
  return (
    <ModelErrorBoundary fallback={<ProceduralEnemy enemy={enemy} />}>
      <Suspense fallback={<ProceduralEnemy enemy={enemy} />}>
        <EnemyGltf enemy={enemy} />
      </Suspense>
    </ModelErrorBoundary>
  )
}
