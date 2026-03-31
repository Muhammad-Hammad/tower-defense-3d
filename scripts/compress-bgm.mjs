/**
 * Re-encode public/audio/bgm-loop.mp3 to a short web-sized loop (~90s max) at 96kbps.
 * Requires ffmpeg on PATH. Safe to re-run; replaces file atomically via temp.
 *
 * Usage: node scripts/compress-bgm.mjs
 *        node scripts/compress-bgm.mjs path/to/in.mp3 path/to/out.mp3
 */
import { spawnSync } from 'node:child_process'
import { existsSync, renameSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDir = join(__dirname, '../public/audio')

const inPath = process.argv[2] ?? join(defaultDir, 'bgm-loop.mp3')
const outPathFinal = process.argv[3] ?? join(defaultDir, 'bgm-loop.mp3')

function ffmpegAvailable() {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-version'], { encoding: 'utf8' })
  return r.status === 0
}

if (!existsSync(inPath)) {
  console.error('compress-bgm: input not found:', inPath)
  process.exit(1)
}

if (!ffmpegAvailable()) {
  console.error('compress-bgm: ffmpeg not found on PATH. Install ffmpeg and retry.')
  process.exit(1)
}

const tmpOut =
  inPath === outPathFinal ? join(dirname(outPathFinal), '.bgm-reencode.tmp.mp3') : outPathFinal

const args = [
  '-hide_banner',
  '-y',
  '-i',
  inPath,
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
  console.error('compress-bgm: ffmpeg failed')
  process.exit(1)
}

if (tmpOut !== outPathFinal) {
  try {
    unlinkSync(outPathFinal)
  } catch {
    /* may not exist */
  }
  renameSync(tmpOut, outPathFinal)
}

console.log('compress-bgm: wrote', outPathFinal, '(~90s, 96kbps stereo)')
