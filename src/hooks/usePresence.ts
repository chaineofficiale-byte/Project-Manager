import { useState, useEffect } from 'react'
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

export function usePresence(user: User | null) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>(() => shared?.users ?? [])
  const [ready, setReady] = useState(() => shared?.ready ?? false)

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
    usersListeners.add(setOnlineUsers)
    readyListeners.add(setReady)
    return () => {
      usersListeners.delete(setOnlineUsers)
      readyListeners.delete(setReady)
      try {
        releaseShared()
      } catch {
        /* ignore */
      }
    }
  }, [user?.id, user?.email])

  return { onlineUsers, ready }
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
