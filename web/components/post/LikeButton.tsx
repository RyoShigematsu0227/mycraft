'use client'

import Link from 'next/link'
import { useLike } from '@/hooks/useLike'

interface LikeButtonProps {
  postId: string
  currentUserId?: string
  initialLiked?: boolean
  initialCount?: number
}

export default function LikeButton({
  postId,
  currentUserId,
  initialLiked = false,
  initialCount = 0,
}: LikeButtonProps) {
  const { isLiked, likeCount, isLoading, toggleLike } = useLike({
    postId,
    currentUserId,
    initialLiked,
    initialCount,
  })

  return (
    <div className="flex items-center">
      <button
        onClick={toggleLike}
        disabled={isLoading}
        className={`group/like flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all duration-200 ${
          isLiked
            ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20'
            : 'text-gray-500 hover:bg-rose-50 hover:text-rose-500 dark:text-gray-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${
            isLiked ? 'scale-110' : 'group-hover/like:scale-110'
          } ${isLiked ? 'animate-[heartbeat_0.3s_ease-in-out]' : ''}`}
          fill={isLiked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={isLiked ? 0 : 1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {likeCount > 0 && (
          <Link
            href={`/posts/${postId}/likes`}
            onClick={(e) => e.stopPropagation()}
            className={`font-medium tabular-nums hover:underline ${
              isLiked ? 'text-rose-500' : ''
            }`}
          >
            {likeCount}
          </Link>
        )}
      </button>
    </div>
  )
}
