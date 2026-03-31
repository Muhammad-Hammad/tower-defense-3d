import type { User } from '@supabase/supabase-js'
import { useEffect, useRef, useState } from 'react'
import type { StageProgressEntry } from '../store/progressStore'
import {
  fetchStageProgressRemote,
  pushAllStageProgress,
} from '../services/supabase/stageProgressRemote'
import {
  fetchUserSettings,
  remoteRowToSettingsPatch,
  upsertUserSettings,
} from '../services/supabase/userSettingsRemote'
import { isSupabaseConfigured } from '../services/supabase/client'
import { fetchProfile, updateProfileProgressMirror } from '../services/supabase/profileRemote'
import { useProgressStore } from '../store/progressStore'
import { useSettingsStore } from '../store/settingsStore'
import { MergeProgressModal, type MergeChoice, countProgressEntries } from '../ui/menus/MergeProgressModal'
import { hasMeaningfulProgress, mergeProgressRecords, progressDiffers } from './progressMerge'

const SETTINGS_PUSH_MS = 650
const PROFILE_PUSH_MS = 900

function pushProfileMirrorNow(userId: string): void {
  const st = useProgressStore.getState()
  void updateProfileProgressMirror({
    userId,
    totalStars: st.totalStars,
    tutorialComplete: st.tutorialComplete,
  })
}

type CloudSyncProps = {
  user: User | null
  authLoading: boolean
}

export function CloudSync({ user, authLoading }: CloudSyncProps) {
  const [hydratedFor, setHydratedFor] = useState<string | null>(null)
  const [mergeRemote, setMergeRemote] = useState<StageProgressEntry[] | null>(null)
  const [progressRehydrated, setProgressRehydrated] = useState(() =>
    useProgressStore.persist.hasHydrated()
  )
  const applyingRemoteSettings = useRef(false)
  const mergeUserRef = useRef<string | null>(null)

  useEffect(() => {
    if (useProgressStore.persist.hasHydrated()) {
      setProgressRehydrated(true)
      return
    }
    return useProgressStore.persist.onFinishHydration(() => {
      setProgressRehydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!user) {
      setHydratedFor(null)
      setMergeRemote(null)
      mergeUserRef.current = null
    }
  }, [user])

  useEffect(() => {
    if (!progressRehydrated || !isSupabaseConfigured || authLoading || !user) {
      return
    }
    if (hydratedFor === user.id || mergeRemote != null) {
      return
    }

    let cancelled = false

    void (async () => {
      applyingRemoteSettings.current = true
      const row = await fetchUserSettings(user.id)
      if (!cancelled && row) {
        useSettingsStore.setState(remoteRowToSettingsPatch(row))
      }
      applyingRemoteSettings.current = false

      const profile = await fetchProfile(user.id)
      if (!cancelled && profile?.tutorial_complete) {
        const st = useProgressStore.getState()
        if (!st.tutorialComplete) {
          useProgressStore.setState({ tutorialComplete: true })
        }
      }

      const remoteProgress = await fetchStageProgressRemote(user.id)
      if (cancelled) {
        return
      }

      const local = useProgressStore.getState().stages
      const localHas = hasMeaningfulProgress(local)
      const remoteHas = remoteProgress.some((r) => r.stars > 0)

      if (!localHas && remoteHas) {
        useProgressStore.getState().replaceProgressFromEntries(remoteProgress)
        setHydratedFor(user.id)
        pushProfileMirrorNow(user.id)
        return
      }

      if (localHas && !remoteHas) {
        await pushAllStageProgress(user.id, Object.values(local))
        setHydratedFor(user.id)
        pushProfileMirrorNow(user.id)
        return
      }

      if (localHas && remoteHas && progressDiffers(local, remoteProgress)) {
        mergeUserRef.current = user.id
        setMergeRemote(remoteProgress)
        return
      }

      setHydratedFor(user.id)
      pushProfileMirrorNow(user.id)
    })()

    return () => {
      cancelled = true
    }
  }, [user, authLoading, hydratedFor, mergeRemote, progressRehydrated])

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      return
    }

    let timer: ReturnType<typeof setTimeout> | null = null

    const sub = useSettingsStore.subscribe((state) => {
      if (applyingRemoteSettings.current || hydratedFor !== user.id) {
        return
      }
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        void upsertUserSettings(user.id, {
          qualityPreset: state.qualityPreset,
          resolutionScale: state.resolutionScale,
          masterVolume: state.masterVolume,
          bgmVolume: state.bgmVolume,
          sfxVolume: state.sfxVolume,
        })
      }, SETTINGS_PUSH_MS)
    })

    return () => {
      sub()
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [user, hydratedFor])

  useEffect(() => {
    if (!isSupabaseConfigured || !user || hydratedFor !== user.id) {
      return
    }

    let timer: ReturnType<typeof setTimeout> | null = null

    const sub = useProgressStore.subscribe((state, prev) => {
      if (!prev) {
        return
      }
      if (
        state.totalStars === prev.totalStars &&
        state.tutorialComplete === prev.tutorialComplete
      ) {
        return
      }
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        void updateProfileProgressMirror({
          userId: user.id,
          totalStars: state.totalStars,
          tutorialComplete: state.tutorialComplete,
        })
      }, PROFILE_PUSH_MS)
    })

    return () => {
      sub()
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [user, hydratedFor])

  const handleMerge = async (choice: MergeChoice) => {
    const uid = mergeUserRef.current ?? user?.id
    const remote = mergeRemote
    if (!uid || !remote) {
      setMergeRemote(null)
      return
    }

    const local = useProgressStore.getState().stages

    if (choice === 'remote') {
      useProgressStore.getState().replaceProgressFromEntries(remote)
    } else if (choice === 'local') {
      await pushAllStageProgress(uid, Object.values(local))
    } else {
      const merged = mergeProgressRecords(local, remote)
      useProgressStore.getState().replaceProgressFromEntries(merged)
      await pushAllStageProgress(uid, merged)
    }

    setMergeRemote(null)
    setHydratedFor(uid)
    pushProfileMirrorNow(uid)
  }

  const localStages = useProgressStore((s) => s.stages)
  const localN = countProgressEntries(localStages)
  const remoteN = mergeRemote?.filter((r) => r.stars > 0).length ?? 0

  return <MergeProgressModal open={mergeRemote != null} localCount={localN} remoteCount={remoteN} onChoose={handleMerge} />
}
