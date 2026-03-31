# Phase 7 — Visuals, biomes, assets

## Deliverables

| Area | Detail |
|------|--------|
| BGM | `scripts/fetch-bgm.mjs` → `public/audio/bgm-loop.mp3` (falls back to WAV). Kevin MacLeod **Griphop** (hip-hop–style), CC BY 4.0. |
| GLB | `scripts/fetch-gltf-assets.mjs` → Kenney **Tower Defense Kit** (CC0) → `public/models/towers/*.glb`, `public/models/enemies/*.glb`. |
| Entities | `TowerModel.tsx`, `EnemyModel.tsx`, `ModelErrorBoundary.tsx`; `GameEntities.tsx` uses GLTF with procedural fallback. |
| Biomes | `data/biomes.ts` — grasslands, desert, frozen, volcanic, nightmare (fog, lights, grid tints, terrain emissive pulse). |
| Environment | `BiomeEnvironment.tsx`, `WeatherParticles.tsx`; `GameScene.tsx` wires biome + grid colors. |
| Stages | `ALL_STAGES` 1–30 in `data/stages/` (`desert`, `frozen`, `volcanic`, `nightmare` + existing grasslands). Unlock remains sequential by `stageId`. |
| Stage UI | `StageSelectScreen.tsx` — R3F world map: biome pads + stage plates; replaces HTML `<select>`. |

## Asset credits

- **Music:** Kevin MacLeod — *Griphop* — [Incompetech](https://incompetech.com/music/royalty-free/music.html) — CC BY 4.0.
- **Models:** Kenney — [Tower Defense Kit](https://kenney.nl/assets/tower-defense-kit) — CC0.

## Biome quick reference

| Biome | Stages | Weather |
|-------|--------|---------|
| Grasslands | 1–10 | none |
| Desert | 11–15 | sandstorm |
| Frozen | 16–20 | snow |
| Volcanic | 21–25 | ash |
| Nightmare | 26–30 | darkfog |
