'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type SearchTab = 'users' | 'worlds' | 'posts'

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

interface UseSearchResult {
  users: SearchUser[]
  worlds: SearchWorld[]
  posts: SearchPost[]
  loading: boolean
  search: (query: string) => Promise<void>
  clear: () => void
}

export default function useSearch(): UseSearchResult {
  const [users, setUsers] = useState<SearchUser[]>([])
  const [worlds, setWorlds] = useState<SearchWorld[]>([])
  const [posts, setPosts] = useState<SearchPost[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([])
      setWorlds([])
      setPosts([])
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const [usersResult, worldsResult, postsResult] = await Promise.all([
        supabase.rpc('search_users', { p_query: query, p_limit: 10 }),
        supabase.rpc('search_worlds', { p_query: query, p_limit: 10 }),
        supabase.rpc('search_posts', { p_query: query, p_limit: 10 }),
      ])

      if (usersResult.data) {
        setUsers(
          usersResult.data.map((u: Record<string, unknown>) => ({
            id: u.id as string,
            user_id: u.user_id as string,
            display_name: u.display_name as string,
            avatar_url: u.avatar_url as string | null,
            bio: u.bio as string | null,
            followers_count: Number(u.followers_count),
            following_count: Number(u.following_count),
          }))
        )
      }

      if (worldsResult.data) {
        setWorlds(
          worldsResult.data.map((w: Record<string, unknown>) => ({
            id: w.id as string,
            name: w.name as string,
            description: w.description as string | null,
            icon_url: w.icon_url as string | null,
            owner_id: w.owner_id as string,
            owner_display_name: w.owner_display_name as string,
            owner_user_id: w.owner_user_id as string,
            members_count: Number(w.members_count),
          }))
        )
      }

      if (postsResult.data) {
        setPosts(
          postsResult.data.map((p: Record<string, unknown>) => ({
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
            is_liked: p.is_liked as boolean,
            is_reposted: p.is_reposted as boolean,
            images: p.images as Array<{
              id: string
              image_url: string
              display_order: number
            }> | null,
          }))
        )
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setUsers([])
    setWorlds([])
    setPosts([])
  }, [])

  return {
    users,
    worlds,
    posts,
    loading,
    search,
    clear,
  }
}
