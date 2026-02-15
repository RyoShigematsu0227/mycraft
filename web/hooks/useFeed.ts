'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import { createClient } from '@/lib/supabase/client'

export type FeedType = 'latest' | 'recommended' | 'following'

interface FeedPost {
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
  images: Array<{ id: string; image_url: string; display_order: number }> | null
  is_repost?: boolean
  reposted_by_user_id?: string | null
  reposted_by_display_name?: string | null
  repost_created_at?: string | null
}

interface UseFeedProps {
  type: FeedType
  currentUserId?: string
  worldId?: string
  profileUserId?: string
}

interface FeedPage {
  posts: FeedPost[]
  nextCursor: string | null
}

const PAGE_SIZE = 20

async function fetchFeedPage(
  type: FeedType,
  currentUserId?: string,
  worldId?: string,
  profileUserId?: string,
  cursor?: string | null
): Promise<FeedPage> {
  const supabase = createClient()
  let data: Record<string, unknown>[] | null = null

  if (profileUserId) {
    const result = await supabase.rpc('get_feed_user', {
      p_user_id: profileUserId,
      p_viewer_id: currentUserId ?? undefined,
      p_limit: PAGE_SIZE,
      p_cursor: cursor ?? undefined,
    })
    data = result.data
  } else if (worldId) {
    const result = await supabase.rpc('get_feed_world', {
      p_world_id: worldId,
      p_viewer_id: currentUserId ?? undefined,
      p_limit: PAGE_SIZE,
      p_cursor: cursor ?? undefined,
    })
    data = result.data
  } else if (type === 'latest') {
    const result = await supabase.rpc('get_feed_latest', {
      p_viewer_id: currentUserId ?? undefined,
      p_limit: PAGE_SIZE,
      p_cursor: cursor ?? undefined,
    })
    data = result.data
  } else if (type === 'recommended') {
    const result = await supabase.rpc('get_feed_recommended', {
      p_viewer_id: currentUserId ?? undefined,
      p_limit: PAGE_SIZE,
      p_offset: cursor ? parseInt(cursor) : 0,
    })
    data = result.data
  } else if (type === 'following' && currentUserId) {
    const result = await supabase.rpc('get_feed_following', {
      p_user_id: currentUserId,
      p_limit: PAGE_SIZE,
      p_cursor: cursor ?? undefined,
    })
    data = result.data
  }

  const rawPosts = data || []
  const posts: FeedPost[] = rawPosts.map((p) => ({
    id: p.id as string,
    user_id: p.user_id as string,
    world_id: p.world_id as string | null,
    content: p.content as string,
    visibility: p.visibility as string,
    created_at: p.created_at as string,
    user_display_name: p.user_display_name as string,
    user_user_id: p.user_user_id as string,
    user_avatar_url: p.user_avatar_url as string | null,
    world_name: p.world_name as string | null,
    world_icon_url: p.world_icon_url as string | null,
    likes_count: Number(p.likes_count),
    comments_count: Number(p.comments_count),
    reposts_count: Number(p.reposts_count),
    images: p.images as Array<{ id: string; image_url: string; display_order: number }> | null,
    is_repost: p.is_repost as boolean | undefined,
    reposted_by_user_id: p.reposted_by_user_id as string | null | undefined,
    reposted_by_display_name: p.reposted_by_display_name as string | null | undefined,
    repost_created_at: p.repost_created_at as string | null | undefined,
  }))

  // Determine next cursor
  let nextCursor: string | null = null
  if (posts.length === PAGE_SIZE) {
    const lastPost = posts[posts.length - 1]
    if (type === 'recommended') {
      nextCursor = String((cursor ? parseInt(cursor) : 0) + PAGE_SIZE)
    } else {
      nextCursor = lastPost.repost_created_at || lastPost.created_at
    }
  }

  return { posts, nextCursor }
}

async function fetchUserInteractions(
  currentUserId: string,
  postIds: string[]
): Promise<{ likedPostIds: string[]; repostedPostIds: string[] }> {
  if (!currentUserId || postIds.length === 0) {
    return { likedPostIds: [], repostedPostIds: [] }
  }

  const supabase = createClient()
  const [likesResult, repostsResult] = await Promise.all([
    supabase.from('likes').select('post_id').eq('user_id', currentUserId).in('post_id', postIds),
    supabase.from('reposts').select('post_id').eq('user_id', currentUserId).in('post_id', postIds),
  ])

  return {
    likedPostIds: likesResult.data?.map((l) => l.post_id) ?? [],
    repostedPostIds: repostsResult.data?.map((r) => r.post_id) ?? [],
  }
}

export default function useFeed({ type, currentUserId, worldId, profileUserId }: UseFeedProps) {
  // SWRInfinite key function
  const getKey = (pageIndex: number, previousPageData: FeedPage | null) => {
    // 最初のページ
    if (pageIndex === 0) {
      return ['feed', type, currentUserId, worldId, profileUserId, null]
    }
    // 前のページにデータがない場合は終了
    if (!previousPageData?.nextCursor) {
      return null
    }
    // 次のページのカーソルを使用
    return ['feed', type, currentUserId, worldId, profileUserId, previousPageData.nextCursor]
  }

  // Fetcher for SWRInfinite
  const fetcher = async (key: (string | null | undefined)[]) => {
    const [, feedType, userId, wId, pUserId, cursor] = key as [
      string,
      FeedType,
      string | undefined,
      string | undefined,
      string | undefined,
      string | null,
    ]
    return fetchFeedPage(feedType, userId, wId, pUserId, cursor)
  }

  const { data, isValidating, size, setSize, mutate } = useSWRInfinite(getKey, fetcher, {
    // 追加ページ読み込み時に最初のページを再取得しない
    revalidateFirstPage: false,
    // マウント時に必ず再検証（タブ切り替え時に新しいデータを取得）
    revalidateOnMount: true,
    // フォーカス時に全ページを再検証しない（最初のページのみ）
    revalidateAll: false,
  })

  // Flatten all posts from all pages
  const posts = useMemo(() => {
    return data?.flatMap((page) => page.posts) ?? []
  }, [data])

  // Check if there's more data to load
  const hasMore = useMemo(() => {
    if (!data || data.length === 0) return false
    const lastPage = data[data.length - 1]
    return lastPage.nextCursor !== null
  }, [data])

  // Get post IDs for likes/reposts query
  const postIds = useMemo(() => posts.map((p) => p.id), [posts])

  // Fetch user's likes and reposts
  const { data: userInteractions } = useSWR(
    currentUserId && postIds.length > 0
      ? ['user-interactions', currentUserId, postIds.join(',')]
      : null,
    () => fetchUserInteractions(currentUserId!, postIds)
  )

  // Convert to Sets for backward compatibility
  const likedPosts = useMemo(
    () => new Set(userInteractions?.likedPostIds ?? []),
    [userInteractions]
  )
  const repostedPosts = useMemo(
    () => new Set(userInteractions?.repostedPostIds ?? []),
    [userInteractions]
  )

  // Load more function
  const loadMore = () => {
    if (hasMore && !isValidating) {
      setSize(size + 1)
    }
  }

  return {
    posts,
    // data === undefined: まだ一度もデータを取得していない（キャッシュもない）
    // キャッシュがあれば data は即座に設定されるので loading は false
    loading: data === undefined,
    // 追加ページ読み込み中かどうか
    loadingMore: size > 1 && isValidating,
    hasMore,
    likedPosts,
    repostedPosts,
    loadMore,
    refresh: mutate,
  }
}
