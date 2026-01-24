'use client'

import { useEffect } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { createClient } from '@/lib/supabase/client'
import CommentCard from './CommentCard'
import CommentForm from './CommentForm'
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

async function fetchComments(postId: string, currentUserId?: string): Promise<CommentWithUser[]> {
  const supabase = createClient()

  const { data: commentsData, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:users!comments_user_id_fkey(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
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

  return rootComments
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const { mutate } = useSWRConfig()

  const { data: comments = [], isLoading } = useSWR(
    ['comments', postId, currentUserId],
    () => fetchComments(postId, currentUserId)
  )

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
          mutate(['comments', postId, currentUserId])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, currentUserId, mutate])

  const handleCommentSuccess = () => {
    mutate(['comments', postId, currentUserId])
  }

  if (isLoading) {
    return (
      <div className="border-t border-border bg-surface p-4">
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-surface-hover" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-4 w-20 rounded bg-surface-hover" />
                  <div className="h-4 w-12 rounded bg-surface-hover" />
                </div>
                <div className="h-4 w-3/4 rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-border bg-surface">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-sm font-semibold text-foreground">
          コメント
          {comments.length > 0 && (
            <span className="ml-1.5 text-muted">({comments.length})</span>
          )}
        </span>
      </div>

      {/* Comment form */}
      <div className="border-b border-border p-4">
        <CommentForm
          postId={postId}
          currentUserId={currentUserId}
          onSuccess={handleCommentSuccess}
        />
      </div>

      {/* Comments list */}
      <div>
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-4">
              <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-accent/10 to-accent-secondary/10 blur-lg" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-hover">
                <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <p className="font-medium text-foreground">コメントはまだありません</p>
            <p className="mt-1 text-sm text-muted">最初のコメントを投稿してみましょう</p>
          </div>
        ) : (
          <div className="px-4 pb-2">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                postId={postId}
                currentUserId={currentUserId}
                onReplySuccess={handleCommentSuccess}
                onDeleteSuccess={handleCommentSuccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
