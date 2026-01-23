'use client'

import { useState } from 'react'
import useCommentLike from '@/hooks/useCommentLike'

interface CommentLikeButtonProps {
  commentId: string
  currentUserId?: string
  initialLiked?: boolean
  initialCount?: number
}

export default function CommentLikeButton({
  commentId,
  currentUserId,
  initialLiked = false,
  initialCount = 0,
}: CommentLikeButtonProps) {
  const { isLiked, likeCount, toggleLike, loading } = useCommentLike({
    commentId,
    currentUserId,
    initialLiked,
    initialCount,
  })
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = async () => {
    if (!isLiked) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 400)
    }
    await toggleLike()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`group/like relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
        isLiked
          ? 'text-rose-500 hover:bg-rose-500/10'
          : 'text-muted hover:bg-rose-500/10 hover:text-rose-500'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <div className="relative">
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isAnimating ? 'animate-[heartPop_0.3s_ease-out]' : ''
          } ${isLiked ? 'scale-110' : 'group-hover/like:scale-110'}`}
          fill={isLiked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isLiked ? 0 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {isLiked && (
          <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-rose-500/20 blur-sm" />
        )}
      </div>
      {likeCount > 0 && (
        <span className="tabular-nums">{likeCount}</span>
      )}
    </button>
  )
}
