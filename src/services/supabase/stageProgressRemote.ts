import type { Difficulty, StageProgressEntry } from '../../store/progressStore'
import { getSupabase, isSupabaseConfigured } from './client'

type StageProgressRow = {
  user_id: string
  stage_id: number
  difficulty: Difficulty
  stars: number
  best_time: number | null
}

export async function fetchStageProgressRemote(userId: string): Promise<StageProgressEntry[]> {
  if (!isSupabaseConfigured) {
    return []
  }
  const { data, error } = await getSupabase()
    .from('stage_progress')
    .select('stage_id, difficulty, stars, best_time')
    .eq('user_id', userId)

  if (error) {
    console.warn('[stage_progress] fetch failed', error.message)
    return []
  }
  if (!data?.length) {
    return []
  }
  return data.map((r) => ({
    stageId: r.stage_id as number,
    difficulty: r.difficulty as Difficulty,
    stars: r.stars as number,
    bestTimeSec: r.best_time == null ? null : Number(r.best_time),
  }))
}

export async function upsertStageProgressRow(userId: string, entry: StageProgressEntry): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false
  }
  const row: StageProgressRow = {
    user_id: userId,
    stage_id: entry.stageId,
    difficulty: entry.difficulty,
    stars: entry.stars,
    best_time: entry.bestTimeSec,
  }
  const { error } = await getSupabase().from('stage_progress').upsert(row, {
    onConflict: 'user_id,stage_id,difficulty',
  })
  if (error) {
    console.warn('[stage_progress] upsert failed', error.message)
    return false
  }
  return true
}

export async function pushAllStageProgress(userId: string, entries: StageProgressEntry[]): Promise<void> {
  await Promise.all(entries.map((e) => upsertStageProgressRow(userId, e)))
}

export async function tryPushStageClear(entry: StageProgressEntry): Promise<void> {
  if (!isSupabaseConfigured) {
    return
  }
  const { data: { user } } = await getSupabase().auth.getUser()
  if (!user) {
    return
  }
  await upsertStageProgressRow(user.id, entry)
}
