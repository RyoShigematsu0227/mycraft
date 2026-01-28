'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { UserCard } from '@/components/user'
import { EmptyState, BackButton } from '@/components/ui'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface FollowTabsProps {
  userId: string
  initialTab: 'followers' | 'following'
}

async function fetchFollowData(userHandle: string, currentUserId?: string): Promise<{
  user: User | null
  followers: User[]
  following: User[]
  currentUserFollowingIds: Set<string>
}> {
  const supabase = createClient()

  // Get profile user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userHandle)
    .single()

  if (!user) {
    return { user: null, followers: [], following: [], currentUserFollowingIds: new Set() }
  }

  // Get followers and following in parallel
  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from('follows')
      .select('follower:users!follows_follower_id_fkey(*)')
      .eq('following_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('follows')
      .select('following:users!follows_following_id_fkey(*)')
      .eq('follower_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const followers = (followersResult.data?.map((f) => f.follower).filter(Boolean) || []) as User[]
  const following = (followingResult.data?.map((f) => f.following).filter(Boolean) || []) as User[]

  // Get which users the current user is following
  let currentUserFollowingIds = new Set<string>()
  if (currentUserId) {
    const allUserIds = [...followers, ...following].map((u) => u.id)
    if (allUserIds.length > 0) {
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', allUserIds)
      currentUserFollowingIds = new Set(followingData?.map((f) => f.following_id) || [])
    }
  }

  return { user, followers, following, currentUserFollowingIds }
}

export default function FollowTabs({ userId, initialTab }: FollowTabsProps) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab)
  const { user: authUser } = useAuth()

  const { data, isLoading } = useSWR(
    userId ? ['follow-data', userId, authUser?.id] : null,
    () => fetchFollowData(userId, authUser?.id)
  )

  const handleTabChange = (tab: 'followers' | 'following') => {
    setActiveTab(tab)
    // Update URL without page reload
    window.history.replaceState(null, '', `/users/${userId}/${tab}`)
  }

  // loading.tsx handles initial loading state
  if (isLoading) {
    return null
  }

  const user = data?.user
  const followers = data?.followers ?? []
  const following = data?.following ?? []
  const currentUserFollowingIds = data?.currentUserFollowingIds ?? new Set<string>()

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-muted">ユーザーが見つかりません</p>
      </div>
    )
  }

  const currentList = activeTab === 'followers' ? followers : following

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center gap-4 px-4 py-3">
          <BackButton />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {user.display_name || user.user_id}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{userId}</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => handleTabChange('followers')}
            className={`flex-1 cursor-pointer border-b-2 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'followers'
                ? 'border-primary font-bold text-foreground'
                : 'border-transparent text-muted hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            フォロワー
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`flex-1 cursor-pointer border-b-2 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'following'
                ? 'border-primary font-bold text-foreground'
                : 'border-transparent text-muted hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            フォロー中
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {currentList.length === 0 ? (
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
            title={activeTab === 'followers' ? 'まだフォロワーがいません' : 'まだ誰もフォローしていません'}
          />
        ) : (
          currentList.map((listUser) => (
            <div key={listUser.id} className="p-4">
              <UserCard
                user={listUser}
                currentUserId={authUser?.id}
                showBio={true}
                showFollowButton={true}
                isFollowing={currentUserFollowingIds.has(listUser.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
