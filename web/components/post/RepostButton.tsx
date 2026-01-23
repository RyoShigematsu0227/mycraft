'use client'

import Link from 'next/link'
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
    <div className="flex items-center">
      <button
        onClick={toggleRepost}
        disabled={isLoading}
        className={`group/repost flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all duration-200 ${
          isReposted
            ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-500 dark:text-gray-400 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${
            isReposted ? 'rotate-180' : 'group-hover/repost:rotate-180'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {repostCount > 0 && (
          <Link
            href={`/posts/${postId}/reposts`}
            onClick={(e) => e.stopPropagation()}
            className={`font-medium tabular-nums hover:underline ${
              isReposted ? 'text-emerald-500' : ''
            }`}
          >
            {repostCount}
          </Link>
        )}
      </button>
    </div>
  )
}
