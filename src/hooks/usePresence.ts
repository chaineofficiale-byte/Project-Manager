import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel, User } from '@supabase/supabase-js'

export interface OnlineUser {
  id: string
  email: string
  online_at: string
}

/**
 * Qui est connecté au workspace en ce moment ?
 * Supabase Realtime Presence (ephemeral, no table/SQL needed).
 * Requires Realtime enabled on the Supabase project (default: on).
 *
 * One shared channel for the whole app (Header + Settings use it
 * together) so we never open two presence joins for the same user.
 * Any Realtime failure degrades silently: the page still renders,
 * the list is just empty.
 */

interface SharedState {
  key: string
  channel: RealtimeChannel
  users: OnlineUser[]
  ready: boolean
  refs: number
}

let shared: SharedState | null = null
const usersListeners = new Set<(u: OnlineUser[]) => void>()
const readyListeners = new Set<(r: boolean) => void>()
/** Called on THIS client when someone kicks it. Param = email of the kicker. */
const kickListeners = new Set<(by: string) => void>()

function emitUsers(users: OnlineUser[]) {
  if (shared) shared.users = users
  usersListeners.forEach((fn) => {
    try {
      fn(users)
    } catch {
      /* ignore listener errors */
    }
  })
}

function emitReady(ready: boolean) {
  if (shared) shared.ready = ready
  readyListeners.forEach((fn) => {
    try {
      fn(ready)
    } catch {
      /* ignore */
    }
  })
}

function syncFrom(channel: RealtimeChannel) {
  try {
    const state = channel.presenceState<{ email: string; online_at: string }>()
    const users: OnlineUser[] = Object.entries(state).map(([id, metas]) => {
      const latest = [...metas].sort((a, b) =>
        (b.online_at ?? '').localeCompare(a.online_at ?? '')
      )[0]
      return { id, email: latest?.email ?? '?', online_at: latest?.online_at ?? '' }
    })
    users.sort((a, b) => a.email.localeCompare(b.email))
    emitUsers(users)
  } catch {
    /* presence payload unreadable — keep previous list */
  }
}

function ensureShared(user: User): SharedState {
  if (shared && shared.key === user.id) {
    shared.refs += 1
    return shared
  }
  // Different user (or first use): tear down the old channel.
  if (shared) {
    const old = shared
    shared = null
    try {
      void old.channel.untrack()
    } catch {
      /* ignore */
    }
    try {
      void supabase.removeChannel(old.channel)
    } catch {
      /* ignore */
    }
  }
  const channel = supabase.channel('workspace-online', {
    config: { presence: { key: user.id } },
  })
  shared = { key: user.id, channel, users: [], ready: false, refs: 1 }
  const current = shared
  try {
    channel
      .on('presence', { event: 'sync' }, () => syncFrom(channel))
      .on('presence', { event: 'join' }, () => syncFrom(channel))
      .on('presence', { event: 'leave' }, () => syncFrom(channel))
      // Admin kick: "déconnecte ce compte". Registered BEFORE subscribe
      // (realtime-js forbids adding callbacks after subscribe).
      .on('broadcast', { event: 'kick' }, (msg) => {
        try {
          const payload = (msg as { payload?: { targetId?: string; by?: string } }).payload
          if (payload?.targetId && payload.targetId === current.key) {
            kickListeners.forEach((fn) => {
              try {
                fn(payload.by ?? '?')
              } catch {
                /* ignore */
              }
            })
          }
        } catch {
          /* malformed kick message — ignore */
        }
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return
        channel
          .track({ email: user.email ?? '?', online_at: new Date().toISOString() })
          .then(() => emitReady(true))
          .catch(() => {
            /* tracking failed — list stays empty, page still works */
          })
      })
  } catch {
    /* Realtime unavailable — degrade silently */
  }
  return current
}

function releaseShared() {
  if (!shared) return
  shared.refs -= 1
  if (shared.refs > 0) return
  const old = shared
  shared = null
  emitUsers([])
  emitReady(false)
  try {
    void old.channel.untrack()
  } catch {
    /* ignore */
  }
  try {
    void supabase.removeChannel(old.channel)
  } catch {
    /* ignore */
  }
}

export function usePresence(user: User | null, onKicked?: (by: string) => void) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>(() => shared?.users ?? [])
  const [ready, setReady] = useState(() => shared?.ready ?? false)
  // Always call the LATEST onKicked without re-subscribing the effect.
  const kickedRef = useRef(onKicked)
  kickedRef.current = onKicked

  useEffect(() => {
    if (!user) {
      setOnlineUsers([])
      setReady(false)
      return
    }
    let state: SharedState | null = null
    try {
      state = ensureShared(user)
      setOnlineUsers(state.users)
      setReady(state.ready)
    } catch {
      setOnlineUsers([])
      setReady(false)
      return
    }
    const notifyKick = (by: string) => kickedRef.current?.(by)
    usersListeners.add(setOnlineUsers)
    readyListeners.add(setReady)
    kickListeners.add(notifyKick)
    return () => {
      usersListeners.delete(setOnlineUsers)
      readyListeners.delete(setReady)
      kickListeners.delete(notifyKick)
      try {
        releaseShared()
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.email])

  return { onlineUsers, ready, kickUser }
}

/**
 * Ask another online account to disconnect NOW.
 * The target client signs out as soon as it receives the broadcast.
 * Only works while the target is online; they can log back in after.
 */
export async function kickUser(targetId: string, by: string): Promise<boolean> {
  if (!shared) return false
  try {
    await shared.channel.send({
      type: 'broadcast',
      event: 'kick',
      payload: { targetId, by },
    })
    return true
  } catch {
    return false
  }
}

/** 1-2 initials from an email for the avatar circle. */
export function initialsOf(email: string): string {
  const name = (email || '?').split('@')[0] || '?'
  const parts = name.split(/[._-]+/).filter(Boolean)
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
