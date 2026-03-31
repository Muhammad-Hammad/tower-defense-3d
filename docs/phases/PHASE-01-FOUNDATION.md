# Phase 1 — Foundation

**Status:** complete (scaffold)  
**Spec:** REACT 3D TOWER DEFENSE — MASTER SPEC (Blocks 0–1 partial, 11 SQL)

## Goals

- Vite + React 19 + TypeScript strict
- React Three Fiber + Drei baseline scene (camera, lights, flat map, orbit controls)
- Zustand stores: `gameStore`, `settingsStore`, `progressStore` (persist for settings/progress)
- Supabase client singleton + magic-link auth UI + optional FPS stats in dev
- TanStack Query `QueryClientProvider` for upcoming API hooks
- Tailwind v4 (`@tailwindcss/vite`)

## What was delivered

| Area | Files / notes |
|------|----------------|
| Build | `vite.config.ts` + Tailwind plugin |
| 3D | `src/game/core/GameCanvas.tsx`, `GameScene.tsx` — DPR capped at 1.5, shadows off (low-end path) |
| State | `src/store/*.ts` |
| Auth | `src/services/supabase/client.ts`, `auth.ts`, `src/hooks/useAuthSession.ts`, `src/ui/menus/AuthPanel.tsx` |
| Data stub | `src/data/towers.ts` (empty `towerConfigs`) |
| DB | `supabase/migrations/20260331000000_phase1_initial.sql` — profiles, stage_progress, tower_upgrades, user_settings, side_quest_progress + RLS + trigger |
| Env | `.env.example` |

## Setup

```bash
cd tower-defense-3d
cp .env.example .env
# Paste Supabase URL + anon key; run migration SQL in dashboard
npm install
npm run dev
```

## Supabase checklist

1. Authentication → Providers → **Email** enabled (magic link).
2. Authentication → URL configuration → Site URL = your dev origin (e.g. `http://localhost:5173`); add redirect URL.
3. Run `supabase/migrations/20260331000000_phase1_initial.sql` in SQL Editor.
4. If trigger errors on older Supabase Postgres, replace `execute procedure` with `execute function` per project dialect.

## Out of scope (later phases)

- Rapier, Howler, pathfinding, waves, HUD game loop, tutorial overlay
- `settingsStore` → `user_settings` sync (Phase 5+)
- Guest ↔ logged-in merge modal

## Verification

- `npm run build` passes
- Without `.env`, app runs; sidebar explains Supabase setup
- With `.env`, magic link form appears; session shows email after redirect

## Next: Phase 2

Core loop: grid placement, one tower, one enemy, A*, combat tick, wave runner (see MASTER SPEC divide & conquer).
