/**
 * Downloads Kenney Tower Defense Kit (CC0), extracts GLB models, copies to public/models/.
 * Run: node scripts/fetch-gltf-assets.mjs
 * TLS: node scripts/fetch-gltf-assets.mjs --insecure   OR   FETCH_ASSETS_INSECURE=1
 */
import { createWriteStream, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { createHttpsAgent, tlsDownloadHint } from './tls-utils.mjs'
import { copyKenneyAssets, findGlbRoot } from './kenney-copy-utils.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const agent = createHttpsAgent()

/** Direct bundle link from kenney.nl asset page. */
const ZIP_URL =
  'https://kenney.nl/media/pages/assets/tower-defense-kit/73f5e756ea-1726471567/kenney_tower-defense-kit.zip'

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
        const m = err instanceof Error ? err.message : String(err)
        if (/UNABLE_TO_GET_ISSUER_CERT|certificate|Cert|TLS|SSL/i.test(m)) {
          reject(new Error(tlsDownloadHint(m)))
          return
        }
        reject(err)
      })
  })
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

  copyKenneyAssets(glbRoot, root)
  console.log('Done. Models in public/models/{towers,enemies,props}/')
} finally {
  try {
    rmSync(tmp, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}
