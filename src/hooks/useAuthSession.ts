import type { Session, User } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { signOut as supabaseSignOut } from '../services/supabase/auth'
import { getSupabase, isSupabaseConfigured } from '../services/supabase/client'

export type AuthSessionState = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuthSession(): AuthSessionState {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const sb = getSupabase()

    void sb.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = useCallback(async () => {
    await supabaseSignOut()
  }, [])

  return {
    user: session?.user ?? null,
    session,
    loading,
    signOut: handleSignOut,
  }
}
