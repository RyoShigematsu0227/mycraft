'use client'

import Link from 'next/link'
import UserAvatar from './UserAvatar'
import FollowButton from './FollowButton'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface UserCardProps {
  user: User
  currentUserId?: string
  showBio?: boolean
  showFollowButton?: boolean
  stats?: {
    followersCount: number
    followingCount: number
    postsCount: number
  }
}

export default function UserCard({
  user,
  currentUserId,
  showBio = true,
  showFollowButton = true,
  stats,
}: UserCardProps) {
  const isOwnProfile = currentUserId === user.id

  return (
    <div className="flex items-start gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <UserAvatar
        userId={user.user_id}
        avatarUrl={user.avatar_url}
        displayName={user.display_name}
        size="lg"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/@${user.user_id}`}
              className="block truncate text-base font-bold text-gray-900 hover:underline dark:text-gray-100"
            >
              {user.display_name}
            </Link>
            <Link
              href={`/@${user.user_id}`}
              className="block truncate text-sm text-gray-500 dark:text-gray-400"
            >
              @{user.user_id}
            </Link>
          </div>
          {showFollowButton && !isOwnProfile && currentUserId && (
            <FollowButton targetUserId={user.id} currentUserId={currentUserId} />
          )}
        </div>
        {showBio && user.bio && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {user.bio}
          </p>
        )}
        {stats && (
          <div className="mt-2 flex gap-4 text-sm">
            <Link
              href={`/@${user.user_id}/following`}
              className="text-gray-600 hover:underline dark:text-gray-400"
            >
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {stats.followingCount}
              </span>{' '}
              フォロー中
            </Link>
            <Link
              href={`/@${user.user_id}/followers`}
              className="text-gray-600 hover:underline dark:text-gray-400"
            >
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {stats.followersCount}
              </span>{' '}
              フォロワー
            </Link>
            <span className="text-gray-600 dark:text-gray-400">
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {stats.postsCount}
              </span>{' '}
              投稿
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
