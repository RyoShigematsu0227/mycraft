'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/auth'
import type { Tables } from '@/types/database'

export function useAuth() {
  const { user, session, isLoading, setUser, setSession, setLoading, reset } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setLoading])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    reset()
    window.location.href = '/'
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  }
}

// Hook to get user profile from database
export function useUserProfile(userId?: string) {
  const { user } = useAuth()
  const targetUserId = userId ?? user?.id

  const getProfile = async (): Promise<Tables<'users'> | null> => {
    if (!targetUserId) return null

    const supabase = createClient()
    const { data } = await supabase.from('users').select('*').eq('id', targetUserId).single()

    return data
  }

  return { getProfile, userId: targetUserId }
}
