import { useState } from 'react'
import { signInWithMagicLink } from '../../services/supabase/auth'
import { isSupabaseConfigured } from '../../services/supabase/client'
import type { AuthSessionState } from '../../hooks/useAuthSession'

type AuthPanelProps = {
  auth: AuthSessionState
}

export function AuthPanel({ auth }: AuthPanelProps) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-lg border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-left text-sm text-amber-100">
        <p className="font-medium">Supabase not configured</p>
        <p className="mt-1 text-amber-200/90">
          Copy <code className="rounded bg-black/30 px-1">.env.example</code> to{' '}
          <code className="rounded bg-black/30 px-1">.env</code> and add your project URL + anon key.
          Run SQL in <code className="rounded bg-black/30 px-1">supabase/migrations/</code>.
        </p>
      </div>
    )
  }

  if (auth.loading) {
    return <p className="text-sm text-slate-400">Checking session…</p>
  }

  if (auth.user) {
    return (
      <div className="flex flex-col gap-2 text-left text-sm">
        <p className="text-slate-200">
          Signed in as <span className="font-medium">{auth.user.email ?? auth.user.id}</span>
        </p>
        <button
          type="button"
          className="self-start rounded-md bg-slate-700 px-3 py-1.5 text-white hover:bg-slate-600"
          onClick={() => void auth.signOut()}
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col gap-2 text-left text-sm"
      onSubmit={(e) => {
        e.preventDefault()
        setMessage(null)
        setBusy(true)
        void signInWithMagicLink(email).then(({ error }) => {
          setBusy(false)
          if (error) {
            setMessage(error.message)
            return
          }
          setMessage('Check your email for the magic link.')
        })
      }}
    >
      <label className="text-slate-300" htmlFor="magic-email">
        Email (magic link)
      </label>
      <input
        id="magic-email"
        className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-slate-100"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="you@example.com"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {busy ? 'Sending…' : 'Send magic link'}
      </button>
      {message ? <p className="text-slate-300">{message}</p> : null}
    </form>
  )
}
