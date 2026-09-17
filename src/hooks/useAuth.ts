import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, AuthError } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: AuthError | null }> => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    },
    []
  )

  const signUp = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: AuthError | null; needsConfirmation: boolean }> => {
      const { data, error } = await supabase.auth.signUp({ email, password })
      // If email confirmation is enabled in Supabase, there is no session yet:
      // the user must confirm their email before they can log in.
      return { error, needsConfirmation: !data.session && !!data.user }
    },
    []
  )

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: AuthError | null }> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    },
    []
  )

  const changePassword = useCallback(
    async (newPassword: string): Promise<{ error: AuthError | null }> => {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      return { error }
    },
    []
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { user, loading, signIn, signUp, resetPassword, changePassword, signOut }
}
