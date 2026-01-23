'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import PostImages from './PostImages'
import LikeButton from './LikeButton'
import RepostButton from './RepostButton'
import { ConfirmDialog } from '@/components/ui'
import { deletePost } from '@/actions'
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
  interactive?: boolean
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
  if (minutes < 60) return `${minutes}分`
  if (hours < 24) return `${hours}時間`
  if (days < 7) return `${days}日`

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
  interactive = true,
}: PostCardProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const stats = usePostStatsStore((state) => state.stats[post.id])
  const initPost = usePostStatsStore((state) => state.initPost)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isOwner = currentUserId === post.user_id

  useEffect(() => {
    initPost(post.id, {
      likeCount,
      repostCount,
      commentCount,
      isLiked,
      isReposted,
    })
  }, [post.id, likeCount, repostCount, commentCount, isLiked, isReposted, initPost])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const displayCommentCount = stats?.commentCount ?? commentCount

  const handleCardClick = (e: React.MouseEvent) => {
    if (!interactive) return
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) {
      return
    }
    router.push(`/posts/${post.id}`)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deletePost(post.id, currentUserId)
      setShowDeleteConfirm(false)
      // フィードのキャッシュを無効化して即時反映
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    } catch (error) {
      console.error('Failed to delete post:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className={`group relative overflow-hidden bg-surface transition-all duration-300 ${
        interactive ? 'cursor-pointer hover:bg-surface-hover' : ''
      }`}
    >
      {/* Animated gradient border on left */}
      {interactive && (
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-accent via-accent-secondary to-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}

      {/* Subtle animated glow on hover */}
      {interactive && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-accent/5 opacity-0 blur-3xl transition-all duration-700 group-hover:opacity-100" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-accent-secondary/5 opacity-0 blur-3xl transition-all duration-700 group-hover:opacity-100" />
        </div>
      )}

      {/* Content wrapper */}
      <div className="relative px-4 py-4">
        {/* Repost indicator */}
        {repostedBy && (
          <div className="mb-3 flex items-center gap-2 pl-14">
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <Link href={`/users/${repostedBy.userId}`} className="hover:underline">
                {repostedBy.displayName}
              </Link>
              <span className="text-emerald-500/60">がリポスト</span>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Avatar with glow effect */}
          <div className="relative shrink-0">
            {interactive && (
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-accent/40 to-accent-secondary/40 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
            )}
            <Link href={`/users/${post.user.user_id}`} className="relative block">
              <div className={`relative h-11 w-11 overflow-hidden rounded-full bg-gray-200 ring-2 ring-surface transition-all duration-300 dark:bg-gray-700 ${interactive ? 'group-hover:ring-accent/30' : ''}`}>
                <Image
                  src={post.user.avatar_url || '/defaults/default-avatar.svg'}
                  alt={post.user.display_name}
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                  unoptimized={post.user.avatar_url?.startsWith('http') ?? false}
                />
              </div>
            </Link>
          </div>

          <div className="min-w-0 flex-1">
            {/* Header with improved layout */}
            <div className="flex items-center gap-2">
              <Link
                href={`/users/${post.user.user_id}`}
                className="group/name flex items-center gap-1.5"
              >
                <span className="truncate font-bold text-gray-900 transition-colors group-hover/name:text-accent dark:text-gray-100">
                  {post.user.display_name}
                </span>
                <span className="truncate text-sm text-gray-500 transition-colors group-hover/name:text-gray-600 dark:text-gray-400 dark:group-hover/name:text-gray-300">
                  @{post.user.user_id}
                </span>
              </Link>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <time className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                {formatDate(post.created_at)}
              </time>
            </div>

            {/* World badge with enhanced design */}
            {showWorldInfo && post.world && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Link
                  href={`/worlds/${post.world.id}`}
                  className="group/world inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-surface to-surface-hover px-3 py-1.5 ring-1 ring-border transition-all duration-300 hover:ring-accent/50 hover:shadow-md dark:from-surface dark:to-surface-hover"
                >
                  <div className="relative h-5 w-5 overflow-hidden rounded-md bg-gray-200 ring-1 ring-white/50 dark:bg-gray-700">
                    <Image
                      src={post.world.icon_url || '/defaults/default-world-icon.png'}
                      alt={post.world.name}
                      width={20}
                      height={20}
                      className="h-full w-full object-cover"
                      unoptimized={post.world.icon_url?.startsWith('http') ?? false}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 transition-colors group-hover/world:text-accent dark:text-gray-200">
                    {post.world.name}
                  </span>
                </Link>
                {post.visibility === 'world_only' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent/10 to-accent-secondary/10 px-2.5 py-1 text-xs font-semibold text-accent ring-1 ring-accent/20">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    限定
                  </span>
                )}
              </div>
            )}

            {/* Content with better typography */}
            <div className="mt-3">
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
                {post.content}
              </p>
            </div>

            {/* Images with enhanced container */}
            {post.images && post.images.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-border">
                <PostImages images={post.images} />
              </div>
            )}

            {/* Action bar with modern design */}
            <div className="-ml-2 mt-3 flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                {/* Comment button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/posts/${post.id}`)
                  }}
                  className="group/action flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-gray-500 transition-all duration-200 hover:bg-sky-500/10 hover:text-sky-500 dark:text-gray-400 dark:hover:text-sky-400"
                >
                  <div className="relative">
                    <svg className="h-5 w-5 transition-transform duration-200 group-hover/action:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  {displayCommentCount > 0 && (
                    <span className="text-sm font-medium tabular-nums">{displayCommentCount}</span>
                  )}
                </button>

                {/* Repost button */}
                <RepostButton
                  postId={post.id}
                  currentUserId={currentUserId}
                  initialReposted={isReposted}
                  initialCount={repostCount}
                />

                {/* Like button */}
                <LikeButton
                  postId={post.id}
                  currentUserId={currentUserId}
                  initialLiked={isLiked}
                  initialCount={likeCount}
                />
              </div>

              <div className="flex items-center">
                {/* Share button */}
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    const url = `${window.location.origin}/posts/${post.id}`
                    if (navigator.share) {
                      try {
                        await navigator.share({ url })
                      } catch {
                        // User cancelled or share failed
                      }
                    } else {
                      await navigator.clipboard.writeText(url)
                      alert('リンクをコピーしました')
                    }
                  }}
                  className="cursor-pointer rounded-full p-2 text-gray-400 transition-colors hover:bg-accent/10 hover:text-accent"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                  </svg>
                </button>

                {/* More menu (for owner) */}
                {isOwner && (
                  <div ref={menuRef} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(!showMenu)
                      }}
                      className="cursor-pointer rounded-full p-2 text-gray-400 transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>

                    {showMenu && (
                      <div className="absolute bottom-full right-0 z-20 mb-1 w-36 rounded-xl bg-surface py-1 shadow-lg ring-1 ring-border">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowMenu(false)
                            setShowDeleteConfirm(true)
                          }}
                          className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          削除する
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <ConfirmDialog
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={handleDelete}
              title="投稿を削除しますか？"
              description="この操作は取り消せません。投稿に関連するコメントやいいねも削除されます。"
              confirmText="削除する"
              loading={deleting}
            />
          </div>
        </div>
      </div>

      {/* Bottom border with gradient on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
      {interactive && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </article>
  )
}
