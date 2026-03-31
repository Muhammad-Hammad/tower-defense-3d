import { OrbitControls, Text } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useCallback, useState } from 'react'
import { BIOME_CONFIG, BIOME_ORDER, type BiomeType } from '../../data/biomes'
import { ALL_STAGES } from '../../data/stages'
import { isStageUnlocked, stageStarsFor } from '../../meta/stageUnlock'
import type { Difficulty } from '../../store/progressStore'
import type { StageProgressEntry } from '../../store/progressStore'

type Props = {
  activeStageId: number
  setActiveStageId: (id: number) => void
  selectedDifficulty: Difficulty
  stagesProgress: Record<string, StageProgressEntry>
  onTapUi: () => void
  /** Full viewport overlay with optional close control */
  fullscreen?: boolean
  onClose?: () => void
}

/** Embed layout (sidebar canvas). */
const ISLAND_POS_EMBED: Record<BiomeType, readonly [number, number, number]> = {
  grasslands: [-8, 0, 2],
  desert: [-4, 0, -4],
  frozen: [0, 0, -6],
  volcanic: [5, 0, -3],
  nightmare: [9, 0, 2],
}

/** Full-screen overlay — wider spread for readability. */
const ISLAND_POS_FS: Record<BiomeType, readonly [number, number, number]> = {
  grasslands: [-14, 0, 3.5],
  desert: [-7, 0, -7],
  frozen: [0, 0, -10],
  volcanic: [9, 0, -5],
  nightmare: [16, 0, 3.5],
}

function StagePlates({
  biome,
  difficulty,
  stagesProgress,
  activeStageId,
  onPick,
  onTapUi,
  plateSpacing,
  plateBox,
  fontStage,
  fontStar,
}: {
  biome: BiomeType
  difficulty: Difficulty
  stagesProgress: Record<string, StageProgressEntry>
  activeStageId: number
  onPick: (id: number) => void
  onTapUi: () => void
  plateSpacing: number
  plateBox: readonly [number, number, number]
  fontStage: number
  fontStar: number
}) {
  const stages = ALL_STAGES.filter((s) => s.biome === biome)
  return (
    <group position={[0, 0.65, 0]}>
      {stages.map((st, i) => {
        const unlocked = isStageUnlocked(st.id, difficulty, stagesProgress)
        const stars = stageStarsFor(st.id, difficulty, stagesProgress)
        const active = st.id === activeStageId
        const x = (i - (stages.length - 1) / 2) * plateSpacing
        return (
          <group key={st.id} position={[x, 0, 0]}>
            <mesh
              userData={{ kind: 'stage', stageId: st.id }}
              onClick={(e) => {
                e.stopPropagation()
                if (!unlocked) {
                  return
                }
                onTapUi()
                onPick(st.id)
              }}
            >
              <boxGeometry args={[plateBox[0], plateBox[1], plateBox[2]]} />
              <meshStandardMaterial
                color={active ? '#fbbf24' : unlocked ? '#15803d' : '#475569'}
                emissive={active ? '#92400e' : '#000000'}
                emissiveIntensity={active ? 0.35 : 0}
                transparent={!unlocked}
                opacity={unlocked ? 1 : 0.55}
              />
            </mesh>
            <Text
              position={[0, plateBox[1] + 0.22, 0]}
              fontSize={fontStage}
              color={unlocked ? '#f8fafc' : '#94a3b8'}
              anchorX="center"
              anchorY="middle"
            >
              {`${st.id}`}
            </Text>
            <Text
              position={[0, plateBox[1] * 0.35, plateBox[2] * 0.55]}
              fontSize={fontStar}
              color="#fef08a"
              anchorX="center"
              anchorY="middle"
            >
              {unlocked ? `${stars}*` : 'lock'}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

function WorldMapInner({
  activeStageId,
  setActiveStageId,
  selectedDifficulty,
  stagesProgress,
  onTapUi,
  fullscreen,
  onClose,
}: Props) {
  const [expanded, setExpanded] = useState<BiomeType | null>('grasslands')
  const fs = !!fullscreen

  const islandTable = fs ? ISLAND_POS_FS : ISLAND_POS_EMBED
  const basePlane: readonly [number, number] = fs ? [7.5, 6] : [5.5, 4.2]
  const biomeBox: readonly [number, number, number] = fs ? [7, 0.5, 5.5] : [5.2, 0.35, 3.9]
  const labelSize = fs ? 0.65 : 0.42
  const hintSize = fs ? 0.28 : 0.22
  const plateSpacing = fs ? 1.45 : 1.05
  const plateBox = fs ? ([1.4, 0.25, 1.1] as const) : ([0.95, 0.2, 0.75] as const)
  const fontStage = fs ? 0.45 : 0.28
  const fontStar = fs ? 0.2 : 0.16

  const pickStage = useCallback(
    (id: number) => {
      setActiveStageId(id)
      if (fs && onClose) {
        onClose()
      }
    },
    [fs, onClose, setActiveStageId]
  )

  const toggle = useCallback((b: BiomeType) => {
    onTapUi()
    setExpanded((prev) => (prev === b ? null : b))
  }, [onTapUi])

  return (
    <>
      <color attach="background" args={['#0f172a']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[12, 18, 10]} intensity={1.05} />
      <hemisphereLight args={['#e8f0ff', '#1e293b', 0.45]} />

      {BIOME_ORDER.map((biome) => {
        const cfg = BIOME_CONFIG[biome]
        const pos = islandTable[biome]
        const isEx = expanded === biome
        return (
          <group key={biome} position={pos}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0, 0]}
              onClick={(e) => {
                e.stopPropagation()
                toggle(biome)
              }}
            >
              <planeGeometry args={[basePlane[0], basePlane[1]]} />
              <meshStandardMaterial color={cfg.groundColor} roughness={0.88} metalness={0.08} />
            </mesh>
            <mesh
              position={[0, biomeBox[1] * 0.4, 0]}
              onClick={(e) => {
                e.stopPropagation()
                toggle(biome)
              }}
            >
              <boxGeometry args={[biomeBox[0], biomeBox[1], biomeBox[2]]} />
              <meshStandardMaterial
                color={cfg.groundColor}
                roughness={0.82}
                emissive={cfg.terrainEmissive ?? '#000000'}
                emissiveIntensity={cfg.terrainEmissive ? 0.1 : 0}
              />
            </mesh>
            <Text position={[0, 1.45, 0]} fontSize={labelSize} color="#f1f5f9" anchorX="center" anchorY="middle">
              {cfg.label}
            </Text>
            <Text
              position={[0, 1.05, 0]}
              fontSize={hintSize}
              color="#94a3b8"
              anchorX="center"
              anchorY="middle"
            >
              {isEx ? 'Click stage tile' : 'Click to expand'}
            </Text>
            {isEx ? (
              <StagePlates
                biome={biome}
                difficulty={selectedDifficulty}
                stagesProgress={stagesProgress}
                activeStageId={activeStageId}
                onPick={pickStage}
                onTapUi={onTapUi}
                plateSpacing={plateSpacing}
                plateBox={plateBox}
                fontStage={fontStage}
                fontStar={fontStar}
              />
            ) : null}
          </group>
        )
      })}

      <OrbitControls
        enablePan
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={fs ? 14 : 10}
        maxDistance={fs ? 52 : 36}
        target={fs ? [3, 0, -3] : [2, 0, -2]}
      />
    </>
  )
}

export function StageSelectScreen({ fullscreen, onClose, ...props }: Props) {
  const canvas = (
    <Canvas
      className={fullscreen ? 'h-full min-h-0 w-full' : undefined}
      camera={
        fullscreen
          ? { position: [8, 22, 30] as [number, number, number], fov: 38 }
          : { position: [6, 16, 22] as [number, number, number], fov: 42 }
      }
      gl={{ alpha: false }}
    >
      <WorldMapInner {...props} fullscreen={fullscreen} onClose={onClose} />
    </Canvas>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/97">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Campaign map</h3>
          {onClose ? (
            <button
              type="button"
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
              onClick={() => {
                props.onTapUi()
                onClose()
              }}
            >
              Close
            </button>
          ) : null}
        </div>
        <div className="min-h-0 flex-1">{canvas}</div>
      </div>
    )
  }

  return (
    <div className="h-80 w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950 sm:h-96">
      {canvas}
    </div>
  )
}
