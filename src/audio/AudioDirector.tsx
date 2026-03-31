import { useEffect } from 'react'
import { getAudioManager } from '../game/audio/AudioManager'
import { useGameStore } from '../store/gameStore'
import { useSettingsStore } from '../store/settingsStore'

/** Keeps Howler gains in sync with persisted settings and toggles battle BGM with game mode. */
export function AudioDirector() {
  useEffect(() => {
    const syncSettings = (): void => {
      const st = useSettingsStore.getState()
      getAudioManager().syncFromSettings(
        st.masterVolume,
        st.bgmVolume,
        st.sfxVolume,
        st.muted
      )
    }
    syncSettings()
    return useSettingsStore.subscribe(syncSettings)
  }, [])

  useEffect(() => {
    const am = getAudioManager()
    return useGameStore.subscribe((state, prev) => {
      if (state.status === 'playing' && prev.status !== 'playing') {
        am.startBattleBgm()
      }
      if (state.status === 'menu' && prev.status !== 'menu') {
        am.stopBattleBgm()
      }
    })
  }, [])

  return null
}
