import type { QualityPreset, SettingsState } from '../../store/settingsStore'

/** Fields persisted to `user_settings` (excludes `muted` / `showFps`). */
export type SettingsRemoteSlice = Pick<
  SettingsState,
  'qualityPreset' | 'resolutionScale' | 'masterVolume' | 'bgmVolume' | 'sfxVolume'
>
import { getSupabase, isSupabaseConfigured } from './client'

export type UserSettingsRow = {
  user_id: string
  quality_preset: string | null
  resolution_scale: number | null
  master_volume: number | null
  bgm_volume: number | null
  sfx_volume: number | null
}

const QUALITY_PRESETS: readonly QualityPreset[] = [
  'auto',
  'ultra',
  'high',
  'medium',
  'low',
  'potato',
]

function parseQualityPreset(raw: string | null | undefined): QualityPreset {
  if (raw && QUALITY_PRESETS.includes(raw as QualityPreset)) {
    return raw as QualityPreset
  }
  return 'high'
}

function parseResolutionScale(raw: number | null | undefined): 0.5 | 0.75 | 1 {
  if (raw == null || Number.isNaN(raw)) {
    return 1
  }
  const options: (0.5 | 0.75 | 1)[] = [0.5, 0.75, 1]
  let best: 0.5 | 0.75 | 1 = 1
  let bestD = Infinity
  for (const o of options) {
    const d = Math.abs(o - raw)
    if (d < bestD) {
      bestD = d
      best = o
    }
  }
  return best
}

export function remoteRowToSettingsPatch(row: UserSettingsRow): Partial<SettingsRemoteSlice> {
  return {
    qualityPreset: parseQualityPreset(row.quality_preset),
    resolutionScale: parseResolutionScale(row.resolution_scale),
    masterVolume: clamp01(row.master_volume ?? 1),
    bgmVolume: clamp01(row.bgm_volume ?? 0.8),
    sfxVolume: clamp01(row.sfx_volume ?? 1),
  }
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) {
    return 1
  }
  return Math.min(1, Math.max(0, n))
}

export function localSettingsToRemotePayload(userId: string, s: SettingsRemoteSlice): UserSettingsRow {
  return {
    user_id: userId,
    quality_preset: s.qualityPreset,
    resolution_scale: s.resolutionScale,
    master_volume: clamp01(s.masterVolume),
    bgm_volume: clamp01(s.bgmVolume),
    sfx_volume: clamp01(s.sfxVolume),
  }
}

export async function fetchUserSettings(userId: string): Promise<UserSettingsRow | null> {
  if (!isSupabaseConfigured) {
    return null
  }
  const { data, error } = await getSupabase()
    .from('user_settings')
    .select('user_id, quality_preset, resolution_scale, master_volume, bgm_volume, sfx_volume')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.warn('[user_settings] fetch failed', error.message)
    return null
  }
  return data as UserSettingsRow | null
}

export async function upsertUserSettings(userId: string, s: SettingsRemoteSlice): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false
  }
  const payload = localSettingsToRemotePayload(userId, s)
  const { error } = await getSupabase().from('user_settings').upsert(payload, {
    onConflict: 'user_id',
  })

  if (error) {
    console.warn('[user_settings] upsert failed', error.message)
    return false
  }
  return true
}
