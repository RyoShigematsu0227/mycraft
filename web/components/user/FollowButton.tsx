'use client'

import { useState } from 'react'
import { useFollow } from '@/hooks/useFollow'

interface FollowButtonProps {
  targetUserId: string
  currentUserId?: string
  initialFollowing?: boolean
  size?: 'sm' | 'md'
}

export default function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing,
  size = 'sm',
}: FollowButtonProps) {
  const { isFollowing, isLoading, toggleFollow } = useFollow({
    targetUserId,
    currentUserId,
    initialFollowing,
  })
  const [isHovering, setIsHovering] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  if (currentUserId && targetUserId === currentUserId) {
    return null
  }

  const handleClick = async () => {
    if (!isFollowing) {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 600)
    }
    await toggleFollow()
  }

  const sizeClasses = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-5 py-2 text-base',
  }

  // Show unfollow on hover when already following
  const buttonText = isLoading
    ? '...'
    : isFollowing
      ? isHovering
        ? 'フォロー解除'
        : 'フォロー中'
      : 'フォローする'

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      disabled={isLoading}
      className={`relative cursor-pointer overflow-hidden rounded-full font-semibold transition-all duration-300 ${sizeClasses[size]} ${
        isFollowing
          ? isHovering
            ? 'border-2 border-red-500/50 bg-red-500/10 text-red-500 hover:border-red-500'
            : 'border-2 border-border bg-surface text-foreground hover:bg-surface-hover'
          : 'bg-gradient-to-r from-accent to-accent-secondary text-white shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {/* Shimmer effect on follow */}
      {isAnimating && (
        <div className="absolute inset-0 animate-[shimmer_0.6s_ease-out] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}

      {/* Icon + Text */}
      <span className="relative flex items-center justify-center gap-1.5">
        {isFollowing ? (
          isHovering ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        )}
        {buttonText}
      </span>
    </button>
  )
}
