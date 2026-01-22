'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserAvatar } from '@/components/user'
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
  if (minutes < 60) return `${minutes}分前`
  if (hours < 24) return `${hours}時間前`
  if (days < 7) return `${days}日前`

  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export default function CommentCard({
  comment,
  postId,
  currentUserId,
  depth = 0,
}: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const maxDepth = 5

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4 dark:border-gray-800' : ''}>
      <div className="py-3">
        <div className="flex gap-3">
          <UserAvatar
            userId={comment.user.user_id}
            avatarUrl={comment.user.avatar_url}
            displayName={comment.user.display_name}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/users/${comment.user.user_id}`}
                className="truncate font-bold text-gray-900 hover:underline dark:text-gray-100"
              >
                {comment.user.display_name}
              </Link>
              <Link
                href={`/users/${comment.user.user_id}`}
                className="truncate text-gray-500 dark:text-gray-400"
              >
                @{comment.user.user_id}
              </Link>
              <span className="text-gray-400 dark:text-gray-500">·</span>
              <span className="text-gray-500 dark:text-gray-400">
                {formatDate(comment.created_at)}
              </span>
            </div>

            {/* Content */}
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="mt-2 flex items-center gap-2">
              <CommentLikeButton
                commentId={comment.id}
                currentUserId={currentUserId}
                initialLiked={comment.is_liked}
                initialCount={comment.likes_count}
              />
              {depth < maxDepth && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 hover:text-blue-500 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  返信
                </button>
              )}
            </div>

            {/* Reply form */}
            {showReplyForm && (
              <div className="mt-3">
                <CommentForm
                  postId={postId}
                  currentUserId={currentUserId}
                  parentCommentId={comment.id}
                  placeholder={`@${comment.user.user_id} への返信...`}
                  onSuccess={() => setShowReplyForm(false)}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
