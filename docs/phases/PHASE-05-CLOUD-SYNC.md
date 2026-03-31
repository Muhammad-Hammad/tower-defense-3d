# Phase 5 — Cloud sync

**Depends on:** [PHASE-01-FOUNDATION.md](./PHASE-01-FOUNDATION.md) (Supabase schema), [PHASE-04-CONTENT.md](./PHASE-04-CONTENT.md)

## Goals

- **`user_settings` ↔ `settingsStore`** — On login, fetch remote audio/video prefs and apply (quality, resolution scale, volumes). Local changes debounce-upload while signed in. **`muted` and `showFps` stay local-only** (not columns in SQL).
- **`stage_progress` ↔ `progressStore`** — On stage clear, `recordStageClear` + best-effort `upsert` for the signed-in user. On login:
  - Remote-only → replace local.
  - Local-only → push all rows to cloud.
  - Both with differences → **Merge progress modal**: use cloud / use device / merge (max stars, min best time) then upload as needed.

## Files

| Path | Role |
|------|------|
| `src/services/supabase/userSettingsRemote.ts` | Fetch / upsert `user_settings` |
| `src/services/supabase/stageProgressRemote.ts` | Fetch / upsert `stage_progress`, `tryPushStageClear` |
| `src/sync/progressMerge.ts` | `progressDiffers`, `mergeProgressRecords`, `hasMeaningfulProgress` |
| `src/sync/CloudSync.tsx` | Login hydration, settings debounce, merge gate |
| `src/ui/menus/MergeProgressModal.tsx` | Three-way choice UI |
| `src/store/progressStore.ts` | `replaceProgressFromEntries`, exported `progressStageKey` |
| `src/store/gameStore.ts` | `runStartedAt`, victory → stars + time + progress + cloud push |

## Verification

- With `.env` and a logged-in user: clear a stage → row appears in `stage_progress` (Supabase table editor).
- Toggle SFX volume → `user_settings` updates after ~650ms idle.
- Two browsers: log in with conflicting persisted `td3d-progress` / cloud data → modal appears.

## Out of scope (moved to Phase 6+)

- ~~`profiles` tutorial / stars mirror~~ → [PHASE-06-META.md](./PHASE-06-META.md)
- `tower_upgrades`, guest identity merge beyond progress — later.
