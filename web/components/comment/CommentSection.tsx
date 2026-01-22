'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import CommentCard from './CommentCard'
import CommentForm from './CommentForm'
import { Loading, EmptyState } from '@/components/ui'
import type { Database } from '@/types/database'

type Comment = Database['public']['Tables']['comments']['Row']
type User = Database['public']['Tables']['users']['Row']

interface CommentWithUser extends Comment {
  user: User
  likes_count: number
  is_liked: boolean
  replies?: CommentWithUser[]
}

interface CommentSectionProps {
  postId: string
  currentUserId?: string
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchComments = useCallback(async () => {
    const supabase = createClient()

    const { data: commentsData, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users!comments_user_id_fkey(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      setLoading(false)
      return
    }

    const commentIds = commentsData.map((c) => c.id)

    let likesData: { comment_id: string }[] = []
    let userLikesData: { comment_id: string }[] = []

    if (commentIds.length > 0) {
      const [likesResult, userLikesResult] = await Promise.all([
        supabase
          .from('comment_likes')
          .select('comment_id')
          .in('comment_id', commentIds),
        currentUserId
          ? supabase
              .from('comment_likes')
              .select('comment_id')
              .eq('user_id', currentUserId)
              .in('comment_id', commentIds)
          : Promise.resolve({ data: [] }),
      ])

      likesData = likesResult.data || []
      userLikesData = (userLikesResult as { data: { comment_id: string }[] | null }).data || []
    }

    const likesCount = new Map<string, number>()
    likesData.forEach((like) => {
      likesCount.set(like.comment_id, (likesCount.get(like.comment_id) || 0) + 1)
    })

    const userLikedSet = new Set(userLikesData.map((l) => l.comment_id))

    const commentsWithUser: CommentWithUser[] = commentsData.map((c) => ({
      ...c,
      user: c.user as User,
      likes_count: likesCount.get(c.id) || 0,
      is_liked: userLikedSet.has(c.id),
      replies: [],
    }))

    const commentMap = new Map<string, CommentWithUser>()
    const rootComments: CommentWithUser[] = []

    commentsWithUser.forEach((comment) => {
      commentMap.set(comment.id, comment)
    })

    commentsWithUser.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id)
        if (parent) {
          parent.replies = parent.replies || []
          parent.replies.push(comment)
        }
      } else {
        rootComments.push(comment)
      }
    })

    setComments(rootComments)
    setLoading(false)
  }, [postId, currentUserId])

  // Initial fetch and refresh on key change
  useEffect(() => {
    void fetchComments()
  }, [fetchComments, refreshKey])

  // Realtime subscription for new comments
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, fetchComments])

  const handleCommentSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <CommentForm
          postId={postId}
          currentUserId={currentUserId}
          onSuccess={handleCommentSuccess}
        />
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {comments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              }
              title="コメントはまだありません"
              description="最初のコメントを投稿してみましょう"
            />
          </div>
        ) : (
          <div className="px-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                postId={postId}
                currentUserId={currentUserId}
                onReplySuccess={handleCommentSuccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
