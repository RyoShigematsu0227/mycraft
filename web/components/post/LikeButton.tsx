'use client'

import { useState } from 'react'
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
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = async () => {
    if (!isLiked) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 700)
    }
    await toggleLike()
  }

  return (
    <div className="pointer-events-auto flex items-center">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`group/like relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all duration-200 ${
          isLiked
            ? 'text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/20'
            : 'text-gray-500 hover:bg-rose-500/10 hover:text-rose-500 dark:text-gray-400 dark:hover:bg-rose-500/20 dark:hover:text-rose-400'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {/* Particle burst effect */}
        {isAnimating && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute h-1 w-1 animate-[particle_0.6s_ease-out_forwards] rounded-full bg-rose-500"
                style={{
                  '--particle-angle': `${i * 60}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}

        {/* Heart icon with enhanced animation */}
        <div className="relative">
          <svg
            className={`h-5 w-5 transition-all duration-300 ${
              isLiked ? 'scale-110' : 'group-hover/like:scale-110'
            } ${isAnimating ? 'animate-[heartPop_0.3s_ease-out]' : ''}`}
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
          {/* Glow effect when liked */}
          {isLiked && (
            <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-rose-500/30 blur-md" />
          )}
        </div>

        {likeCount > 0 && (
          <Link
            href={`/posts/${postId}/likes`}
            onClick={(e) => e.stopPropagation()}
            className={`font-medium tabular-nums transition-colors hover:underline ${
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
