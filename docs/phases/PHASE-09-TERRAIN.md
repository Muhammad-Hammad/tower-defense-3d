# Phase 9 — Terrain, scale, and end-of-run UI

## Goals

1. **Per-biome terrain** — Replace the single subdivided plane with routed terrain components (grasslands, desert, frozen, volcanic, nightmare), driven by `terrainSubdivision` on each `BiomeConfig`.
2. **Build grid** — Show the placement grid only when `placementMode !== null` in [`GameScene.tsx`](../../src/game/core/GameScene.tsx).
3. **Tower scale** — GLTF towers ~**3.5×** (`Center scale` in [`TowerModel.tsx`](../../src/game/entities/TowerModel.tsx)); procedural dims multiply body/base heights ~**3×**; resize `UpgradeGlowRings` torus radii for footprint.
4. **Camera** — Raise [`GameCanvas.tsx`](../../src/game/core/GameCanvas.tsx) camera slightly; increase `OrbitControls` `maxDistance` in `GameScene` for taller assets.
5. **Victory / Defeat** — Fullscreen [`VictoryModal.tsx`](../../src/ui/menus/VictoryModal.tsx) / [`DefeatModal.tsx`](../../src/ui/menus/DefeatModal.tsx); wire from [`App.tsx`](../../src/App.tsx); remove inline win/lose copy and retry from [`GameHud.tsx`](../../src/ui/hud/GameHud.tsx).
6. **Stage map** — [`StageSelectScreen.tsx`](../../src/ui/menus/StageSelectScreen.tsx) as fixed viewport overlay with `onClose`; [`GameHud`](../../src/ui/hud/GameHud.tsx) uses an “Open stage map” button (menu only).
7. **Store** — [`advanceToNextStage`](../../src/store/gameStore.ts) in `gameStore`: clear run, bump `activeStageId` within [`ALL_STAGES`](../../src/data/stages/index.ts), or return to menu if last stage.
8. **SFX** — [`scripts/generate-placeholder-audio.mjs`](../../scripts/generate-placeholder-audio.mjs) uses ADSR-style envelopes; re-run `node scripts/generate-placeholder-audio.mjs`.

## Terrain module layout

- `src/game/environment/terrain/GrasslandsTerrain.tsx` — Soil + grass planes, instanced edge blades.
- `src/game/environment/terrain/DesertTerrain.tsx` — Displaced dunes at arena edge, rocks, subtle heat shimmer plane.
- `src/game/environment/terrain/FrozenTerrain.tsx` — Snow displacement, snowbank spheres, icy material.
- `src/game/environment/terrain/VolcanicTerrain.tsx` — Dark base, volcano cone, emissive lava meshes.
- `src/game/environment/terrain/NightmareTerrain.tsx` — Corrupted ground, emissive veins, instanced debris.
- `src/game/environment/terrain/BiomeTerrain.tsx` — Switch on `BiomeType`; forwards pointer + `matRef` for emissive pulse.

[`BiomeEnvironment.tsx`](../../src/game/environment/BiomeEnvironment.tsx) keeps sky/fog/lights/weather/decor where appropriate; ground click calls `clearSelection` then `onGroundPointerDown` when placing.

## Config

[`biomes.ts`](../../src/data/biomes.ts): add optional `terrainSubdivision: number` per biome (segment counts for planes / displacement).

## Build

`npm run build` must pass with strict TypeScript after implementation.
