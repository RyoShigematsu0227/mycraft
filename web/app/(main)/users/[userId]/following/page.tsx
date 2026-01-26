'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { UserCard } from '@/components/user'
import { EmptyState } from '@/components/ui'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

async function fetchFollowing(userHandle: string): Promise<{ user: User | null; following: User[] }> {
  const supabase = createClient()

  // Get profile user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userHandle)
    .single()

  if (!user) {
    return { user: null, following: [] }
  }

  // Get following
  const { data: following } = await supabase
    .from('follows')
    .select('following:users!follows_following_id_fkey(*)')
    .eq('follower_id', user.id)
    .order('created_at', { ascending: false })

  const followingUsers = (following?.map((f) => f.following).filter(Boolean) || []) as User[]

  return { user, following: followingUsers }
}

export default function FollowingPage() {
  const params = useParams()
  const userId = params.userId as string
  const { user: authUser } = useAuth()

  const { data, isLoading } = useSWR(
    userId ? ['following', userId] : null,
    () => fetchFollowing(userId)
  )

  const user = data?.user
  const following = data?.following ?? []

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 animate-pulse rounded-full bg-surface-hover" />
            <div className="space-y-1">
              <div className="h-5 w-24 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-16 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
              <div className="h-12 w-12 rounded-full bg-surface-hover" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-surface-hover" />
                <div className="h-3 w-16 rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-muted">ユーザーが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link
            href={`/users/${userId}`}
            className="rounded-full p-2 hover:bg-surface dark:hover:bg-surface"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{user.display_name || user.user_id}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{userId}</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex">
          <Link
            href={`/users/${userId}/followers`}
            className="flex-1 border-b-2 border-transparent py-3 text-center text-sm font-medium text-muted hover:bg-surface-hover hover:text-foreground"
          >
            フォロワー
          </Link>
          <Link
            href={`/users/${userId}/following`}
            className="flex-1 border-b-2 border-primary py-3 text-center text-sm font-bold text-foreground"
          >
            フォロー中
          </Link>
        </div>
      </div>

      {/* Following List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {following.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            title="まだ誰もフォローしていません"
          />
        ) : (
          following.map((followingUser) => (
            <div key={followingUser.id} className="p-4">
              <UserCard
                user={followingUser}
                currentUserId={authUser?.id}
                showBio={true}
                showFollowButton={true}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
