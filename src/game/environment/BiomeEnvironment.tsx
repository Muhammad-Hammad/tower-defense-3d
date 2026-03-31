import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, MeshStandardMaterial } from 'three'
import {
  BIOME_CONFIG,
  biomeForStageId,
  type BiomeType,
} from '../../data/biomes'
import { useGameStore } from '../../store/gameStore'
import type { PlacementMode } from '../../store/gameStore'
import { WeatherParticles } from './WeatherParticles'
import { BiomeTerrain } from './terrain/BiomeTerrain'

type Props = {
  placementMode: PlacementMode
  onGroundPointerDown: (x: number, z: number) => void
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

function GrasslandsDecor() {
  return (
    <>
      <ProceduralTree x={18} z={14} s={1.05} />
      <ProceduralTree x={-16} z={12} s={0.92} />
      <ProceduralTree x={15} z={-17} s={1.1} />
      <ProceduralTree x={-18} z={-14} s={0.88} />
    </>
  )
}

function LavaPool({ x, z }: { x: number; z: number }) {
  const ref = useRef<MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (!ref.current) {
      return
    }
    const t = clock.elapsedTime
    ref.current.emissiveIntensity = 0.5 + 0.35 * Math.sin(t * 2.3 + x + z)
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, z]}>
      <circleGeometry args={[1.4, 32]} />
      <meshStandardMaterial
        ref={ref}
        color="#3a1810"
        emissive="#ff4400"
        emissiveIntensity={0.65}
        roughness={0.35}
        metalness={0.15}
      />
    </mesh>
  )
}

function VolcanicDecor() {
  return (
    <>
      <LavaPool x={14} z={10} />
      <LavaPool x={-12} z={-11} />
      <LavaPool x={9} z={-15} />
    </>
  )
}

function IceCrystal({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
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
      <mesh rotation={[0.2, 0.4, 0]} position={[0.15, 0.35, 0]}>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color="#e8f8ff"
          emissive="#b0e0ff"
          emissiveIntensity={0.45}
          metalness={0.3}
          roughness={0.18}
        />
      </mesh>
    </group>
  )
}

function FrozenDecor() {
  return (
    <>
      <IceCrystal x={17} z={16} rot={0.5} />
      <IceCrystal x={-16} z={14} rot={1.1} />
      <IceCrystal x={14} z={-17} rot={2.2} />
      <IceCrystal x={-14} z={-16} rot={0.8} />
    </>
  )
}

function RuneStone({ x, z }: { x: number; z: number }) {
  const ref = useRef<Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) {
      return
    }
    ref.current.rotation.y += dt * 0.35
  })
  return (
    <group ref={ref} position={[x, 1.2, z]}>
      <mesh>
        <boxGeometry args={[0.35, 2.2, 0.55]} />
        <meshStandardMaterial
          color="#2a1050"
          emissive="#6622aa"
          emissiveIntensity={0.55}
          metalness={0.4}
          roughness={0.45}
        />
      </mesh>
    </group>
  )
}

function NightmareDecor() {
  return (
    <>
      <RuneStone x={13} z={11} />
      <RuneStone x={-14} z={9} />
      <RuneStone x={10} z={-14} />
    </>
  )
}

function BiomeDecorations({ biomeId }: { biomeId: BiomeType }) {
  switch (biomeId) {
    case 'grasslands':
      return <GrasslandsDecor />
    case 'volcanic':
      return <VolcanicDecor />
    case 'frozen':
      return <FrozenDecor />
    case 'nightmare':
      return <NightmareDecor />
    default:
      return null
  }
}

export function BiomeEnvironment({ placementMode, onGroundPointerDown }: Props) {
  const activeStageId = useGameStore((s) => s.activeStageId)
  const clearSelection = useGameStore((s) => s.clearSelection)
  const biomeId = biomeForStageId(activeStageId)
  const cfg = BIOME_CONFIG[biomeId]

  const matRef = useRef<MeshStandardMaterial>(null)
  const pulse = useRef(0)

  useFrame((_, dt) => {
    if (!cfg.terrainEmissive || !matRef.current) {
      return
    }
    pulse.current += dt * (biomeId === 'nightmare' ? 1.2 : 0.9)
    const w = 0.5 + 0.5 * Math.sin(pulse.current)
    matRef.current.emissiveIntensity = 0.08 + w * 0.22
  })

  const groundTint =
    placementMode === 'upgrade' ? '#6b5345' : placementMode ? '#458256' : cfg.groundColor

  return (
    <>
      <color attach="background" args={[cfg.skyColor]} />
      <fog attach="fog" args={[cfg.fogColor, cfg.fogNear, cfg.fogFar]} />
      <ambientLight intensity={cfg.ambientIntensity} />
      <directionalLight position={[...cfg.sunPos]} intensity={1.05} color={cfg.sunColor} />

      <WeatherParticles weather={cfg.weather} />

      <BiomeDecorations biomeId={biomeId} />

      <BiomeTerrain
        biomeId={biomeId}
        subdiv={cfg.terrainSubdivision}
        groundTint={groundTint}
        roughness={cfg.groundRoughness}
        metalness={cfg.groundMetalness}
        terrainEmissive={cfg.terrainEmissive}
        matRef={matRef}
        onPointerDown={(e) => {
          e.stopPropagation()
          clearSelection()
          if (placementMode !== null) {
            onGroundPointerDown(e.point.x, e.point.z)
          }
        }}
      />
    </>
  )
}
