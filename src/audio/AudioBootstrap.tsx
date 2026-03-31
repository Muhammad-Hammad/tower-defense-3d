import { useEffect } from 'react'
import { getAudioManager } from '../game/audio/AudioManager'

/** First pointer gesture unlocks Web Audio (in addition to Howler.autoUnlock). */
export function AudioBootstrap() {
  useEffect(() => {
    const onFirst = () => {
      const am = getAudioManager()
      am.unlock()
      am.warmSfx()
    }
    window.addEventListener('pointerdown', onFirst, { once: true, passive: true })
    return () => window.removeEventListener('pointerdown', onFirst)
  }, [])
  return null
}
