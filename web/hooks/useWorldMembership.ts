'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseWorldMembershipOptions {
  worldId: string
  currentUserId: string
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
  const [isMember, setIsMember] = useState(initialIsMember)
  const [isLoading, setIsLoading] = useState(!initialIsMember)
  const supabase = createClient()

  // Check if already a member
  useEffect(() => {
    if (initialIsMember) {
      setIsLoading(false)
      return
    }

    const checkMembership = async () => {
      if (!currentUserId || !worldId) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from('world_members')
        .select('id')
        .eq('world_id', worldId)
        .eq('user_id', currentUserId)
        .single()

      setIsMember(!!data)
      setIsLoading(false)
    }

    checkMembership()
  }, [currentUserId, worldId, initialIsMember, supabase])

  const toggleMembership = useCallback(async () => {
    if (!currentUserId || !worldId || isLoading) return

    setIsLoading(true)

    try {
      if (isMember) {
        // Leave world
        await supabase
          .from('world_members')
          .delete()
          .eq('world_id', worldId)
          .eq('user_id', currentUserId)

        setIsMember(false)
      } else {
        // Join world
        await supabase.from('world_members').insert({
          world_id: worldId,
          user_id: currentUserId,
        })

        setIsMember(true)
      }
    } catch (error) {
      console.error('Membership toggle error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId, worldId, isMember, isLoading, supabase])

  return { isMember, isLoading, toggleMembership }
}
