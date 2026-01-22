'use client'

import { useState, useEffect, useCallback } from 'react'
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

export default function useFeed({ type, currentUserId, worldId, profileUserId }: UseFeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [repostedPosts, setRepostedPosts] = useState<Set<string>>(new Set())

  const fetchPosts = useCallback(async (cursor?: string) => {
    const supabase = createClient()
    let data: Record<string, unknown>[] | null = null

    if (profileUserId) {
      const result = await supabase.rpc('get_feed_user', {
        p_user_id: profileUserId,
        p_limit: 20,
        p_cursor: cursor,
      })
      data = result.data
    } else if (worldId) {
      const result = await supabase.rpc('get_feed_world', {
        p_world_id: worldId,
        p_limit: 20,
        p_cursor: cursor,
      })
      data = result.data
    } else if (type === 'latest') {
      const result = await supabase.rpc('get_feed_latest', {
        p_limit: 20,
        p_cursor: cursor,
      })
      data = result.data
    } else if (type === 'recommended') {
      const result = await supabase.rpc('get_feed_recommended', {
        p_limit: 20,
        p_offset: cursor ? parseInt(cursor) : 0,
      })
      data = result.data
    } else if (type === 'following' && currentUserId) {
      const result = await supabase.rpc('get_feed_following', {
        p_user_id: currentUserId,
        p_limit: 20,
        p_cursor: cursor,
      })
      data = result.data
    }

    return data || []
  }, [type, currentUserId, worldId, profileUserId])

  const loadInitial = useCallback(async () => {
    setLoading(true)
    const data = await fetchPosts()

    const transformedPosts: FeedPost[] = data.map((p) => ({
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

    setPosts(transformedPosts)
    setHasMore(transformedPosts.length === 20)

    // Fetch user's likes and reposts
    if (currentUserId && transformedPosts.length > 0) {
      const supabase = createClient()
      const postIds = transformedPosts.map((p) => p.id)

      const [likesResult, repostsResult] = await Promise.all([
        supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUserId)
          .in('post_id', postIds),
        supabase
          .from('reposts')
          .select('post_id')
          .eq('user_id', currentUserId)
          .in('post_id', postIds),
      ])

      if (likesResult.data) {
        setLikedPosts(new Set(likesResult.data.map((l) => l.post_id)))
      }
      if (repostsResult.data) {
        setRepostedPosts(new Set(repostsResult.data.map((r) => r.post_id)))
      }
    }

    setLoading(false)
  }, [fetchPosts, currentUserId])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return

    const lastPost = posts[posts.length - 1]
    if (!lastPost) return

    const cursor = type === 'recommended'
      ? String(posts.length)
      : (lastPost.repost_created_at || lastPost.created_at)

    const data = await fetchPosts(cursor)

    const newPosts: FeedPost[] = data.map((p) => ({
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

    setPosts((prev) => [...prev, ...newPosts])
    setHasMore(newPosts.length === 20)

    // Fetch user's likes and reposts for new posts
    if (currentUserId && newPosts.length > 0) {
      const supabase = createClient()
      const postIds = newPosts.map((p) => p.id)

      const [likesResult, repostsResult] = await Promise.all([
        supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', currentUserId)
          .in('post_id', postIds),
        supabase
          .from('reposts')
          .select('post_id')
          .eq('user_id', currentUserId)
          .in('post_id', postIds),
      ])

      if (likesResult.data) {
        setLikedPosts((prev) => {
          const newSet = new Set(prev)
          likesResult.data!.forEach((l) => newSet.add(l.post_id))
          return newSet
        })
      }
      if (repostsResult.data) {
        setRepostedPosts((prev) => {
          const newSet = new Set(prev)
          repostsResult.data!.forEach((r) => newSet.add(r.post_id))
          return newSet
        })
      }
    }
  }, [posts, hasMore, loading, type, fetchPosts, currentUserId])

  useEffect(() => {
    void loadInitial()
  }, [loadInitial])

  return {
    posts,
    loading,
    hasMore,
    likedPosts,
    repostedPosts,
    loadMore,
    refresh: loadInitial,
  }
}
