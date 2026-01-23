'use client'

import { useEffect, useRef, useCallback } from 'react'
import { PostCard } from '@/components/post'
import { Loading, EmptyState } from '@/components/ui'
import useFeed, { FeedType } from '@/hooks/useFeed'

interface InfiniteFeedProps {
  type: FeedType
  currentUserId?: string
  worldId?: string
  profileUserId?: string
  showWorldInfo?: boolean
}

export default function InfiniteFeed({
  type,
  currentUserId,
  worldId,
  profileUserId,
  showWorldInfo = true,
}: InfiniteFeedProps) {
  const { posts, loading, hasMore, likedPosts, repostedPosts, loadMore } = useFeed({
    type,
    currentUserId,
    worldId,
    profileUserId,
  })

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loading) {
        loadMore()
      }
    },
    [hasMore, loading, loadMore]
  )

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    })

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex gap-3">
              <div className="h-11 w-11 rounded-full bg-surface-hover" />
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="h-4 w-24 rounded bg-surface-hover" />
                  <div className="h-4 w-16 rounded bg-surface-hover" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-surface-hover" />
                  <div className="h-4 w-3/4 rounded bg-surface-hover" />
                </div>
                <div className="flex gap-4 pt-2">
                  <div className="h-8 w-16 rounded-full bg-surface-hover" />
                  <div className="h-8 w-16 rounded-full bg-surface-hover" />
                  <div className="h-8 w-16 rounded-full bg-surface-hover" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20">
        <div className="relative mb-6">
          {/* Animated background circles */}
          <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-br from-accent/20 to-accent-secondary/20 blur-xl" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-surface to-surface-hover ring-1 ring-border">
            <svg className="h-12 w-12 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-bold text-foreground">投稿がありません</h3>
        <p className="mt-2 max-w-xs text-center text-sm text-muted">
          {type === 'following'
            ? 'フォロー中のユーザーの投稿がここに表示されます'
            : 'ワールドに参加して、最初の投稿をしてみましょう'}
        </p>
      </div>
    )
  }

  return (
    <div>
      {posts.map((post, index) => {
        const images = (post.images || []).map((img) => ({
          id: img.id,
          post_id: post.id,
          image_url: img.image_url,
          display_order: img.display_order,
        }))

        const uniqueKey = post.is_repost
          ? `${post.id}-repost-${post.reposted_by_user_id}-${index}`
          : post.id

        return (
          <PostCard
            key={uniqueKey}
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
            isLiked={likedPosts.has(post.id)}
            isReposted={repostedPosts.has(post.id)}
            showWorldInfo={showWorldInfo}
            repostedBy={
              post.is_repost && post.reposted_by_user_id && post.reposted_by_display_name
                ? {
                    userId: post.reposted_by_user_id,
                    displayName: post.reposted_by_display_name,
                  }
                : null
            }
          />
        )
      })}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-6">
        {loading && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-muted">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <span className="text-sm">読み込み中...</span>
            </div>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface ring-1 ring-border">
                <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
            </div>
            <p className="text-sm text-muted">すべての投稿を読み込みました</p>
          </div>
        )}
      </div>
    </div>
  )
}
