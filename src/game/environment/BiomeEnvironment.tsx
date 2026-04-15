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
import { KenneyBiomeDecorations } from './KenneyBiomeDecor'

type Props = {
  placementMode: PlacementMode
  onGroundPointerDown: (x: number, z: number) => void
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

function VolcanicLavaDecor() {
  return (
    <>
      <LavaPool x={14} z={10} />
      <LavaPool x={-12} z={-11} />
      <LavaPool x={9} z={-15} />
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
    case 'desert':
    case 'frozen':
      return <KenneyBiomeDecorations biomeId={biomeId} />
    case 'volcanic':
      return (
        <>
          <VolcanicLavaDecor />
          <KenneyBiomeDecorations biomeId="volcanic" />
        </>
      )
    case 'nightmare':
      return (
        <>
          <NightmareDecor />
          <KenneyBiomeDecorations biomeId="nightmare" />
        </>
      )
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
