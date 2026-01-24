'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { usePostStatsStore } from '@/lib/stores'

interface UseCommentProps {
  postId: string
  currentUserId?: string
}

export default function useComment({ postId, currentUserId }: UseCommentProps) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const incrementCommentCount = usePostStatsStore((state) => state.incrementCommentCount)
  const decrementCommentCount = usePostStatsStore((state) => state.decrementCommentCount)

  const createComment = async (content: string, parentCommentId?: string) => {
    if (!currentUserId) {
      router.push('/login')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert({
          user_id: currentUserId,
          post_id: postId,
          parent_comment_id: parentCommentId || null,
          content: content.trim(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Update comment count in store
      incrementCommentCount(postId)

      // Invalidate comments cache
      mutate(
        (key) => Array.isArray(key) && key[0] === 'comments' && key[1] === postId,
        undefined,
        { revalidate: true }
      )

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの投稿に失敗しました')
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!currentUserId) return false

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId)

      if (deleteError) throw deleteError

      // Update comment count in store
      decrementCommentCount(postId)

      // Invalidate comments cache
      mutate(
        (key) => Array.isArray(key) && key[0] === 'comments' && key[1] === postId,
        undefined,
        { revalidate: true }
      )

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの削除に失敗しました')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    createComment,
    deleteComment,
    loading,
    error,
  }
}
