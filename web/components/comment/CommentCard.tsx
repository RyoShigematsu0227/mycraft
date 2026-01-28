'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserAvatar } from '@/components/user'
import { ConfirmDialog } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { usePostStatsStore } from '@/lib/stores'
import CommentLikeButton from './CommentLikeButton'
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

interface CommentCardProps {
  comment: CommentWithUser
  postId: string
  currentUserId?: string
  depth?: number
  onReplySuccess?: () => void
  onDeleteSuccess?: () => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '今'
  if (minutes < 60) return `${minutes}分`
  if (hours < 24) return `${hours}時間`
  if (days < 7) return `${days}日`

  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export default function CommentCard({
  comment,
  postId,
  currentUserId,
  depth = 0,
  onReplySuccess,
  onDeleteSuccess,
}: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const maxDepth = 5

  const isOwner = currentUserId === comment.user_id

  const handleReplySuccess = () => {
    setShowReplyForm(false)
    onReplySuccess?.()
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const supabase = createClient()
      await supabase.from('comments').delete().eq('id', comment.id)
      // Update comment count in store
      usePostStatsStore.getState().decrementCommentCount(postId)
      setShowDeleteConfirm(false)
      onDeleteSuccess?.()
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={depth > 0 ? 'relative ml-6 pl-4' : ''}>
      {/* Thread line for replies */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/30 via-border to-transparent" />
      )}

      <div className="group/comment relative py-3">
        {/* Hover highlight */}
        <div className="pointer-events-none absolute -inset-x-2 -inset-y-1 rounded-xl bg-accent/5 opacity-0 transition-opacity group-hover/comment:opacity-100" />

        <div className="relative flex gap-3">
          <UserAvatar
            userId={comment.user.user_id}
            avatarUrl={comment.user.avatar_url}
            displayName={comment.user.display_name}
            size="sm"
            showGlow
          />
          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/users/${comment.user.user_id}`}
                className="group/name flex items-center gap-1.5"
              >
                <span className="truncate font-bold text-foreground transition-colors group-hover/name:text-accent">
                  {comment.user.display_name}
                </span>
                <span className="truncate text-muted">
                  @{comment.user.user_id}
                </span>
              </Link>
              <span className="text-border">·</span>
              <time className="text-muted">
                {formatDate(comment.created_at)}
              </time>
            </div>

            {/* Content */}
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="-ml-2 mt-2 flex items-center gap-1">
              <CommentLikeButton
                commentId={comment.id}
                currentUserId={currentUserId}
                initialLiked={comment.is_liked}
                initialCount={comment.likes_count}
              />
              {depth < maxDepth && currentUserId && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    showReplyForm
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted hover:bg-accent/10 hover:text-accent'
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  返信
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  削除
                </button>
              )}
            </div>

            <ConfirmDialog
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={handleDelete}
              title="コメントを削除しますか？"
              description="この操作は取り消せません。"
              confirmText="削除する"
              loading={deleting}
            />

            {/* Reply form */}
            {showReplyForm && (
              <div className="mt-3 rounded-xl bg-surface-hover p-3">
                <CommentForm
                  postId={postId}
                  currentUserId={currentUserId}
                  parentCommentId={comment.id}
                  placeholder={`@${comment.user.user_id} への返信...`}
                  onSuccess={handleReplySuccess}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              depth={depth + 1}
              onReplySuccess={onReplySuccess}
              onDeleteSuccess={onDeleteSuccess}
            />
          ))}
        </div>
      )}
    </div>
  )
}
