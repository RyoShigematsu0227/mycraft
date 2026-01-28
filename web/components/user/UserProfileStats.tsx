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

  // Initialize/update store with server values, respecting dirty flags
  useEffect(() => {
    const existing = useUserStatsStore.getState().stats[userId]
    if (!existing) {
      initUser(userId, {
        followersCount: initialStats.followersCount,
        followingCount: initialStats.followingCount,
        postsCount: initialStats.postsCount,
        isFollowing,
      })
    } else {
      // Only update values that aren't dirty (haven't been modified by user)
      const updates: Partial<typeof existing> = { postsCount: initialStats.postsCount }
      if (!existing.followersDirty && existing.followersCount !== initialStats.followersCount) {
        updates.followersCount = initialStats.followersCount
      }
      if (!existing.followingDirty && existing.followingCount !== initialStats.followingCount) {
        updates.followingCount = initialStats.followingCount
      }
      if (!existing.followersDirty && existing.isFollowing !== isFollowing) {
        updates.isFollowing = isFollowing
      }
      initUser(userId, { ...existing, ...updates })
    }
  }, [userId, initialStats, isFollowing, initUser])

  const followersCount = stats?.followersCount ?? initialStats.followersCount
  const followingCount = stats?.followingCount ?? initialStats.followingCount
  const postsCount = stats?.postsCount ?? initialStats.postsCount

  const statItems = [
    {
      href: `/users/${userIdSlug}/following`,
      value: followingCount,
      label: 'フォロー中',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      ),
    },
    {
      href: `/users/${userIdSlug}/followers`,
      value: followersCount,
      label: 'フォロワー',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      value: postsCount,
      label: '投稿',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="mt-4 flex gap-1">
      {statItems.map((item, index) => {
        const content = (
          <div className="group/stat flex flex-col items-center rounded-xl px-4 py-2 transition-colors hover:bg-surface-hover">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-foreground tabular-nums">
                {item.value.toLocaleString()}
              </span>
            </div>
            <span className="text-xs text-muted group-hover/stat:text-foreground transition-colors">
              {item.label}
            </span>
          </div>
        )

        if (item.href) {
          return (
            <Link key={index} href={item.href}>
              {content}
            </Link>
          )
        }

        return <div key={index}>{content}</div>
      })}
    </div>
  )
}
