'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { UserCard } from '@/components/user'
import { EmptyState, BackButton } from '@/components/ui'

interface EngagementUser {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
}

interface EngagementTabsProps {
  postId: string
  initialTab: 'likes' | 'reposts'
}

async function fetchEngagementData(
  postId: string,
  currentUserId?: string
): Promise<{
  likeUsers: EngagementUser[]
  repostUsers: EngagementUser[]
  followingIds: Set<string>
}> {
  const supabase = createClient()

  // Fetch likes and reposts in parallel
  const [likesResult, repostsResult] = await Promise.all([
    supabase
      .from('likes')
      .select(
        `
        user:users (
          id,
          user_id,
          display_name,
          avatar_url,
          bio
        )
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: false }),
    supabase
      .from('reposts')
      .select(
        `
        user:users (
          id,
          user_id,
          display_name,
          avatar_url,
          bio
        )
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: false }),
  ])

  const likeUsers =
    likesResult.data?.map((like) => like.user as EngagementUser).filter(Boolean) || []
  const repostUsers =
    repostsResult.data?.map((repost) => repost.user as EngagementUser).filter(Boolean) || []

  // Get which users the current user is following
  let followingIds = new Set<string>()
  if (currentUserId) {
    const allUserIds = [...likeUsers, ...repostUsers].map((u) => u.id)
    const uniqueUserIds = [...new Set(allUserIds)]
    if (uniqueUserIds.length > 0) {
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', uniqueUserIds)
      followingIds = new Set(followingData?.map((f) => f.following_id) || [])
    }
  }

  return { likeUsers, repostUsers, followingIds }
}

export default function EngagementTabs({ postId, initialTab }: EngagementTabsProps) {
  const [activeTab, setActiveTab] = useState<'likes' | 'reposts'>(initialTab)
  const { user: authUser } = useAuth()

  const { data, isLoading } = useSWR(postId ? ['postEngagement', postId, authUser?.id] : null, () =>
    fetchEngagementData(postId, authUser?.id)
  )

  const handleTabChange = (tab: 'likes' | 'reposts') => {
    setActiveTab(tab)
    // Update URL without page reload
    window.history.replaceState(null, '', `/posts/${postId}/${tab}`)
  }

  // loading.tsx handles initial loading state
  if (isLoading) {
    return null
  }

  const likeUsers = data?.likeUsers ?? []
  const repostUsers = data?.repostUsers ?? []
  const followingIds = data?.followingIds ?? new Set<string>()

  const currentList = activeTab === 'likes' ? likeUsers : repostUsers

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center gap-4 px-4 py-3">
          <BackButton />
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            投稿のエンゲージメント
          </h1>
        </div>
        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => handleTabChange('likes')}
            className={`flex-1 cursor-pointer border-b-2 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'likes'
                ? 'border-primary font-bold text-foreground'
                : 'border-transparent text-muted hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            いいね
            {likeUsers.length > 0 && <span className="ml-1 text-muted">({likeUsers.length})</span>}
          </button>
          <button
            onClick={() => handleTabChange('reposts')}
            className={`flex-1 cursor-pointer border-b-2 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === 'reposts'
                ? 'border-primary font-bold text-foreground'
                : 'border-transparent text-muted hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            リポスト
            {repostUsers.length > 0 && (
              <span className="ml-1 text-muted">({repostUsers.length})</span>
            )}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {currentList.length === 0 ? (
          <EmptyState
            icon={
              activeTab === 'likes' ? (
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              ) : (
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )
            }
            title={activeTab === 'likes' ? 'まだいいねがありません' : 'まだリポストがありません'}
          />
        ) : (
          currentList.map((engagementUser) => (
            <div key={engagementUser.id} className="p-4">
              <UserCard
                user={{
                  id: engagementUser.id,
                  user_id: engagementUser.user_id,
                  display_name: engagementUser.display_name,
                  avatar_url: engagementUser.avatar_url,
                  bio: engagementUser.bio,
                  minecraft_java_username: null,
                  minecraft_bedrock_gamertag: null,
                  created_at: '',
                  updated_at: '',
                }}
                currentUserId={authUser?.id}
                showBio={true}
                showFollowButton={true}
                isFollowing={followingIds.has(engagementUser.id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
