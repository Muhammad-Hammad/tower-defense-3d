import type { ThreeEvent } from '@react-three/fiber'
import type { MeshStandardMaterial } from 'three'
import type { BiomeType } from '../../../data/biomes'
import { DesertTerrain } from './DesertTerrain'
import { FrozenTerrain } from './FrozenTerrain'
import { GrasslandsTerrain } from './GrasslandsTerrain'
import { NightmareTerrain } from './NightmareTerrain'
import { VolcanicTerrain } from './VolcanicTerrain'

type Props = {
  biomeId: BiomeType
  subdiv: number
  groundTint: string
  roughness: number
  metalness: number
  terrainEmissive?: string
  matRef: React.RefObject<MeshStandardMaterial | null>
  onPointerDown: (e: ThreeEvent<MouseEvent>) => void
}

export function BiomeTerrain({
  biomeId,
  subdiv,
  groundTint,
  roughness,
  metalness,
  terrainEmissive,
  matRef,
  onPointerDown,
}: Props) {
  const common = {
    subdiv,
    groundTint,
    roughness,
    metalness,
    terrainEmissive,
    matRef,
    onPointerDown,
  }

  switch (biomeId) {
    case 'grasslands':
      return <GrasslandsTerrain {...common} />
    case 'desert':
      return <DesertTerrain {...common} />
    case 'frozen':
      return <FrozenTerrain {...common} />
    case 'volcanic':
      return <VolcanicTerrain {...common} />
    case 'nightmare':
      return <NightmareTerrain {...common} />
  }
}
