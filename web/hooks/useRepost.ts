'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseRepostOptions {
  postId: string
  currentUserId: string
  initialReposted?: boolean
  initialCount?: number
}

interface UseRepostReturn {
  isReposted: boolean
  repostCount: number
  isLoading: boolean
  toggleRepost: () => Promise<void>
}

export function useRepost({
  postId,
  currentUserId,
  initialReposted = false,
  initialCount = 0,
}: UseRepostOptions): UseRepostReturn {
  const [isReposted, setIsReposted] = useState(initialReposted)
  const [repostCount, setRepostCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(!initialReposted && !!currentUserId)
  const supabase = createClient()

  // Check if already reposted
  useEffect(() => {
    if (initialReposted || !currentUserId) {
      setIsLoading(false)
      return
    }

    const checkRepostStatus = async () => {
      const { data } = await supabase
        .from('reposts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .single()

      setIsReposted(!!data)
      setIsLoading(false)
    }

    checkRepostStatus()
  }, [postId, currentUserId, initialReposted, supabase])

  const toggleRepost = useCallback(async () => {
    if (!currentUserId || isLoading) return

    setIsLoading(true)

    try {
      if (isReposted) {
        await supabase
          .from('reposts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId)

        setIsReposted(false)
        setRepostCount((prev) => Math.max(0, prev - 1))
      } else {
        await supabase.from('reposts').insert({
          post_id: postId,
          user_id: currentUserId,
        })

        setIsReposted(true)
        setRepostCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Repost toggle error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [postId, currentUserId, isReposted, isLoading, supabase])

  return { isReposted, repostCount, isLoading, toggleRepost }
}
