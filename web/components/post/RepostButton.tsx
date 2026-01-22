'use client'

import { useRepost } from '@/hooks/useRepost'

interface RepostButtonProps {
  postId: string
  currentUserId?: string
  initialReposted?: boolean
  initialCount?: number
}

export default function RepostButton({
  postId,
  currentUserId,
  initialReposted = false,
  initialCount = 0,
}: RepostButtonProps) {
  const { isReposted, repostCount, isLoading, toggleRepost } = useRepost({
    postId,
    currentUserId,
    initialReposted,
    initialCount,
  })

  return (
    <button
      onClick={toggleRepost}
      disabled={isLoading}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
        isReposted
          ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
          : 'text-gray-500 hover:bg-gray-100 hover:text-green-500 dark:text-gray-400 dark:hover:bg-gray-800'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {repostCount > 0 && <span>{repostCount}</span>}
    </button>
  )
}
