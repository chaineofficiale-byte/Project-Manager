import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface OnlineUser {
  id: string
  email: string
  online_at: string
}

/**
 * Qui est connecté au workspace en ce moment ?
 * Uses Supabase Realtime Presence (ephemeral, no table/SQL needed).
 * Requires Realtime enabled on the Supabase project (default: on).
 */
export function usePresence(user: User | null) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!user) {
      setOnlineUsers([])
      setReady(false)
      return
    }

    const channel = supabase.channel('workspace-online', {
      config: { presence: { key: user.id } },
    })

    function sync() {
      const state = channel.presenceState<{ email: string; online_at: string }>()
      const users: OnlineUser[] = Object.entries(state).map(([id, metas]) => {
        const latest = [...metas].sort((a, b) =>
          (b.online_at ?? '').localeCompare(a.online_at ?? '')
        )[0]
        return { id, email: latest?.email ?? '?', online_at: latest?.online_at ?? '' }
      })
      users.sort((a, b) => a.email.localeCompare(b.email))
      setOnlineUsers(users)
    }

    channel
      .on('presence', { event: 'sync' }, sync)
      .on('presence', { event: 'join' }, sync)
      .on('presence', { event: 'leave' }, sync)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            email: user.email ?? '?',
            online_at: new Date().toISOString(),
          })
          setReady(true)
        }
      })

    return () => {
      void channel.untrack()
      void supabase.removeChannel(channel)
    }
  }, [user?.id, user?.email])

  return { onlineUsers, ready }
}

/** 1-2 initials from an email for the avatar circle. */
export function initialsOf(email: string): string {
  const name = email.split('@')[0]
  const parts = name.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}
