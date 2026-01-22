'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useUserStatsStore } from '@/lib/stores'

interface UserProfileStatsProps {
  userId: string
  userIdSlug: string
  initialStats: {
    followersCount: number
    followingCount: number
    postsCount: number
  }
  isFollowing?: boolean
}

export default function UserProfileStats({
  userId,
  userIdSlug,
  initialStats,
  isFollowing = false,
}: UserProfileStatsProps) {
  const stats = useUserStatsStore((state) => state.stats[userId])
  const initUser = useUserStatsStore((state) => state.initUser)

  // Initialize store with server-rendered values
  useEffect(() => {
    initUser(userId, {
      followersCount: initialStats.followersCount,
      followingCount: initialStats.followingCount,
      postsCount: initialStats.postsCount,
      isFollowing,
    })
  }, [userId, initialStats, isFollowing, initUser])

  // Use store values if available, fallback to initial values
  const followersCount = stats?.followersCount ?? initialStats.followersCount
  const followingCount = stats?.followingCount ?? initialStats.followingCount

  return (
    <div className="mt-3 flex gap-4 text-sm">
      <Link
        href={`/users/${userIdSlug}/following`}
        className="text-gray-600 hover:underline dark:text-gray-400"
      >
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {followingCount}
        </span>{' '}
        フォロー中
      </Link>
      <Link
        href={`/users/${userIdSlug}/followers`}
        className="text-gray-600 hover:underline dark:text-gray-400"
      >
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {followersCount}
        </span>{' '}
        フォロワー
      </Link>
    </div>
  )
}
