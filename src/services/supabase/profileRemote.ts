import { getSupabase, isSupabaseConfigured } from './client'

export type ProfileRow = {
  id: string
  total_stars: number
  tutorial_complete: boolean
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured) {
    return null
  }
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, total_stars, tutorial_complete')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.warn('[profiles] fetch failed', error.message)
    return null
  }
  if (!data) {
    return null
  }
  return {
    id: data.id as string,
    total_stars: Number(data.total_stars ?? 0),
    tutorial_complete: Boolean(data.tutorial_complete),
  }
}

export async function updateProfileProgressMirror(input: {
  userId: string
  totalStars: number
  tutorialComplete: boolean
}): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false
  }
  const { error } = await getSupabase()
    .from('profiles')
    .update({
      total_stars: input.totalStars,
      tutorial_complete: input.tutorialComplete,
    })
    .eq('id', input.userId)

  if (error) {
    console.warn('[profiles] update failed', error.message)
    return false
  }
  return true
}
