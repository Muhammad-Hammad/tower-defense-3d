import type { StageProgressEntry } from '../store/progressStore'
import { progressStageKey } from '../store/progressStore'

export function progressDiffers(
  local: Record<string, StageProgressEntry>,
  remote: StageProgressEntry[]
): boolean {
  const remoteByKey = new Map(remote.map((r) => [progressStageKey(r.stageId, r.difficulty), r]))

  for (const k of Object.keys(local)) {
    const l = local[k]!
    const r = remoteByKey.get(k)
    if (!r) {
      if (l.stars > 0) {
        return true
      }
      continue
    }
    if (l.stars !== r.stars) {
      return true
    }
    if ((l.bestTimeSec ?? -1) !== (r.bestTimeSec ?? -1)) {
      return true
    }
  }

  for (const r of remote) {
    const k = progressStageKey(r.stageId, r.difficulty)
    if (!local[k] && r.stars > 0) {
      return true
    }
  }

  return false
}

export function mergeProgressRecords(
  local: Record<string, StageProgressEntry>,
  remote: StageProgressEntry[]
): StageProgressEntry[] {
  const keys = new Set<string>()
  for (const k of Object.keys(local)) {
    keys.add(k)
  }
  for (const r of remote) {
    keys.add(progressStageKey(r.stageId, r.difficulty))
  }

  const out: StageProgressEntry[] = []
  for (const k of keys) {
    const l = local[k]
    const r = remote.find((x) => progressStageKey(x.stageId, x.difficulty) === k)
    if (!l && !r) {
      continue
    }
    if (!l) {
      out.push({ ...r! })
      continue
    }
    if (!r) {
      out.push({ ...l })
      continue
    }

    const stars = Math.max(l.stars, r.stars)
    let bestTimeSec: number | null = null
    const ta = l.bestTimeSec
    const tb = r.bestTimeSec
    if (ta != null && tb != null) {
      bestTimeSec = Math.min(ta, tb)
    } else {
      bestTimeSec = ta ?? tb ?? null
    }

    out.push({
      stageId: l.stageId,
      difficulty: l.difficulty,
      stars,
      bestTimeSec,
    })
  }
  return out
}

export function hasMeaningfulProgress(stages: Record<string, StageProgressEntry>): boolean {
  return Object.values(stages).some((s) => s.stars > 0)
}
