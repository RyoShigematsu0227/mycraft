'use client'

import Link from 'next/link'
import { UserAvatar } from '@/components/user'
import { WorldIcon } from '@/components/world'
import PostImages from './PostImages'
import LikeButton from './LikeButton'
import RepostButton from './RepostButton'
import type { Database } from '@/types/database'

type Post = Database['public']['Tables']['posts']['Row']
type User = Database['public']['Tables']['users']['Row']
type World = Database['public']['Tables']['worlds']['Row']
type PostImage = Database['public']['Tables']['post_images']['Row']

interface PostCardProps {
  post: Post & {
    user: User
    world: World | null
    images: PostImage[]
  }
  currentUserId?: string
  likeCount?: number
  repostCount?: number
  commentCount?: number
  isLiked?: boolean
  isReposted?: boolean
  showWorldInfo?: boolean
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '今'
  if (minutes < 60) return `${minutes}分前`
  if (hours < 24) return `${hours}時間前`
  if (days < 7) return `${days}日前`

  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export default function PostCard({
  post,
  currentUserId,
  likeCount = 0,
  repostCount = 0,
  commentCount = 0,
  isLiked = false,
  isReposted = false,
  showWorldInfo = true,
}: PostCardProps) {
  return (
    <article className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex gap-3">
        <UserAvatar
          userId={post.user.user_id}
          avatarUrl={post.user.avatar_url}
          displayName={post.user.display_name}
          size="md"
        />
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/users/${post.user.user_id}`}
              className="truncate font-bold text-gray-900 hover:underline dark:text-gray-100"
            >
              {post.user.display_name}
            </Link>
            <Link
              href={`/users/${post.user.user_id}`}
              className="truncate text-gray-500 dark:text-gray-400"
            >
              @{post.user.user_id}
            </Link>
            <span className="text-gray-400 dark:text-gray-500">·</span>
            <Link
              href={`/posts/${post.id}`}
              className="text-gray-500 hover:underline dark:text-gray-400"
            >
              {formatDate(post.created_at)}
            </Link>
          </div>

          {/* World info */}
          {showWorldInfo && post.world && (
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <WorldIcon
                worldId={post.world.id}
                iconUrl={post.world.icon_url}
                name={post.world.name}
                size="sm"
              />
              <Link
                href={`/worlds/${post.world.id}`}
                className="hover:underline"
              >
                {post.world.name}
              </Link>
              {post.visibility === 'world_only' && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
                  ワールド限定
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <Link href={`/posts/${post.id}`} className="block">
            <p className="mt-2 whitespace-pre-wrap text-gray-900 dark:text-gray-100">
              {post.content}
            </p>
          </Link>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <PostImages images={post.images} />
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/posts/${post.id}`}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-blue-500 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {commentCount > 0 && <span>{commentCount}</span>}
            </Link>
            <RepostButton
              postId={post.id}
              currentUserId={currentUserId}
              initialReposted={isReposted}
              initialCount={repostCount}
            />
            <LikeButton
              postId={post.id}
              currentUserId={currentUserId}
              initialLiked={isLiked}
              initialCount={likeCount}
            />
          </div>
        </div>
      </div>
    </article>
  )
}
