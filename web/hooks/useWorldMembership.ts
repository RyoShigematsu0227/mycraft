'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useWorldStatsStore } from '@/lib/stores'

interface UseWorldMembershipOptions {
  worldId: string
  currentUserId?: string
  initialIsMember?: boolean
}

interface UseWorldMembershipReturn {
  isMember: boolean
  isLoading: boolean
  toggleMembership: () => Promise<void>
}

export function useWorldMembership({
  worldId,
  currentUserId,
  initialIsMember = false,
}: UseWorldMembershipOptions): UseWorldMembershipReturn {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(!initialIsMember && !!currentUserId)
  const [isToggling, setIsToggling] = useState(false)
  const supabase = createClient()

  const worldStats = useWorldStatsStore((state) => state.stats[worldId])
  const initWorld = useWorldStatsStore((state) => state.initWorld)
  const setIsMember = useWorldStatsStore((state) => state.setIsMember)
  const toggleMembershipStore = useWorldStatsStore((state) => state.toggleMembership)
  const rollbackMembership = useWorldStatsStore((state) => state.rollbackMembership)

  // Initialize store only if not exists
  // Once initialized, don't override with initialIsMember (user may have toggled)
  useEffect(() => {
    if (!worldStats) {
      initWorld(worldId, {
        memberCount: 0,
        isMember: initialIsMember,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldId, initWorld])

  // Check if already a member
  useEffect(() => {
    if (initialIsMember || !currentUserId || !worldId) {
      setIsLoading(false)
      return
    }

    const checkMembership = async () => {
      const { data } = await supabase
        .from('world_members')
        .select('id')
        .eq('world_id', worldId)
        .eq('user_id', currentUserId)
        .single()

      const isMember = !!data
      setIsMember(worldId, isMember)
      setIsLoading(false)
    }

    checkMembership()
  }, [currentUserId, worldId, initialIsMember, supabase, setIsMember])

  const isMember = worldStats?.isMember ?? initialIsMember

  const toggleMembership = useCallback(async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    if (!worldId || isToggling || isLoading) return

    // Optimistic update via store
    const { wasMember, prevCount } = toggleMembershipStore(worldId)
    setIsToggling(true)

    try {
      if (wasMember) {
        // Leave world
        const { error } = await supabase
          .from('world_members')
          .delete()
          .eq('world_id', worldId)
          .eq('user_id', currentUserId)

        if (error) throw error
      } else {
        // Join world
        const { error } = await supabase.from('world_members').insert({
          world_id: worldId,
          user_id: currentUserId,
        })

        if (error) throw error
      }
    } catch (error) {
      // Revert optimistic update on error
      const err = error as { message?: string; code?: string }
      console.error('Membership toggle error:', err?.message || err?.code || error)
      rollbackMembership(worldId, wasMember, prevCount)
    } finally {
      setIsToggling(false)
    }
  }, [currentUserId, worldId, isToggling, isLoading, router, supabase, toggleMembershipStore, rollbackMembership])

  return { isMember, isLoading: isLoading || isToggling, toggleMembership }
}
