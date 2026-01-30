'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { usePostStatsStore } from '@/lib/stores'
import type { Database } from '@/types/database'

type Comment = Database['public']['Tables']['comments']['Row']
type User = Database['public']['Tables']['users']['Row']

interface CommentWithUser extends Comment {
  user: User
  likes_count: number
  is_liked: boolean
  replies?: CommentWithUser[]
}

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

      // Fetch the new comment with user data for optimistic update
      const { data: newCommentWithUser } = await supabase
        .from('comments')
        .select(`
          *,
          user:users!comments_user_id_fkey(*)
        `)
        .eq('id', data.id)
        .single()

      const cacheKey = ['comments', postId, currentUserId]

      if (newCommentWithUser) {
        const fullComment: CommentWithUser = {
          ...newCommentWithUser,
          user: newCommentWithUser.user as User,
          likes_count: 0,
          is_liked: false,
          replies: [],
        }

        // Helper function to recursively add reply to nested comments
        const addReplyToComment = (comments: CommentWithUser[]): CommentWithUser[] => {
          return comments.map((comment) => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), fullComment],
              }
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: addReplyToComment(comment.replies),
              }
            }
            return comment
          })
        }

        // Optimistically update the cache without revalidation
        // Use exact key instead of predicate function for updater to work
        mutate(
          cacheKey,
          (currentData: CommentWithUser[] | undefined) => {
            if (!currentData) return [fullComment]

            if (parentCommentId) {
              // Add reply to comment (recursively handles nested replies)
              return addReplyToComment(currentData)
            } else {
              // Add new root comment at the top
              return [fullComment, ...currentData]
            }
          },
          { revalidate: false }
        )
      } else {
        // Fallback: if fetch failed, trigger revalidation to show the comment
        mutate(cacheKey)
      }

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

      // Helper function to recursively remove comment from nested replies
      const removeComment = (comments: CommentWithUser[]): CommentWithUser[] => {
        return comments
          .filter((comment) => comment.id !== commentId)
          .map((comment) => ({
            ...comment,
            replies: comment.replies ? removeComment(comment.replies) : [],
          }))
      }

      // Optimistically remove the comment from cache without revalidation
      // Use exact key instead of predicate function for updater to work
      const cacheKey = ['comments', postId, currentUserId]
      mutate(
        cacheKey,
        (currentData: CommentWithUser[] | undefined) => {
          if (!currentData) return []
          return removeComment(currentData)
        },
        { revalidate: false }
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
