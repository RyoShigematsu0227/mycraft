'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { usePostStatsStore } from '@/lib/stores'

interface UseLikeOptions {
  postId: string
  currentUserId?: string
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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const stats = usePostStatsStore((state) => state.stats[postId])
  const initPost = usePostStatsStore((state) => state.initPost)
  const toggleLikeStore = usePostStatsStore((state) => state.toggleLike)
  const rollbackLike = usePostStatsStore((state) => state.rollbackLike)

  // Initialize store with like-related values (merges with existing)
  useEffect(() => {
    initPost(postId, {
      likeCount: initialCount,
      isLiked: initialLiked,
    })
  }, [postId, initialCount, initialLiked, initPost])

  const isLiked = stats?.isLiked ?? initialLiked
  const likeCount = stats?.likeCount ?? initialCount

  const toggleLike = useCallback(async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    if (isLoading) return

    // Optimistic update via store
    const { wasLiked, prevCount } = toggleLikeStore(postId)
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (wasLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('likes').insert({
          post_id: postId,
          user_id: currentUserId,
        })

        if (error) throw error
      }
    } catch (error: unknown) {
      // Revert optimistic update on error
      const err = error as { message?: string; code?: string; details?: string }
      console.error('Like toggle error:', err.message || err.code || JSON.stringify(error))
      rollbackLike(postId, wasLiked, prevCount)
    } finally {
      setIsLoading(false)
    }
  }, [postId, currentUserId, isLoading, router, toggleLikeStore, rollbackLike])

  return { isLiked, likeCount, isLoading, toggleLike }
}
