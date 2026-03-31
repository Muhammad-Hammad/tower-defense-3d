import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/audio')
mkdirSync(outDir, { recursive: true })

const SAMPLE_RATE = 44100
const NUM_CHANNELS = 2

// Deterministic cheap white noise in range [-1, 1]
function makeNoise(seed) {
  let s = seed | 0
  return () => {
    s = (s * 1103515245 + 12345) | 0
    return (((s >>> 16) & 0xffff) * (1 / 32768)) - 1
  }
}

function adsrAt(i, n, a, d, sl, r) {
  const aN = Math.floor(n * a)
  const dN = Math.floor(n * d)
  const rN = Math.floor(n * r)
  const holdEnd = n - rN
  if (i < aN && aN > 0) {
    return i / aN
  }
  if (i < aN + dN) {
    const t = (i - aN) * (1 / dN)
    return 1 - t * (1 - sl)
  }
  if (i < holdEnd) {
    return sl
  }
  const t = (i - holdEnd) * (1 / rN)
  return sl * (1 - t)
}

function writeStereoWav(filename, durationSec, render) {
  const n = Math.floor(SAMPLE_RATE * durationSec)
  const blockAlign = NUM_CHANNELS * 2
  const dataSize = n * blockAlign
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(NUM_CHANNELS, 22)
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(SAMPLE_RATE * blockAlign, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  let off = 44
  const noise = makeNoise(filename.length * 9973)
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE
    const { L, R } = render(t, i, n, noise)
    const l = Math.max(-1, Math.min(1, L))
    const r = Math.max(-1, Math.min(1, R))
    buffer.writeInt16LE(Math.round(l * 32767), off)
    off += 2
    buffer.writeInt16LE(Math.round(r * 32767), off)
    off += 2
  }

  writeFileSync(join(outDir, filename), buffer)
}

// ui-click: 1100 Hz tick
writeStereoWav('ui-click.wav', 0.05, (t, i, n, nz) => {
  const env = adsrAt(i, n, 0.001, 0.02, 0, 0.35)
  const f = 1100
  const s = 0.22 * env * Math.sin(2 * Math.PI * f * t)
  const p = s + 0.03 * env * nz()
  return { L: p, R: p * 0.95 }
})

// tower-fire
writeStereoWav('tower-fire.wav', 0.08, (t, i, n, nz) => {
  const env = adsrAt(i, n, 0.002, 0.08, 0.25, 0.35)
  const s =
    0.2 * env * (Math.sin(2 * Math.PI * 320 * t) + 0.45 * Math.sin(2 * Math.PI * 640 * t))
  const ns = 0.08 * env * nz()
  return { L: s + ns, R: s * 0.92 + ns }
})

// enemy-death
writeStereoWav('enemy-death.wav', 0.12, (t, i, n, nz) => {
  const env = adsrAt(i, n, 0.003, 0.12, 0.2, 0.4)
  const s =
    0.35 * env * (Math.sin(2 * Math.PI * 80 * t) + 0.35 * Math.sin(2 * Math.PI * 160 * t))
  const ns = 0.14 * env * nz()
  return { L: s + ns, R: s * 0.88 + ns * 0.9 }
})

// enemy-leak
writeStereoWav('enemy-leak.wav', 0.18, (t, i, n, nz) => {
  const env = adsrAt(i, n, 0.01, 0.08, 0.55, 0.28)
  const s =
    0.32 * env * (Math.sin(2 * Math.PI * 110 * t) + 0.4 * Math.sin(2 * Math.PI * 220 * t))
  return { L: s, R: s * 0.97 }
})

// wave-start ascending
writeStereoWav('wave-start.wav', 0.2, (t, i, n, nz) => {
  const env = adsrAt(i, n, 0.02, 0.15, 0.4, 0.25)
  const f0 = 440
  const f1 = 880
  const sweep = f0 + (f1 - f0) * Math.min(1, t * (1 / 0.18))
  const s = 0.24 * env * Math.sin(2 * Math.PI * sweep * t)
  const ns = 0.05 * env * nz()
  return { L: s + ns, R: s * 0.95 + ns }
})

// gold
writeStereoWav('gold.wav', 0.06, (t, i, n, nz) => {
  const env = adsrAt(i, n, 0.002, 0.04, 0, 0.45)
  const s =
    0.18 *
    env *
    (Math.sin(2 * Math.PI * 1320 * t) + 0.5 * Math.sin(2 * Math.PI * 1980 * t))
  return { L: s, R: s * 0.94 }
})

// enemy-spawn FM-ish
writeStereoWav('enemy-spawn.wav', 0.04, (t, i, n, nz) => {
  const env = adsrAt(i, n, 0.001, 0.35, 0, 0.45)
  const fm = Math.sin(2 * Math.PI * 220 * t + 2.5 * Math.sin(2 * Math.PI * 55 * t))
  const s = 0.14 * env * fm
  return { L: s, R: s * 0.93 }
})

// build
writeStereoWav('build.wav', 0.1, (t, i, n, nz) => {
  const env = adsrAt(i, n, 0.02, 0.15, 0.35, 0.28)
  const s =
    0.22 * env * (Math.sin(2 * Math.PI * 180 * t) + 0.3 * Math.sin(2 * Math.PI * 360 * t))
  const ns = 0.1 * env * nz()
  return { L: s + ns, R: s * 0.9 + ns }
})

// game-over descending
writeStereoWav('game-over.wav', 0.6, (t, i, n, nz) => {
  const env = adsrAt(i, n, 0.05, 0.1, 0.6, 0.35)
  const f = 440 - (330 * Math.min(1, t * (1 / 0.55)))
  const s =
    0.3 * env * (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 0.5 * t))
  const ns = 0.06 * env * nz()
  return { L: s + ns, R: s * 0.96 + ns }
})

// victory arpeggio C5 E5 G5 C6
writeStereoWav('victory.wav', 0.5, (t, i, n, nz) => {
  const freqs = [523.25, 659.25, 783.99, 1046.5]
  let s = 0
  const step = 0.11
  for (let k = 0; k < freqs.length; k += 1) {
    const t0 = k * step
    const seg = Math.max(0, Math.min(1, (t - t0) * (1 / 0.09)))
    const env = seg * (1 - seg) * 4
    s += 0.12 * env * Math.sin(2 * Math.PI * freqs[k] * (t - t0))
  }
  const globalEnv = adsrAt(i, n, 0.05, 0.1, 0.5, 0.35)
  const ns = 0.04 * globalEnv * nz()
  const out = s * globalEnv
  return { L: out + ns, R: out * 0.94 + ns }
})

// bgm loop: simple 4-beat feel (avoid '/' token issues in fat arrow; keep generators explicit)
writeStereoWav('bgm-loop.wav', 3.2, (t, i, n, nz) => {
  const beat = 0.5
  const cyc = beat * 4
  const phase = (t % cyc) * (1 / beat)
  const kick =
    Math.exp(-phase * 24) * Math.sin(2 * Math.PI * 60 * t) * (phase < 0.12 ? 0.12 : 0)
  let sn = 0
  if (phase >= 1 && phase < 1.03) {
    sn = 0.08 * nz()
  } else if (phase >= 3 && phase < 3.03) {
    sn = 0.07 * nz()
  }
  const h1 = Math.sin(2 * Math.PI * 8000 * t)
  const h2 = Math.sin(2 * Math.PI * 8 * t)
  const hat = 0.02 * Math.abs(h1) * (h2 > 0 ? 1 : 0.2)
  const p1 = Math.sin(2 * Math.PI * 146 * t)
  const p2 = Math.sin(2 * Math.PI * 220 * t * 1.01)
  const pad = 0.04 * (p1 + p2)
  const env = 0.55 + 0.45 * Math.sin(i * (Math.PI / n))
  const L = (kick + sn + hat + pad) * env
  const R = L * 0.92 + sn * 0.3
  return { L, R }
})

console.log('Wrote 44100 Hz stereo placeholder WAVs')
