# Tower Defense 3D

Browser tower defense built with **React 19**, **TypeScript**, **Vite**, **React Three Fiber**, and **Zustand**. Biome terrain, scaled towers, stage map overlay, Howler audio, optional **Supabase** cloud sync.

## Deploy

### GitHub

1. Create a new empty repository on GitHub (no README/license—this repo already has them).
2. From this project root:

```bash
git init
git config user.email "hammy.pk30@gmail.com"
git config user.name "Hammad Ghani"
git add .
git commit -m "feat: initial public release — 3D tower defense (R3F, Vite, Netlify-ready)"
git branch -M main
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git push -u origin main
```

Replace `<YOUR_USER>` / `<YOUR_REPO>` with your account and repo name.

### Netlify

1. In [Netlify](https://app.netlify.com): **Add new site** → **Import an existing project** → connect **GitHub** and pick this repo.
2. Netlify reads [`netlify.toml`](netlify.toml): **build command** `npm ci && npm run build`, **publish directory** `dist`.
3. If the repo root on GitHub is this folder (`tower-defense-3d`), leave **Base directory** empty. If the site lives in a subfolder of a monorepo, set **Base directory** to that folder.
4. **Environment variables** (optional): copy keys from `.env.example` (e.g. `VITE_*` for Supabase) under **Site configuration → Environment variables** if you use cloud sync.
5. After deploy, paste your **production URL** below and in the GitHub repo description.

**Live demo:** _Set after first Netlify deploy — e.g. `https://<name>.netlify.app`_

## Features

- 3D battle view with per-biome terrain, conditional placement grid, orbit camera
- Stage progression, difficulty, full-screen stage map and end-run modals
- Procedural + GLTF towers, wave-driven enemies, juice / SFX hooks
- Optional cloud save (progress + settings) when Supabase is configured

## Stack

React · TypeScript · Vite · `@react-three/fiber` · `@react-three/drei` · Three.js · Zustand · TanStack Query · Tailwind · Howler · Supabase (optional)

## Quick start

```bash
npm install
cp .env.example .env    # optional: Supabase keys + run supabase/migrations SQL
npm run fetch:models      # optional: Kenney Tower Defense Kit GLB → public/models/
npm run fetch:bgm         # optional: BGM (see Audio below)
npm run dev
```

## Audio

Battle BGM is **[Griphop](https://incompetech.com/music/royalty-free/music.html)** by Kevin MacLeod (**CC BY 4.0** — keep attribution in shipped credits).

- `npm run fetch:bgm` downloads the source MP3. If **ffmpeg** is on your PATH, the script **re-encodes** to a **~90 second**, **96 kbps stereo** loop so `public/audio/bgm-loop.mp3` stays web-sized (roughly **~500 KB–1 MB** instead of a full-track rip).
- Without ffmpeg, the script saves the **full** download (large). Install ffmpeg, then run **`npm run compress:bgm`** on the existing file to shrink it in place.
- `npm run fetch:bgm -- --no-reencode` — keep full file after download.
- SFX WAVs can be regenerated with `node scripts/generate-placeholder-audio.mjs`. Howler loads **BGM when the battle starts** and **defers SFX** until after first interaction (see `AudioManager` + `AudioBootstrap`).

## Performance (portfolio bullets)

- **Code-split 3D:** `GameCanvas` loads via `React.lazy` + `Suspense` (`GameCanvasLazy.tsx`) so the canvas module is a separate chunk (~29 kB minified in a sample build; the largest JS chunk may still include shared app code — measure with `npm run build`).
- **Audio:** No upfront decode of all SFX; BGM fetch/decoding deferred until `status === 'playing'`.
- After changes, run `npm run build` and compare Vite’s **gzip** chunk sizes.

## 3D models

Kenney *Tower Defense Kit* (CC0): `npm run fetch:models` → `public/models/`. The game falls back to procedural meshes if files are missing.

**Git:** Large generated files are listed in `.gitignore` (e.g. `public/audio/bgm-loop.mp3`, Kenney `.glb` under `public/models/`). Deployed sites still run: BGM falls back to `bgm-loop.wav`, towers/enemies use procedural meshes. To ship assets on Netlify without committing them, use a **build plugin** or **post-clone script**, or remove those lines from `.gitignore` and commit smaller encodes only.

## Phase docs

[Phase 1](docs/phases/PHASE-01-FOUNDATION.md) · [Phase 2](docs/phases/PHASE-02-CORE-LOOP.md) · [Phase 3](docs/phases/PHASE-03-FEEL.md) · [Phase 4](docs/phases/PHASE-04-CONTENT.md) · [Phase 5](docs/phases/PHASE-05-CLOUD-SYNC.md) · [Phase 6](docs/phases/PHASE-06-META.md) · [Phase 7](docs/phases/PHASE-07-VISUALS.md) · [Phase 8](docs/phases/PHASE-08-POLISH.md) · [Phase 9](docs/phases/PHASE-09-TERRAIN.md)

Deeper overview: [ARCHITECTURE.md](ARCHITECTURE.md).

## CI

GitHub Actions runs `npm ci`, `npm run lint`, and `npm run build` on push/PR (see `.github/workflows/ci.yml`). **ffmpeg is not required in CI.**

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | ESLint |
| `npm run fetch:bgm` | Download BGM + optional ffmpeg web loop |
| `npm run compress:bgm` | Re-encode existing `bgm-loop.mp3` (~90s, 96k) |
| `npm run fetch:models` | Download Kenney GLB assets |

## License

This project’s source code is licensed under the [MIT License](LICENSE).

**Third-party content (not covered by MIT):**

- **Griphop** (BGM) — Kevin MacLeod, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — keep attribution in credits / README when distributing.
- **Kenney Tower Defense Kit** (optional GLB models) — [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
