# Phase 8 — Polish (summary)

Phase 8 covered UX polish on top of Phase 7 visuals: biome-tuned environments, audio mood (BGM/SFX), 3D stage selection, and HUD clarity.

## Delivered themes

- **Biomes**: Sky/fog/weather per stage band; ground tint reacts to placement mode when building.
- **Audio**: Web Audio–driven `AudioManager`; placeholder WAV generation for iterative sound swaps.
- **Stage map**: 3D biome islands with expandable stage plates; unlock/stars from local progress.
- **HUD**: Wave flow, tower shop, upgrade mode, info card for selection.

## Files of note

- [`src/game/environment/BiomeEnvironment.tsx`](../../src/game/environment/BiomeEnvironment.tsx) — lighting, fog, weather, ground input.
- [`src/game/audio/`](../../src/game/audio/) — BGM loop + SFX map.
- [`src/ui/menus/StageSelectScreen.tsx`](../../src/ui/menus/StageSelectScreen.tsx) — campaign map UI (fullscreen overlay in Phase 9).

## Handoff to Phase 9

Phase 9 adds per-biome **3D terrain meshes**, conditional build grid, **larger tower scale**, victory/defeat **fullscreen modals**, **Next stage** progression, and refreshed placeholder SFX (ADSR-style envelopes).
