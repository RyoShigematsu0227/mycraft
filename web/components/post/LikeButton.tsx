'use client'

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
    currentUserId: currentUserId || '',
    initialLiked,
    initialCount,
  })

  return (
    <button
      onClick={toggleLike}
      disabled={!currentUserId || isLoading}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
        isLiked
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
          : 'text-gray-500 hover:bg-gray-100 hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-800'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <svg
        className="h-5 w-5"
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
      {likeCount > 0 && <span>{likeCount}</span>}
    </button>
  )
}
