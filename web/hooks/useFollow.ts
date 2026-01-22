'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseFollowOptions {
  targetUserId: string
  currentUserId: string
}

interface UseFollowReturn {
  isFollowing: boolean
  isLoading: boolean
  toggleFollow: () => Promise<void>
}

export function useFollow({ targetUserId, currentUserId }: UseFollowOptions): UseFollowReturn {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Check if already following
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUserId || !targetUserId) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .single()

      setIsFollowing(!!data)
      setIsLoading(false)
    }

    checkFollowStatus()
  }, [currentUserId, targetUserId, supabase])

  const toggleFollow = useCallback(async () => {
    if (!currentUserId || !targetUserId || isLoading) return

    setIsLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', targetUserId)

        setIsFollowing(false)
      } else {
        // Follow
        await supabase.from('follows').insert({
          follower_id: currentUserId,
          following_id: targetUserId,
        })

        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Follow toggle error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId, targetUserId, isFollowing, isLoading, supabase])

  return { isFollowing, isLoading, toggleFollow }
}
