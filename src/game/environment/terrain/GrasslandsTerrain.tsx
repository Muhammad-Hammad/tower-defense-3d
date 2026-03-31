import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import type { InstancedMesh, MeshStandardMaterial } from 'three'
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

const BLADE_COUNT = 200

export function GrasslandsTerrain({
  subdiv,
  groundTint,
  roughness,
  metalness,
  terrainEmissive,
  matRef,
  onPointerDown,
}: Props) {
  const bladesRef = useRef<InstancedMesh>(null)
  const baseRotZ = useRef<number[]>([])
  const tmpMat = useRef(new THREE.Matrix4())
  const tmpPos = useRef(new THREE.Vector3())
  const tmpQuat = useRef(new THREE.Quaternion())
  const tmpScl = useRef(new THREE.Vector3())
  const tmpEuler = useRef(new THREE.Euler())

  const bladeGeo = useMemo(() => new THREE.BoxGeometry(0.04, 0.35, 0.04), [])
  const bladeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#3d7a48',
        roughness: 0.78,
      }),
    []
  )

  useLayoutEffect(() => {
    const mesh = bladesRef.current
    if (!mesh) {
      return
    }
    const dummy = new THREE.Object3D()
    baseRotZ.current = []
    let i = 0
    let attempts = 0
    while (i < BLADE_COUNT && attempts < BLADE_COUNT * 40) {
      attempts += 1
      const x = (Math.random() - 0.5) * 46
      const z = (Math.random() - 0.5) * 46
      if (Math.abs(x) <= 16 && Math.abs(z) <= 16) {
        continue
      }
      dummy.position.set(x, 0.175 + 0.01, z)
      const ry = Math.random() * Math.PI * 2
      const rz = (Math.random() - 0.5) * 0.2
      dummy.rotation.set(0, ry, rz)
      baseRotZ.current[i] = rz
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      i += 1
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.count = i
  }, [])

  useFrame(({ clock }) => {
    const mesh = bladesRef.current
    if (!mesh) {
      return
    }
    const t = clock.elapsedTime
    const mat = tmpMat.current
    const pos = tmpPos.current
    const quat = tmpQuat.current
    const scl = tmpScl.current
    const euler = tmpEuler.current
    const n = mesh.count
    for (let i = 0; i < n; i += 1) {
      mesh.getMatrixAt(i, mat)
      mat.decompose(pos, quat, scl)
      euler.setFromQuaternion(quat, 'YXZ')
      const baseZ = baseRotZ.current[i] ?? 0
      euler.z = baseZ + Math.sin(t * 2 + i * 0.7) * 0.15
      quat.setFromEuler(euler)
      mat.compose(pos, quat, scl)
      mesh.setMatrixAt(i, mat)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  const segs = Math.max(16, Math.min(subdiv, 96))

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[48, 48, segs, segs]} />
        <meshStandardMaterial color="#2a4f30" roughness={0.92} metalness={0.04} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} onPointerDown={onPointerDown}>
        <planeGeometry args={[48, 48, segs, segs]} />
        <meshStandardMaterial
          ref={matRef}
          color={groundTint}
          roughness={roughness}
          metalness={metalness}
          transparent
          opacity={0.88}
          emissive={terrainEmissive ?? '#000000'}
          emissiveIntensity={terrainEmissive ? 0.12 : 0}
        />
      </mesh>
      <instancedMesh ref={bladesRef} args={[bladeGeo, bladeMat, BLADE_COUNT]} frustumCulled={false} />
    </group>
  )
}
