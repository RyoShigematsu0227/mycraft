'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserAvatar } from '@/components/user'
import { WorldIcon } from '@/components/world'
import { PostCard } from '@/components/post'
import { EmptyState } from '@/components/ui'
import type { SearchTab } from '@/hooks/useSearch'

interface SearchUser {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  followers_count: number
  following_count: number
}

interface SearchWorld {
  id: string
  name: string
  description: string | null
  icon_url: string | null
  owner_id: string
  owner_display_name: string
  owner_user_id: string
  members_count: number
}

interface SearchPost {
  id: string
  user_id: string
  world_id: string | null
  content: string
  visibility: string
  created_at: string
  user_display_name: string
  user_user_id: string
  user_avatar_url: string | null
  world_name: string | null
  world_icon_url: string | null
  likes_count: number
  comments_count: number
  reposts_count: number
  is_liked: boolean
  is_reposted: boolean
  images: Array<{ id: string; image_url: string; display_order: number }> | null
}

interface SearchResultsProps {
  users: SearchUser[]
  worlds: SearchWorld[]
  posts: SearchPost[]
  loading: boolean
  hasSearched: boolean
  currentUserId?: string
}

export default function SearchResults({
  users,
  worlds,
  posts,
  loading,
  hasSearched,
  currentUserId,
}: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<SearchTab>('users')

  if (loading) {
    return (
      <div>
        {/* Tabs Skeleton */}
        <div className="flex border-b border-border">
          {['ユーザー', 'ワールド', '投稿'].map((label) => (
            <div
              key={label}
              className="flex-1 px-4 py-3 text-center text-sm font-medium text-muted"
            >
              {label}
            </div>
          ))}
        </div>
        {/* Results Skeleton */}
        <div className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-surface-hover" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
                <div className="h-3 w-20 animate-pulse rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!hasSearched) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        検索キーワードを入力してください
      </div>
    )
  }

  const tabs: { id: SearchTab; label: string; count: number }[] = [
    { id: 'users', label: 'ユーザー', count: users.length },
    { id: 'worlds', label: 'ワールド', count: worlds.length },
    { id: 'posts', label: '投稿', count: posts.length },
  ]

  const totalResults = users.length + worlds.length + posts.length

  if (totalResults === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        title="検索結果がありません"
        description="別のキーワードで検索してみてください"
      />
    )
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-border dark:border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-center text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted hover:bg-surface hover:text-foreground dark:text-muted dark:hover:bg-surface dark:hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 rounded-full bg-surface px-2 py-0.5 text-xs dark:bg-surface">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      <div>
        {activeTab === 'users' && (
          <div className="divide-y divide-border dark:divide-border">
            {users.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                ユーザーが見つかりませんでした
              </div>
            ) : (
              users.map((user) => (
                <Link
                  key={user.id}
                  href={`/users/${user.user_id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface dark:hover:bg-surface"
                >
                  <UserAvatar
                    userId={user.user_id}
                    avatarUrl={user.avatar_url}
                    displayName={user.display_name}
                    size="md"
                    showLink={false}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                      {user.display_name}
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      @{user.user_id}
                    </p>
                    {user.bio && (
                      <p className="mt-1 line-clamp-1 text-sm text-gray-600 dark:text-gray-300">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.followers_count} フォロワー
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'worlds' && (
          <div className="divide-y divide-border dark:divide-border">
            {worlds.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                ワールドが見つかりませんでした
              </div>
            ) : (
              worlds.map((world) => (
                <Link
                  key={world.id}
                  href={`/worlds/${world.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface dark:hover:bg-surface"
                >
                  <WorldIcon
                    worldId={world.id}
                    iconUrl={world.icon_url}
                    name={world.name}
                    size="md"
                    showLink={false}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                      {world.name}
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      @{world.owner_user_id}
                    </p>
                    {world.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-gray-600 dark:text-gray-300">
                        {world.description}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {world.members_count} メンバー
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div>
            {posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                投稿が見つかりませんでした
              </div>
            ) : (
              posts.map((post) => {
                const images = (post.images || []).map((img) => ({
                  id: img.id,
                  post_id: post.id,
                  image_url: img.image_url,
                  display_order: img.display_order,
                }))

                return (
                  <PostCard
                    key={post.id}
                    post={{
                      id: post.id,
                      user_id: post.user_id,
                      world_id: post.world_id,
                      content: post.content,
                      visibility: post.visibility as 'public' | 'world_only',
                      created_at: post.created_at,
                      user: {
                        id: post.user_id,
                        user_id: post.user_user_id,
                        display_name: post.user_display_name,
                        avatar_url: post.user_avatar_url,
                        bio: null,
                        minecraft_java_username: null,
                        minecraft_bedrock_gamertag: null,
                        created_at: '',
                        updated_at: '',
                      },
                      world:
                        post.world_name && post.world_id
                          ? {
                              id: post.world_id,
                              name: post.world_name,
                              icon_url: post.world_icon_url,
                              description: null,
                              how_to_join: null,
                              owner_id: '',
                              created_at: '',
                              updated_at: '',
                            }
                          : null,
                      images,
                    }}
                    currentUserId={currentUserId}
                    likeCount={post.likes_count}
                    repostCount={post.reposts_count}
                    commentCount={post.comments_count}
                    isLiked={post.is_liked}
                    isReposted={post.is_reposted}
                  />
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
