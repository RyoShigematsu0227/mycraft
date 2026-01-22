'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { usePostStatsStore } from '@/lib/stores'

interface UseRepostOptions {
  postId: string
  currentUserId?: string
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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const stats = usePostStatsStore((state) => state.stats[postId])
  const initPost = usePostStatsStore((state) => state.initPost)
  const toggleRepostStore = usePostStatsStore((state) => state.toggleRepost)
  const rollbackRepost = usePostStatsStore((state) => state.rollbackRepost)

  // Initialize store with initial values if not already set
  useEffect(() => {
    if (!stats) {
      initPost(postId, {
        likeCount: 0,
        repostCount: initialCount,
        commentCount: 0,
        isLiked: false,
        isReposted: initialReposted,
      })
    }
  }, [postId, initialCount, initialReposted, stats, initPost])

  const isReposted = stats?.isReposted ?? initialReposted
  const repostCount = stats?.repostCount ?? initialCount

  const toggleRepost = useCallback(async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    if (isLoading) return

    // Optimistic update via store
    const { wasReposted, prevCount } = toggleRepostStore(postId)
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (wasReposted) {
        const { error } = await supabase
          .from('reposts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('reposts').insert({
          post_id: postId,
          user_id: currentUserId,
        })

        if (error) throw error
      }
    } catch (error) {
      // Revert optimistic update on error
      console.error('Repost toggle error:', error)
      rollbackRepost(postId, wasReposted, prevCount)
    } finally {
      setIsLoading(false)
    }
  }, [postId, currentUserId, isLoading, router, toggleRepostStore, rollbackRepost])

  return { isReposted, repostCount, isLoading, toggleRepost }
}
