'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { createClient } from '@/lib/supabase/client'

interface UseCommentLikeProps {
  postId: string
  commentId: string
  currentUserId?: string
  initialLiked?: boolean
  initialCount?: number
}

export default function useCommentLike({
  postId,
  commentId,
  currentUserId,
  initialLiked = false,
  initialCount = 0,
}: UseCommentLikeProps) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const supabase = createClient()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  const toggleLike = useCallback(async () => {
    if (!currentUserId) {
      router.push('/login')
      return
    }

    if (loading) return

    setLoading(true)
    const wasLiked = isLiked

    // Optimistic update
    setIsLiked(!wasLiked)
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1))

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUserId)

        if (error) throw error
      } else {
        const { error } = await supabase.from('comment_likes').insert({
          comment_id: commentId,
          user_id: currentUserId,
        })

        if (error) throw error
      }

      // コメントキャッシュを無効化
      mutate(
        (key) => Array.isArray(key) && key[0] === 'comments' && key[1] === postId,
        undefined,
        { revalidate: true }
      )
    } catch {
      // Revert optimistic update
      setIsLiked(wasLiked)
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1))
    } finally {
      setLoading(false)
    }
  }, [commentId, postId, currentUserId, isLiked, loading, router, supabase, mutate])

  return {
    isLiked,
    likeCount,
    toggleLike,
    loading,
  }
}
