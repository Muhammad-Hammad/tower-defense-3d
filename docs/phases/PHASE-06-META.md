# Phase 6 — Meta progression & profiles

**Depends on:** [PHASE-04-CONTENT.md](./PHASE-04-CONTENT.md), [PHASE-05-CLOUD-SYNC.md](./PHASE-05-CLOUD-SYNC.md)

## Goals

- **Difficulty** — `easy` / `normal` / `hard` (persisted in `progressStore`). Affects **starting gold** and **enemy HP** on spawn (including splitter runts). Clears are recorded per `(stageId, difficulty)`.
- **Stage ladder** — Stage `N` unlocks on selected difficulty after stage `N-1` has **≥1★** on that same difficulty.
- **HUD** — Difficulty toggles, stage list with ★ and locked stages, header **total stars**, in-run difficulty label.
- **`profiles` mirror** — `total_stars` + `tutorial_complete` synced via `updateProfileProgressMirror`; login pulls `tutorial_complete` to mark local tutorial done if cloud already has it.
- **Tutorial tip** — Menu panel until “Got it” sets `tutorialComplete` (then syncs when logged in).

## Files

| Path | Role |
|------|------|
| `src/data/difficulty.ts` | Modifiers + labels |
| `src/meta/stageUnlock.ts` | `isStageUnlocked`, `stageStarsFor` |
| `src/services/supabase/profileRemote.ts` | `fetchProfile`, `updateProfileProgressMirror` |
| `src/store/progressStore.ts` | `selectedDifficulty` |
| `src/store/gameStore.ts` | `runDifficulty`, `syncMenuGold`, gold formula, tick `enemyHpMul`, clear entry difficulty |
| `src/game/systems/runTick.ts` | `TickInput.enemyHpMul`, scaled spawns |
| `src/game/systems/combatMath.ts` | Splitter runts respect `enemyHpMul` |
| `src/sync/CloudSync.tsx` | Profile fetch on hydrate, debounced profile push, `pushProfileMirrorNow` after hydrate/merge |
| `src/ui/menus/TutorialTip.tsx` | First-time hints |
| `src/ui/hud/GameHud.tsx` | Difficulty, locks, ★ display |

## Out of scope (later)

- `tower_upgrades` gameplay unlocks, cosmetics, achievements SQL.
- Multiplayer leaderboards.

## Verification

- Switch **Hard**: creeps take longer to kill; **Easy**: more starting gold in menu for same stage.
- Lock stage 3 on Normal until stage 2 has a clear on Normal.
- Logged in: clear stage → `profiles.total_stars` updates; dismiss tutorial → `tutorial_complete` true in DB.
