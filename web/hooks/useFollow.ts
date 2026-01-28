'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
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
  const { mutate } = useSWRConfig()
  const [isLoading, setIsLoading] = useState(initialFollowing === undefined && !!currentUserId)
  const [isToggling, setIsToggling] = useState(false)

  const targetStats = useUserStatsStore((state) => state.stats[targetUserId])
  const initUser = useUserStatsStore((state) => state.initUser)
  const setIsFollowing = useUserStatsStore((state) => state.setIsFollowing)
  const toggleFollowStore = useUserStatsStore((state) => state.toggleFollow)
  const rollbackFollow = useUserStatsStore((state) => state.rollbackFollow)

  // Initialize/update store with server values
  // Preserve local state only if followersDirty flag is set (user made optimistic update)
  useEffect(() => {
    const existing = useUserStatsStore.getState().stats[targetUserId]
    if (existing) {
      // Update isFollowing from server only if not dirty (no local optimistic update to preserve)
      if (initialFollowing !== undefined && !existing.followersDirty) {
        if (initialFollowing !== existing.isFollowing) {
          setIsFollowing(targetUserId, initialFollowing)
        }
      }
    } else if (initialFollowing !== undefined) {
      initUser(targetUserId, {
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isFollowing: initialFollowing,
      })
    }
  }, [targetUserId, initialFollowing, initUser, setIsFollowing])

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

      const isFollowingFromServer = !!data
      const existing = useUserStatsStore.getState().stats[targetUserId]

      // Initialize or update store only if not dirty
      if (!existing) {
        initUser(targetUserId, {
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isFollowing: isFollowingFromServer,
        })
      } else if (!existing.followersDirty) {
        setIsFollowing(targetUserId, isFollowingFromServer)
      }

      setIsLoading(false)
    }

    checkFollowStatus()
  }, [currentUserId, targetUserId, initialFollowing, initUser, setIsFollowing])

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

      // フォロー中フィードはすぐに反映が必要なのでrevalidate
      mutate(
        (key) => Array.isArray(key) && key[0] === 'feed' && key[1] === 'following',
        undefined,
        { revalidate: true }
      )
      // FollowTabs用のキャッシュは無効化しない
      // UIはZustand storeで即座に更新済み、画面遷移時にSWRが自然に再取得する
    } catch (error) {
      // Revert optimistic update on error
      console.error('Follow toggle error:', error)
      rollbackFollow(targetUserId, currentUserId, wasFollowing, prevFollowersCount, prevFollowingCount)
    } finally {
      setIsToggling(false)
    }
  }, [currentUserId, targetUserId, isToggling, router, toggleFollowStore, rollbackFollow, mutate])

  return { isFollowing, isLoading: isLoading || isToggling, toggleFollow }
}
