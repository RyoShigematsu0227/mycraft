'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import PostCard from './PostCard'
import { Loading, EmptyState } from '@/components/ui'

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
}

interface FeedProps {
  currentUserId?: string
}

export default function Feed({ currentUserId }: FeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [repostedPosts, setRepostedPosts] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchFeed = async () => {
      const supabase = createClient()

      const { data, error } = await supabase.rpc('get_feed_latest', {
        p_limit: 20,
      })

      if (error) {
        console.error('Error fetching feed:', error)
      } else if (data) {
        // Transform the data to match our FeedPost type
        const transformedPosts: FeedPost[] = data.map((p: Record<string, unknown>) => ({
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
        }))
        setPosts(transformedPosts)

        // Fetch user's likes and reposts
        if (currentUserId && transformedPosts.length > 0) {
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
      }

      setLoading(false)
    }

    fetchFeed()
  }, [currentUserId])

  if (loading) {
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
        description="ワールドに参加して、最初の投稿をしてみましょう"
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
              world: post.world_name && post.world_id
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
          />
        )
      })}
    </div>
  )
}
