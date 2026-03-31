import { getSupabase, isSupabaseConfigured } from './client'

export type AuthResult = { error: Error | null }

/**
 * Sends a magic-link email. Requires Supabase Auth "Email" provider enabled
 * and redirect URLs whitelisted for the app origin.
 */
export async function signInWithMagicLink(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured') }
  }

  const { error } = await getSupabase().auth.signInWithOtp({
    email: email.trim(),
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  })

  return { error: error ? new Error(error.message) : null }
}

export async function signOut(): Promise<AuthResult> {
  if (!isSupabaseConfigured) {
    return { error: null }
  }

  const { error } = await getSupabase().auth.signOut()
  return { error: error ? new Error(error.message) : null }
}
