import { Howl, Howler } from 'howler'

Howler.autoUnlock = true

type SfxId =
  | 'uiClick'
  | 'towerFire'
  | 'enemySpawn'
  | 'enemyDeath'
  | 'enemyLeak'
  | 'waveStart'
  | 'gold'
  | 'build'
  | 'gameOver'
  | 'victory'

let singleton: AudioManager | null = null

export class AudioManager {
  private readonly bgm: Howl
  private readonly sfx: Record<SfxId, Howl>
  private bgmPlaying = false

  constructor() {
    this.bgm = new Howl({
      src: ['/audio/bgm-loop.mp3', '/audio/bgm-loop.wav'],
      loop: true,
      volume: 0,
      preload: false,
    })

    const load = (file: string) =>
      new Howl({
        src: [`/audio/${file}`],
        preload: false,
        volume: 0.8,
      })

    this.sfx = {
      uiClick: load('ui-click.wav'),
      towerFire: load('tower-fire.wav'),
      enemySpawn: load('enemy-spawn.wav'),
      enemyDeath: load('enemy-death.wav'),
      enemyLeak: load('enemy-leak.wav'),
      waveStart: load('wave-start.wav'),
      gold: load('gold.wav'),
      build: load('build.wav'),
      gameOver: load('game-over.wav'),
      victory: load('victory.wav'),
    }
  }

  syncFromSettings(
    masterVolume: number,
    bgmVolume: number,
    sfxVolume: number,
    muted: boolean
  ): void {
    const master = muted ? 0 : Math.max(0, Math.min(1, masterVolume))
    Howler.volume(1)

    const bgmLevel = master * Math.max(0, Math.min(1, bgmVolume)) * 0.45
    this.bgm.volume(bgmLevel)

    const sfxLevel = master * Math.max(0, Math.min(1, sfxVolume)) * 0.95
    for (const h of Object.values(this.sfx)) {
      h.volume(sfxLevel)
    }
  }

  unlock(): void {
    void Howler.ctx?.resume()
  }

  /** Call after first user gesture so SFX decode on first paint stays minimal. */
  warmSfx(): void {
    for (const h of Object.values(this.sfx)) {
      h.load()
    }
  }

  startBattleBgm(): void {
    if (this.bgmPlaying) {
      return
    }
    const start = (): void => {
      void this.bgm.play()
      this.bgmPlaying = true
    }
    if (this.bgm.state() === 'loaded') {
      start()
      return
    }
    this.bgm.once('load', start)
    if (this.bgm.state() === 'unloaded') {
      this.bgm.load()
    }
  }

  stopBattleBgm(): void {
    this.bgm.stop()
    this.bgmPlaying = false
  }

  playSfx(id: SfxId): void {
    const h = this.sfx[id]
    if (h.state() === 'loaded') {
      void h.play()
      return
    }
    h.once('load', () => {
      void h.play()
    })
    if (h.state() === 'unloaded') {
      h.load()
    }
  }
}

export function getAudioManager(): AudioManager {
  if (!singleton) {
    singleton = new AudioManager()
  }
  return singleton
}
