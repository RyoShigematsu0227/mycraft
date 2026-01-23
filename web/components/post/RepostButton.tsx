'use client'

import { useState } from 'react'
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
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = async () => {
    if (!isReposted) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }
    await toggleRepost()
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`group/repost relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all duration-200 ${
          isReposted
            ? 'text-emerald-500 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20'
            : 'text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-500 dark:text-gray-400 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-400'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {/* Ripple effect */}
        {isAnimating && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="absolute h-8 w-8 animate-[ripple_0.6s_ease-out_forwards] rounded-full border-2 border-emerald-500" />
          </div>
        )}

        {/* Repost icon with enhanced animation */}
        <div className="relative">
          <svg
            className={`h-5 w-5 transition-all duration-300 ${
              isAnimating ? 'animate-[spin_0.5s_ease-out]' : ''
            } ${isReposted ? 'scale-110' : 'group-hover/repost:scale-110'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={isReposted ? 2 : 1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {/* Glow effect when reposted */}
          {isReposted && (
            <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-emerald-500/30 blur-md" />
          )}
        </div>

        {repostCount > 0 && (
          <Link
            href={`/posts/${postId}/reposts`}
            onClick={(e) => e.stopPropagation()}
            className={`font-medium tabular-nums transition-colors hover:underline ${
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
