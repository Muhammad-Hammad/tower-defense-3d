export type BiomeType =
  | 'grasslands'
  | 'desert'
  | 'frozen'
  | 'volcanic'
  | 'nightmare'

export type WeatherKind = 'wind' | 'sandstorm' | 'snow' | 'ash' | 'darkfog'

export type BiomeConfig = {
  id: BiomeType
  label: string
  /** Stage ID range [from, to] inclusive. */
  stageRange: readonly [number, number]
  skyColor: string
  fogColor: string
  fogNear: number
  fogFar: number
  groundColor: string
  groundRoughness: number
  groundMetalness: number
  gridCell: string
  gridSection: string
  ambientIntensity: number
  sunColor: string
  sunPos: readonly [number, number, number]
  weather: WeatherKind
  /** Emissive tint for “crack” pulse (volcanic / nightmare). */
  terrainEmissive?: string
  /** Plane / displacement segments for terrain mesh (per-axis subdivisions). */
  terrainSubdivision: number
}

export const BIOME_CONFIG: Record<BiomeType, BiomeConfig> = {
  grasslands: {
    id: 'grasslands',
    label: 'Grasslands',
    stageRange: [1, 10],
    skyColor: '#6eb3d9',
    fogColor: '#9ec9e8',
    fogNear: 28,
    fogFar: 95,
    groundColor: '#3d6b47',
    groundRoughness: 0.85,
    groundMetalness: 0.05,
    gridCell: '#8fbc8f',
    gridSection: '#2d4a35',
    ambientIntensity: 0.55,
    sunColor: '#fff8e7',
    sunPos: [12, 20, 8],
    weather: 'wind',
    terrainSubdivision: 48,
  },
  desert: {
    id: 'desert',
    label: 'Desert',
    stageRange: [11, 15],
    skyColor: '#d4a574',
    fogColor: '#e8c9a0',
    fogNear: 22,
    fogFar: 88,
    groundColor: '#c9a057',
    groundRoughness: 0.95,
    groundMetalness: 0.02,
    gridCell: '#deb887',
    gridSection: '#8b6914',
    ambientIntensity: 0.65,
    sunColor: '#ffe566',
    sunPos: [18, 24, 6],
    weather: 'sandstorm',
    terrainSubdivision: 96,
  },
  frozen: {
    id: 'frozen',
    label: 'Frozen',
    stageRange: [16, 20],
    skyColor: '#a8c8e8',
    fogColor: '#d8e8f8',
    fogNear: 18,
    fogFar: 72,
    groundColor: '#b8d4e8',
    groundRoughness: 0.35,
    groundMetalness: 0.15,
    gridCell: '#e0f0ff',
    gridSection: '#6a8caf',
    ambientIntensity: 0.5,
    sunColor: '#eef8ff',
    sunPos: [8, 16, 14],
    weather: 'snow',
    terrainSubdivision: 72,
  },
  volcanic: {
    id: 'volcanic',
    label: 'Volcanic',
    stageRange: [21, 25],
    skyColor: '#2a1810',
    fogColor: '#3d2820',
    fogNear: 12,
    fogFar: 55,
    groundColor: '#2c2c2c',
    groundRoughness: 0.9,
    groundMetalness: 0.12,
    gridCell: '#5a3a32',
    gridSection: '#1a0a08',
    ambientIntensity: 0.35,
    sunColor: '#ff6a2d',
    sunPos: [-10, 14, 8],
    weather: 'ash',
    terrainEmissive: '#4a1208',
    terrainSubdivision: 48,
  },
  nightmare: {
    id: 'nightmare',
    label: 'Nightmare',
    stageRange: [26, 30],
    skyColor: '#0a0518',
    fogColor: '#1a0a28',
    fogNear: 8,
    fogFar: 42,
    groundColor: '#1a1028',
    groundRoughness: 0.75,
    groundMetalness: 0.25,
    gridCell: '#4a3058',
    gridSection: '#0f0818',
    ambientIntensity: 0.22,
    sunColor: '#8866ff',
    sunPos: [4, 8, -12],
    weather: 'darkfog',
    terrainEmissive: '#2a1050',
    terrainSubdivision: 48,
  },
}

export const BIOME_ORDER: readonly BiomeType[] = [
  'grasslands',
  'desert',
  'frozen',
  'volcanic',
  'nightmare',
]

export function biomeForStageId(stageId: number): BiomeType {
  for (const b of BIOME_ORDER) {
    const [a, z] = BIOME_CONFIG[b].stageRange
    if (stageId >= a && stageId <= z) {
      return b
    }
  }
  return 'grasslands'
}
