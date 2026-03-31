# Phase 2 — Core loop

**Status:** complete (prototype)  
**Depends on:** [PHASE-01-FOUNDATION.md](./PHASE-01-FOUNDATION.md)

## Goals (MASTER SPEC — Phase 2)

- One tower type (**Archer**) — place on grid, range + DPS from `data/towers.ts`
- One enemy (**Grunt**) — HP, speed, gold reward, leak damage from `data/enemies.ts`
- **A\*** on a 24×24 grid; towers block cells; **no placement** if spawn→goal path is broken
- **Wave runner** — two scripted waves from `data/stages/stagePrototype.ts`
- **Combat** — tower acquires closest in-range enemy; **projectiles** home toward target each tick; kills grant gold
- **HUD** — start run, send wave, select archer, click ground to build, menu / retry

## Architecture

| Piece | Location |
|-------|----------|
| Grid ↔ world | `src/game/core/gridConfig.ts` |
| A* | `src/game/systems/pathfinding.ts` |
| Simulation step | `src/game/systems/runTick.ts` |
| Runtime state | `src/store/gameStore.ts` |
| R3F tick driver | `src/game/core/GameLoop.tsx` |
| Meshes | `src/game/entities/GameEntities.tsx` |
| Input | ground `onPointerDown` in `GameScene.tsx` |

## Gameplay notes

- **Spawn** ≈ blue ring (gx=2,gz=11), **base** ≈ red ring (gx=21,gz=11). Enemies follow shortest 4-neighbour path around tower walls.
- **Path refresh**: placing a tower recomputes every living enemy’s route from its snapped cell to the goal.
- **Wave index**: `nextWaveIndex` advances when a wave fully clears (all spawns done and all enemies dead). Off-by-one framing matches `prototypeStageWaves[0]` = wave 1.
- **Game over**: `playerHp` ≤ 0 sets `isGameOver` and pauses ticking.

## Not in Phase 2 (later)

- Rapier, skeletal animation, audio, workers for A*, instancing, polish settings → DB sync

## Verification

1. `npm run build`
2. Start prototype → place 1–2 archers along the lane → send wave 1 → grunts die or leak; wave 2 same.
3. Wall off the corridor fully → “Send next wave” still works but no spawns if path is `null` (expected).

## Known limitations

- A* `open` list uses `sort`/`shift` — fine for 24×24; optimize with binary heap if the grid grows.
- Wave clear is evaluated **before** enemy movement in a tick — clearing the wave can lag **one frame** after the last kill.
- `GameLoop` runs `useFrame` always; `tick` no-ops when not `playing` / game over.
