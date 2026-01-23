'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/user'
import { WorldIcon } from '@/components/world'
import PostImages from './PostImages'
import LikeButton from './LikeButton'
import RepostButton from './RepostButton'
import { usePostStatsStore } from '@/lib/stores'
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
  repostedBy?: {
    userId: string
    displayName: string
  } | null
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
  repostedBy = null,
}: PostCardProps) {
  const router = useRouter()
  const stats = usePostStatsStore((state) => state.stats[post.id])
  const initPost = usePostStatsStore((state) => state.initPost)

  // Initialize store with all counts (merges with existing)
  useEffect(() => {
    initPost(post.id, {
      likeCount,
      repostCount,
      commentCount,
      isLiked,
      isReposted,
    })
  }, [post.id, likeCount, repostCount, commentCount, isLiked, isReposted, initPost])

  // Use store values if available, fallback to props
  const displayCommentCount = stats?.commentCount ?? commentCount

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) {
      return
    }
    router.push(`/posts/${post.id}`)
  }

  return (
    <article
      onClick={handleCardClick}
      className="group relative cursor-pointer border-b border-border bg-surface px-4 py-4 transition-colors duration-200 hover:bg-surface-hover dark:border-border dark:bg-surface dark:hover:bg-surface-hover"
    >
      {/* Subtle left accent on hover */}
      <div className="absolute left-0 top-0 h-full w-1 scale-y-0 bg-gradient-to-b from-amber-500 to-orange-600 transition-transform duration-200 group-hover:scale-y-100" />

      {/* Repost indicator */}
      {repostedBy && (
        <div className="mb-3 flex items-center gap-2 pl-12 text-sm text-gray-500 dark:text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <Link href={`/users/${repostedBy.userId}`} className="font-medium hover:text-orange-600 hover:underline dark:hover:text-orange-400">
            {repostedBy.displayName}がリポスト
          </Link>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="rounded-full ring-2 ring-transparent transition-all duration-200 group-hover:ring-orange-100 dark:group-hover:ring-orange-900/50">
            <UserAvatar
              userId={post.user.user_id}
              avatarUrl={post.user.avatar_url}
              displayName={post.user.display_name}
              size="md"
            />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm">
            <Link
              href={`/users/${post.user.user_id}`}
              className="truncate font-bold text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
            >
              {post.user.display_name}
            </Link>
            <Link
              href={`/users/${post.user.user_id}`}
              className="truncate text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              @{post.user.user_id}
            </Link>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="whitespace-nowrap text-gray-500 dark:text-gray-400">
              {formatDate(post.created_at)}
            </span>
          </div>

          {/* World info */}
          {showWorldInfo && post.world && (
            <div className="mt-1.5 flex items-center gap-2">
              <Link
                href={`/worlds/${post.world.id}`}
                className="flex items-center gap-2 rounded-full bg-surface px-2.5 py-1 text-sm transition-colors hover:bg-surface-hover dark:bg-surface dark:hover:bg-surface-hover"
              >
                <WorldIcon
                  worldId={post.world.id}
                  iconUrl={post.world.icon_url}
                  name={post.world.name}
                  size="sm"
                  showLink={false}
                />
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {post.world.name}
                </span>
              </Link>
              {post.visibility === 'world_only' && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  ワールド限定
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <p className="mt-2.5 whitespace-pre-wrap leading-relaxed text-gray-800 dark:text-gray-200">
            {post.content}
          </p>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="mt-3">
              <PostImages images={post.images} />
            </div>
          )}

          {/* Actions */}
          <div className="-ml-2 mt-3 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/posts/${post.id}`)
              }}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-gray-500 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-400"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {displayCommentCount > 0 && <span className="font-medium">{displayCommentCount}</span>}
            </button>
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
