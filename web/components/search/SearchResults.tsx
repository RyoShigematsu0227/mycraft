'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserAvatar, UserCard } from '@/components/user'
import { WorldCard } from '@/components/world'
import { PostCard } from '@/components/post'
import { Loading, EmptyState } from '@/components/ui'
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
  likes_count: number
  comments_count: number
  reposts_count: number
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
    return <Loading />
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
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-center text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      <div>
        {activeTab === 'users' && (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                ユーザーが見つかりませんでした
              </div>
            ) : (
              users.map((user) => (
                <Link
                  key={user.id}
                  href={`/users/${user.user_id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <UserAvatar
                    userId={user.user_id}
                    avatarUrl={user.avatar_url}
                    displayName={user.display_name}
                    size="md"
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
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {worlds.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                ワールドが見つかりませんでした
              </div>
            ) : (
              worlds.map((world) => (
                <Link
                  key={world.id}
                  href={`/worlds/${world.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                    {world.icon_url ? (
                      <img
                        src={world.icon_url}
                        alt={world.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg
                          className="h-6 w-6 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
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
                      world: post.world_name && post.world_id
                        ? {
                            id: post.world_id,
                            name: post.world_name,
                            icon_url: null,
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
