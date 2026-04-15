/**
 * Downloads royalty-free BGM (hip-hop–style “Griphop”) then optionally re-encodes
 * to a ~90s web loop at 96kbps stereo (requires ffmpeg on PATH).
 *
 * Attribution: Kevin MacLeod — CC BY 4.0 (see README).
 *
 * Usage: node scripts/fetch-bgm.mjs
 * TLS issues: node scripts/fetch-bgm.mjs --insecure   OR   FETCH_ASSETS_INSECURE=1
 * Skip re-encode: node scripts/fetch-bgm.mjs --no-reencode
 */
import { spawnSync } from 'node:child_process'
import { createWriteStream, mkdirSync, renameSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import { createHttpsAgent, tlsDownloadHint } from './tls-utils.mjs'

const skipReencode = process.argv.includes('--no-reencode')
const agent = createHttpsAgent()

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/audio')
const outPath = join(outDir, 'bgm-loop.mp3')
const downloadPath = join(outDir, '.bgm-fetch.tmp.mp3')

/** Kevin MacLeod — Griphop (hip-hop–style, CC BY 4.0) */
const URL = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Griphop.mp3'

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

function ffmpegAvailable() {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-version'], { encoding: 'utf8' })
  return r.status === 0
}

function reencodeToWebLoop(sourceMp3, destMp3) {
  const tmpOut = join(outDir, '.bgm-web.tmp.mp3')
  const args = [
    '-hide_banner',
    '-y',
    '-i',
    sourceMp3,
    '-t',
    '90',
    '-codec:a',
    'libmp3lame',
    '-b:a',
    '96k',
    '-ar',
    '44100',
    '-ac',
    '2',
    tmpOut,
  ]
  const run = spawnSync('ffmpeg', args, { stdio: 'inherit' })
  if (run.status !== 0) {
    return false
  }
  try {
    unlinkSync(destMp3)
  } catch {
    /* fresh install */
  }
  renameSync(tmpOut, destMp3)
  return true
}

try {
  await download(URL, downloadPath)
  console.log('Downloaded Griphop to temp')

  if (!skipReencode && ffmpegAvailable()) {
    if (reencodeToWebLoop(downloadPath, outPath)) {
      unlinkSync(downloadPath)
      console.log('Wrote web-sized loop:', outPath, '(~90s, 96kbps stereo)')
    } else {
      try {
        unlinkSync(outPath)
      } catch {
        /* */
      }
      renameSync(downloadPath, outPath)
      console.warn('ffmpeg re-encode failed; kept full download at', outPath)
    }
  } else {
    if (!skipReencode && !ffmpegAvailable()) {
      console.warn(
        'ffmpeg not on PATH — saving full Griphop file (large). Install ffmpeg and run: npm run compress:bgm'
      )
    }
    try {
      unlinkSync(outPath)
    } catch {
      /* replace */
    }
    renameSync(downloadPath, outPath)
    console.log('Wrote', outPath)
  }
} catch (e) {
  console.error('fetch-bgm failed:', e.message)
  console.error('Keep using public/audio/bgm-loop.wav as fallback.')
  try {
    unlinkSync(downloadPath)
  } catch {
    /* no temp */
  }
  process.exit(1)
}
