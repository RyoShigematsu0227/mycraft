'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UseCommentProps {
  postId: string
  currentUserId?: string
}

export default function useComment({ postId, currentUserId }: UseCommentProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      router.refresh()
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

      router.refresh()
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
