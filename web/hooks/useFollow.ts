'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserStatsStore } from '@/lib/stores'

interface UseFollowOptions {
  targetUserId: string
  currentUserId?: string
  initialFollowing?: boolean
}

interface UseFollowReturn {
  isFollowing: boolean
  isLoading: boolean
  toggleFollow: () => Promise<void>
}

export function useFollow({
  targetUserId,
  currentUserId,
  initialFollowing,
}: UseFollowOptions): UseFollowReturn {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(initialFollowing === undefined && !!currentUserId)
  const [isToggling, setIsToggling] = useState(false)

  const targetStats = useUserStatsStore((state) => state.stats[targetUserId])
  const initUser = useUserStatsStore((state) => state.initUser)
  const setIsFollowing = useUserStatsStore((state) => state.setIsFollowing)
  const toggleFollowStore = useUserStatsStore((state) => state.toggleFollow)
  const rollbackFollow = useUserStatsStore((state) => state.rollbackFollow)

  // Initialize store with initial values if not already set
  useEffect(() => {
    if (!targetStats && initialFollowing !== undefined) {
      initUser(targetUserId, {
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isFollowing: initialFollowing,
      })
    }
  }, [targetUserId, initialFollowing, targetStats, initUser])

  // Check initial follow status if not provided
  useEffect(() => {
    if (initialFollowing !== undefined || !currentUserId || !targetUserId) {
      setIsLoading(false)
      return
    }

    const checkFollowStatus = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single()

      const isFollowing = !!data

      // Initialize or update store
      if (!targetStats) {
        initUser(targetUserId, {
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isFollowing,
        })
      } else {
        setIsFollowing(targetUserId, isFollowing)
      }

      setIsLoading(false)
    }

    checkFollowStatus()
  }, [currentUserId, targetUserId, initialFollowing, targetStats, initUser, setIsFollowing])

  const isFollowing = targetStats?.isFollowing ?? initialFollowing ?? false

  const toggleFollow = useCallback(async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    if (!targetUserId || isToggling) return

    // Optimistic update via store
    const { wasFollowing, prevFollowersCount, prevFollowingCount } = toggleFollowStore(
      targetUserId,
      currentUserId
    )
    setIsToggling(true)

    try {
      const supabase = createClient()

      if (wasFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('follows').insert({
          follower_id: currentUserId,
          following_id: targetUserId,
        })

        if (error) throw error
      }
    } catch (error) {
      // Revert optimistic update on error
      console.error('Follow toggle error:', error)
      rollbackFollow(targetUserId, currentUserId, wasFollowing, prevFollowersCount, prevFollowingCount)
    } finally {
      setIsToggling(false)
    }
  }, [currentUserId, targetUserId, isToggling, router, toggleFollowStore, rollbackFollow])

  return { isFollowing, isLoading: isLoading || isToggling, toggleFollow }
}
