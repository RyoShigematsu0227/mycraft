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
  isFollowing?: boolean
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
  isFollowing = false,
  stats,
}: UserCardProps) {
  const isOwnProfile = currentUserId === user.id

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-surface transition-all duration-300 hover:shadow-lg">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-accent/20" />
        <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-accent-secondary/10 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:bg-accent-secondary/20" />
      </div>

      {/* Border */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-border transition-all duration-300 group-hover:ring-accent/30" />

      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-start gap-4">
          <UserAvatar
            userId={user.user_id}
            avatarUrl={user.avatar_url}
            displayName={user.display_name}
            size="lg"
            showGlow
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/users/${user.user_id}`}
                  className="group/name block"
                >
                  <span className="block truncate text-base font-bold text-foreground transition-colors group-hover/name:text-accent">
                    {user.display_name}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    @{user.user_id}
                  </span>
                </Link>
              </div>
              {showFollowButton && !isOwnProfile && currentUserId && (
                <FollowButton
                  targetUserId={user.id}
                  currentUserId={currentUserId}
                  initialFollowing={isFollowing}
                />
              )}
            </div>

            {showBio && user.bio && (
              <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                {user.bio}
              </p>
            )}

            {stats && (
              <div className="mt-3 flex gap-4 text-sm">
                <Link
                  href={`/users/${user.user_id}/following`}
                  className="group/stat flex items-center gap-1 text-muted transition-colors hover:text-foreground"
                >
                  <span className="font-bold text-foreground tabular-nums">
                    {stats.followingCount.toLocaleString()}
                  </span>
                  <span className="text-xs">フォロー中</span>
                </Link>
                <Link
                  href={`/users/${user.user_id}/followers`}
                  className="group/stat flex items-center gap-1 text-muted transition-colors hover:text-foreground"
                >
                  <span className="font-bold text-foreground tabular-nums">
                    {stats.followersCount.toLocaleString()}
                  </span>
                  <span className="text-xs">フォロワー</span>
                </Link>
                <div className="flex items-center gap-1 text-muted">
                  <span className="font-bold text-foreground tabular-nums">
                    {stats.postsCount.toLocaleString()}
                  </span>
                  <span className="text-xs">投稿</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
