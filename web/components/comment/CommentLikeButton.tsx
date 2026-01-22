'use client'

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

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs transition ${
        isLiked
          ? 'text-pink-500'
          : 'text-gray-500 hover:bg-gray-100 hover:text-pink-500 dark:text-gray-400 dark:hover:bg-gray-800'
      }`}
    >
      <svg
        className="h-4 w-4"
        fill={isLiked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
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
