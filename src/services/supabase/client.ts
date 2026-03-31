import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured =
  typeof url === 'string' &&
  url.length > 0 &&
  typeof anonKey === 'string' &&
  anonKey.length > 0

let client: SupabaseClient | null = null

/**
 * Returns a singleton Supabase client. Throws if env vars are missing.
 * UI should call `isSupabaseConfigured` first and show setup instructions.
 */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.'
    )
  }
  if (!client) {
    client = createClient(url as string, anonKey as string)
  }
  return client
}
