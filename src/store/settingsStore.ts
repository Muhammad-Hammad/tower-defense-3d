import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type QualityPreset = 'auto' | 'ultra' | 'high' | 'medium' | 'low' | 'potato'

export type SettingsState = {
  qualityPreset: QualityPreset
  resolutionScale: 0.5 | 0.75 | 1
  masterVolume: number
  bgmVolume: number
  sfxVolume: number
  muted: boolean
  showFps: boolean
  setQualityPreset: (p: QualityPreset) => void
  setResolutionScale: (s: 0.5 | 0.75 | 1) => void
  setMasterVolume: (v: number) => void
  setBgmVolume: (v: number) => void
  setSfxVolume: (v: number) => void
  setMuted: (m: boolean) => void
  setShowFps: (s: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      qualityPreset: 'high',
      resolutionScale: 1,
      masterVolume: 1,
      bgmVolume: 0.8,
      sfxVolume: 1,
      muted: false,
      showFps: false,
      setQualityPreset: (qualityPreset) => set({ qualityPreset }),
      setResolutionScale: (resolutionScale) => set({ resolutionScale }),
      setMasterVolume: (masterVolume) => set({ masterVolume }),
      setBgmVolume: (bgmVolume) => set({ bgmVolume }),
      setSfxVolume: (sfxVolume) => set({ sfxVolume }),
      setMuted: (muted) => set({ muted }),
      setShowFps: (showFps) => set({ showFps }),
    }),
    { name: 'td3d-settings' }
  )
)
