import { Grid, OrbitControls } from '@react-three/drei'
import { BIOME_CONFIG, biomeForStageId } from '../../data/biomes'
import { GameEntities } from '../entities/GameEntities'
import { BiomeEnvironment } from '../environment/BiomeEnvironment'
import { ArenaMarkers } from './ArenaMarkers'
import { GameLoop } from './GameLoop'
import { useGameStore } from '../../store/gameStore'

/**
 * Lit arena + input: click ground to place towers when a tower is selected in the HUD.
 */
export function GameScene() {
  const placementMode = useGameStore((s) => s.placementMode)
  const tryPlaceTowerAtWorld = useGameStore((s) => s.tryPlaceTowerAtWorld)
  const activeStageId = useGameStore((s) => s.activeStageId)
  const cfg = BIOME_CONFIG[biomeForStageId(activeStageId)]

  return (
    <>
      <BiomeEnvironment
        placementMode={placementMode}
        onGroundPointerDown={tryPlaceTowerAtWorld}
      />
      <GameLoop />
      {placementMode !== null ? (
        <Grid
          args={[48, 48]}
          position={[0, 0.02, 0]}
          cellSize={2}
          cellThickness={0.45}
          cellColor={cfg.gridCell}
          sectionSize={4}
          sectionThickness={0.9}
          sectionColor={cfg.gridSection}
          fadeDistance={75}
          infiniteGrid={false}
          followCamera={false}
        />
      ) : null}
      <ArenaMarkers />
      <GameEntities />
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.15}
        maxDistance={60}
        minDistance={12}
      />
    </>
  )
}
