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
    return <Loading />
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        }
        title="投稿がありません"
        description={
          type === 'following'
            ? 'フォロー中のユーザーの投稿がここに表示されます'
            : 'ワールドに参加して、最初の投稿をしてみましょう'
        }
      />
    )
  }

  return (
    <div>
      {posts.map((post) => {
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
            isLiked={likedPosts.has(post.id)}
            isReposted={repostedPosts.has(post.id)}
            showWorldInfo={showWorldInfo}
          />
        )
      })}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {loading && <Loading />}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            すべての投稿を読み込みました
          </p>
        )}
      </div>
    </div>
  )
}
