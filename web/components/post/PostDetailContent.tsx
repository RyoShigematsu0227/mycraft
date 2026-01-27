'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import PostCard from './PostCard'
import { CommentSection } from '@/components/comment'
import type { Database } from '@/types/database'

type Post = Database['public']['Tables']['posts']['Row']
type User = Database['public']['Tables']['users']['Row']
type World = Database['public']['Tables']['worlds']['Row']
type PostImage = Database['public']['Tables']['post_images']['Row']

interface PostWithRelations extends Post {
  user: User
  world: World | null
  images: PostImage[]
}

interface PostDetailContentProps {
  post: PostWithRelations
  stats: {
    likesCount: number
    repostsCount: number
    commentsCount: number
  }
}

async function fetchEngagement(
  postId: string,
  userId: string
): Promise<{ isLiked: boolean; isReposted: boolean }> {
  const supabase = createClient()

  const [likeCheck, repostCheck] = await Promise.all([
    supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', userId).single(),
    supabase.from('reposts').select('id').eq('post_id', postId).eq('user_id', userId).single(),
  ])

  return {
    isLiked: !!likeCheck.data,
    isReposted: !!repostCheck.data,
  }
}

async function checkWorldMembership(worldId: string, userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('world_members')
    .select('id')
    .eq('world_id', worldId)
    .eq('user_id', userId)
    .single()
  return !!data
}

export default function PostDetailContent({ post, stats }: PostDetailContentProps) {
  const router = useRouter()
  const { user: authUser, isLoading: authLoading } = useAuth()

  // Check world_only visibility
  const { data: canView, isLoading: membershipLoading } = useSWR(
    post.visibility === 'world_only' && post.world_id && authUser
      ? ['world-membership', post.world_id, authUser.id]
      : null,
    () => checkWorldMembership(post.world_id!, authUser!.id),
    { revalidateOnFocus: false }
  )

  // Fetch engagement status (isLiked, isReposted)
  const { data: engagement } = useSWR(
    authUser ? ['post-engagement', post.id, authUser.id] : null,
    () => fetchEngagement(post.id, authUser!.id),
    { revalidateOnFocus: false }
  )

  // Handle world_only visibility
  useEffect(() => {
    if (post.visibility !== 'world_only') return
    if (authLoading || membershipLoading) return

    // Not logged in or not a member -> redirect
    if (!authUser || canView === false) {
      router.replace('/404')
    }
  }, [post.visibility, authUser, authLoading, membershipLoading, canView, router])

  // Show loading while checking membership for world_only posts
  if (post.visibility === 'world_only') {
    if (authLoading || membershipLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )
    }
    if (!authUser || canView === false) {
      return null // Will redirect
    }
  }

  return (
    <>
      <PostCard
        post={post}
        currentUserId={authUser?.id}
        likeCount={stats.likesCount}
        repostCount={stats.repostsCount}
        commentCount={stats.commentsCount}
        isLiked={engagement?.isLiked ?? false}
        isReposted={engagement?.isReposted ?? false}
        interactive={false}
      />
      <CommentSection postId={post.id} currentUserId={authUser?.id} />
    </>
  )
}
