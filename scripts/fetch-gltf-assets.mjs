/**
 * Downloads Kenney Tower Defense Kit (CC0), extracts GLB models, copies to public/models/.
 * Run: node scripts/fetch-gltf-assets.mjs
 * Optional: node scripts/fetch-gltf-assets.mjs --insecure  (broken corporate TLS)
 */
import { createWriteStream, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const insecure = process.argv.includes('--insecure')
/** @type {import('node:https').Agent | undefined} */
const agent = insecure ? new https.Agent({ rejectUnauthorized: false }) : undefined

/** Direct bundle link from kenney.nl asset page. */
const ZIP_URL =
  'https://kenney.nl/media/pages/assets/tower-defense-kit/73f5e756ea-1726471567/kenney_tower-defense-kit.zip'

/** Source filenames inside "Models/GLB format/" → game id */
const TOWER_MAP = {
  archer: 'weapon-ballista.glb',
  cannon: 'weapon-cannon.glb',
  mage: 'tower-round-crystals.glb',
  tesla: 'weapon-turret.glb',
  sniper: 'tower-round-top-a.glb',
  barracks: 'wood-structure.glb',
  freeze: 'snow-detail-crystal-large.glb',
  mortar: 'weapon-catapult.glb',
}

const ENEMY_MAP = {
  grunt: 'enemy-ufo-a.glb',
  armored: 'enemy-ufo-c.glb',
  flyer: 'enemy-ufo-d.glb',
  runner: 'enemy-ufo-b.glb',
  brute: 'enemy-ufo-a.glb',
  wraith: 'enemy-ufo-b.glb',
  splitter: 'enemy-ufo-c.glb',
  medic: 'enemy-ufo-d.glb',
  tank: 'enemy-ufo-c.glb',
  kamikaze: 'enemy-ufo-b.glb',
  runt: 'enemy-ufo-d.glb',
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    mkdirSync(dirname(dest), { recursive: true })
    const file = createWriteStream(dest)
    https
      .get(url, { agent }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location
          if (!loc) {
            reject(new Error('Redirect without location'))
            return
          }
          res.resume()
          download(new URL(loc, url).href, dest).then(resolve).catch(reject)
          return
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
      .on('error', (err) => {
        file.close()
        reject(err)
      })
  })
}

function findGlbRoot(extractDir) {
  const models = join(extractDir, 'Models')
  if (!existsSync(models)) {
    return null
  }
  const glbDir = join(models, 'GLB format')
  if (existsSync(glbDir)) {
    return glbDir
  }
  return null
}

const tmp = join(tmpdir(), `td-kit-${Date.now()}`)
const zipPath = join(tmp, 'kit.zip')
const extractDir = join(tmp, 'extracted')

mkdirSync(tmp, { recursive: true })

try {
  console.log('Downloading Kenney Tower Defense Kit…')
  await download(ZIP_URL, zipPath)

  mkdirSync(extractDir, { recursive: true })
  const tar = spawnSync('tar', ['-xf', zipPath, '-C', extractDir], {
    stdio: 'inherit',
    shell: false,
  })
  if (tar.status !== 0) {
    console.error('tar extract failed. On Windows, ensure bundled tar is available (Windows 10+).')
    process.exit(1)
  }

  const glbRoot = findGlbRoot(extractDir)
  if (!glbRoot) {
    console.error('Could not find Models/GLB format in archive.')
    process.exit(1)
  }

  const outTowers = join(root, 'public/models/towers')
  const outEnemies = join(root, 'public/models/enemies')
  mkdirSync(outTowers, { recursive: true })
  mkdirSync(outEnemies, { recursive: true })

  for (const [id, file] of Object.entries(TOWER_MAP)) {
    const src = join(glbRoot, file)
    if (!existsSync(src)) {
      console.warn('Missing tower source:', file)
      continue
    }
    copyFileSync(src, join(outTowers, `${id}.glb`))
    console.log('tower', id)
  }

  for (const [id, file] of Object.entries(ENEMY_MAP)) {
    const src = join(glbRoot, file)
    if (!existsSync(src)) {
      console.warn('Missing enemy source:', file)
      continue
    }
    copyFileSync(src, join(outEnemies, `${id}.glb`))
    console.log('enemy', id)
  }

  console.log('Done. Models in public/models/{towers,enemies}/')
} finally {
  try {
    rmSync(tmp, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}
