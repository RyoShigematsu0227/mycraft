'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
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
  const { mutate } = useSWRConfig()
  const [isLoading, setIsLoading] = useState(false)

  const stats = usePostStatsStore((state) => state.stats[postId])
  const initPost = usePostStatsStore((state) => state.initPost)
  const toggleRepostStore = usePostStatsStore((state) => state.toggleRepost)
  const rollbackRepost = usePostStatsStore((state) => state.rollbackRepost)

  // Initialize/update store with server values
  // Preserve local count only if repostDirty flag is set (user made optimistic update)
  useEffect(() => {
    const existing = usePostStatsStore.getState().stats[postId]
    if (existing) {
      // Update isReposted from server (always sync this)
      if (initialReposted !== existing.isReposted && !existing.repostDirty) {
        usePostStatsStore.getState().setIsReposted(postId, initialReposted)
      }
      // Update count only if not dirty (no local optimistic update to preserve)
      if (!existing.repostDirty && initialCount !== existing.repostCount) {
        usePostStatsStore.getState().setRepostCount(postId, initialCount)
      }
    } else {
      initPost(postId, {
        repostCount: initialCount,
        isReposted: initialReposted,
      })
    }
  }, [postId, initialCount, initialReposted, initPost])

  const isReposted = stats?.isReposted ?? initialReposted
  const repostCount = stats?.repostCount ?? initialCount

  const toggleRepost = useCallback(async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    if (isLoading) return

    // Ensure store is initialized before toggle
    if (!usePostStatsStore.getState().stats[postId]) {
      initPost(postId, { repostCount: initialCount, isReposted: initialReposted })
    }

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

      // Invalidate caches
      mutate(['postReposts', postId])
      // EngagementTabs用のキャッシュも無効化
      mutate(
        (key) => Array.isArray(key) && key[0] === 'postEngagement' && key[1] === postId,
        undefined,
        { revalidate: true }
      )
    } catch (error) {
      // Revert optimistic update on error
      console.error('Repost toggle error:', error)
      rollbackRepost(postId, wasReposted, prevCount)
    } finally {
      setIsLoading(false)
    }
  }, [postId, currentUserId, isLoading, router, initPost, initialCount, initialReposted, toggleRepostStore, rollbackRepost, mutate])

  return { isReposted, repostCount, isLoading, toggleRepost }
}
