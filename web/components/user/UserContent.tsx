'use client'

import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { UserAvatar, FollowButton, UserProfileStats, UserProfileHeader } from '@/components/user'
import { InfiniteFeed } from '@/components/post'
import { Button } from '@/components/ui'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface OwnedWorld {
  id: string
  name: string
  icon_url: string | null
  description: string | null
}

interface UserContentProps {
  user: User
  stats: {
    postsCount: number
    followersCount: number
    followingCount: number
  }
}

async function fetchUserEngagement(
  targetUserId: string,
  currentUserId: string
): Promise<{ isFollowing: boolean; ownedWorlds: OwnedWorld[] }> {
  const supabase = createClient()

  const [followResult, worldsResult] = await Promise.all([
    supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .single(),
    supabase
      .from('worlds')
      .select('id, name, icon_url, description')
      .eq('owner_id', targetUserId)
      .order('created_at', { ascending: false }),
  ])

  return {
    isFollowing: !!followResult.data,
    ownedWorlds: (worldsResult.data || []) as OwnedWorld[],
  }
}

async function fetchOwnedWorlds(userId: string): Promise<OwnedWorld[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('worlds')
    .select('id, name, icon_url, description')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  return (data || []) as OwnedWorld[]
}

export default function UserContent({ user, stats }: UserContentProps) {
  const { user: authUser } = useAuth()

  // Fetch engagement data (isFollowing) and owned worlds
  const { data: engagement } = useSWR(
    authUser ? ['user-engagement', user.id, authUser.id] : null,
    () => fetchUserEngagement(user.id, authUser!.id),
    { revalidateOnFocus: false }
  )

  // Fetch owned worlds for non-authenticated users
  const { data: publicOwnedWorlds } = useSWR(
    !authUser ? ['owned-worlds', user.id] : null,
    () => fetchOwnedWorlds(user.id),
    { revalidateOnFocus: false }
  )

  const isFollowing = engagement?.isFollowing ?? false
  const ownedWorlds = engagement?.ownedWorlds ?? publicOwnedWorlds ?? []
  const isOwnProfile = authUser?.id === user.id

  return (
    <>
      <UserProfileHeader
        userId={user.id}
        userIdSlug={user.user_id}
        avatarUrl={user.avatar_url}
        displayName={user.display_name}
        isOwnProfile={isOwnProfile}
        currentUserId={authUser?.id}
        isFollowing={isFollowing}
      >
        <div className="relative overflow-hidden border-b border-border bg-surface">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-accent/20 to-accent-secondary/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-gradient-to-tr from-accent-secondary/20 to-accent/20 blur-3xl" />
          </div>

          <div className="relative px-4 py-6">
            {/* Top row with avatar and action button */}
            <div className="flex items-start justify-between">
              <div className="relative">
                {/* Avatar glow */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-accent/40 to-accent-secondary/40 blur-xl opacity-50" />
                <div className="relative">
                  <UserAvatar
                    userId={user.user_id}
                    avatarUrl={user.avatar_url}
                    displayName={user.display_name}
                    size="2xl"
                    showLink={false}
                  />
                </div>
              </div>

              {/* Action button */}
              <div className="pt-2">
                {isOwnProfile ? (
                  <Link href="/settings/profile">
                    <Button variant="outline" size="sm">
                      <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      編集
                    </Button>
                  </Link>
                ) : authUser ? (
                  <FollowButton
                    targetUserId={user.id}
                    currentUserId={authUser.id}
                    initialFollowing={isFollowing}
                  />
                ) : null}
              </div>
            </div>

            {/* User info */}
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-foreground">
                {user.display_name}
              </h1>
              <p className="text-muted">@{user.user_id}</p>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="mt-4 whitespace-pre-wrap leading-relaxed text-foreground">
                {user.bio}
              </p>
            )}

            {/* Stats */}
            <UserProfileStats
              userId={user.id}
              userIdSlug={user.user_id}
              initialStats={stats}
              isFollowing={isFollowing}
            />

            {/* Minecraft info */}
            {(user.minecraft_java_username || user.minecraft_bedrock_gamertag) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {user.minecraft_java_username && (
                  <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 ring-1 ring-emerald-500/20">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">J</span>
                    </div>
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {user.minecraft_java_username}
                    </span>
                  </div>
                )}
                {user.minecraft_bedrock_gamertag && (
                  <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 ring-1 ring-accent/20">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-accent/20">
                      <span className="text-xs font-bold text-accent">B</span>
                    </div>
                    <span className="text-sm font-medium text-accent">
                      {user.minecraft_bedrock_gamertag}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Owned Worlds */}
            {ownedWorlds.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <svg className="h-3.5 w-3.5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
                    </svg>
                    オーナー
                  </span>
                  {ownedWorlds.map((world) => (
                    <Link
                      key={world.id}
                      href={`/worlds/${world.id}`}
                      className="group flex items-center gap-1.5 rounded-full bg-accent/10 py-1 pl-1 pr-2.5 ring-1 ring-accent/20 transition-all hover:bg-accent/20 hover:ring-accent/40"
                    >
                      <Image
                        src={world.icon_url || '/defaults/default-world-icon.png'}
                        alt={world.name}
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover"
                        unoptimized={world.icon_url?.startsWith('http') ?? false}
                      />
                      <span className="text-sm font-medium text-accent">
                        {world.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </UserProfileHeader>

      {/* Posts Section */}
      <InfiniteFeed
        type="latest"
        currentUserId={authUser?.id}
        profileUserId={user.id}
        showWorldInfo={true}
      />
    </>
  )
}
