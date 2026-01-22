'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseLikeOptions {
  postId: string
  currentUserId: string
  initialLiked?: boolean
  initialCount?: number
}

interface UseLikeReturn {
  isLiked: boolean
  likeCount: number
  isLoading: boolean
  toggleLike: () => Promise<void>
}

export function useLike({
  postId,
  currentUserId,
  initialLiked = false,
  initialCount = 0,
}: UseLikeOptions): UseLikeReturn {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(!initialLiked && !!currentUserId)
  const supabase = createClient()

  // Check if already liked
  useEffect(() => {
    if (initialLiked || !currentUserId) {
      setIsLoading(false)
      return
    }

    const checkLikeStatus = async () => {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .single()

      setIsLiked(!!data)
      setIsLoading(false)
    }

    checkLikeStatus()
  }, [postId, currentUserId, initialLiked, supabase])

  const toggleLike = useCallback(async () => {
    if (!currentUserId || isLoading) return

    setIsLoading(true)

    try {
      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId)

        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await supabase.from('likes').insert({
          post_id: postId,
          user_id: currentUserId,
        })

        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Like toggle error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [postId, currentUserId, isLiked, isLoading, supabase])

  return { isLiked, likeCount, isLoading, toggleLike }
}
