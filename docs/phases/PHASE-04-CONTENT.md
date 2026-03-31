# Phase 4 — Content & combat breadth

## Delivered

- **8 tower types** in `src/data/towers.ts`: archer, cannon, mage, tesla, sniper, barracks, freeze, mortar — with upgrades (0–2), scaled damage/range/APS, and tower-specific parameters (splash, chain, slow, mortar arc, freeze aura, troops).
- **10+ enemy types** in `src/data/enemies.ts` with resistances, flyers, invisible wraiths, splitters, medics (ally heal aura), etc.
- **10 Grasslands stages** in `src/data/stages/grasslands.ts` with per-stage `startingGold` and multi-wave scripts.
- **Simulation** (`src/game/systems/runTick.ts`): ground vs air pathing, freeze aura, tesla slow decay, medic heals, cannon splash, mage chain (capped hops), mortar impact AoE, sniper crit rolls, barracks troop spawn/cap, troop melee vs non-flyers.
- **Store / UI**: stage select (menu), full tower strip, upgrade mode (click tower cell), `WaveBanner` keyed to active stage waves.

## Key files

| Area | Path |
|------|------|
| Stage list | `src/data/stages/grasslands.ts` |
| Tick + projectiles/troops | `src/game/systems/runTick.ts` |
| Path recompute / splitter spawn paths | `src/game/systems/pathingUtils.ts`, `combatMath.ts` |
| Game state | `src/store/gameStore.ts` |
| HUD / entities | `src/ui/hud/GameHud.tsx`, `src/game/entities/GameEntities.tsx` |

## Follow-ups (optional polish)

- Mortar / mage predictive aiming, stronger VFX, sound hooks per tower type.
- Air units affected by freeze aura (currently ground step uses aura; air uses `stepAirEnemy` only with `slowMul`).
- Balance pass using playtest metrics.
