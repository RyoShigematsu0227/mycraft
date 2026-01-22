import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Layout } from '@/components/layout'
import { PostCard } from '@/components/post'
import { CommentSection } from '@/components/comment'
import { Button, BackButton } from '@/components/ui'

interface PostPageProps {
  params: Promise<{ postId: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { postId } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      content,
      user:users!posts_user_id_fkey(display_name, user_id),
      images:post_images(image_url)
    `)
    .eq('id', postId)
    .single()

  if (!post || !post.user) {
    return { title: '投稿が見つかりません' }
  }

  const user = post.user as { display_name: string; user_id: string }
  const images = post.images as { image_url: string }[] | null
  const description = post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content
  const title = `${user.display_name}さんの投稿`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: images && images.length > 0 ? [{ url: images[0].image_url }] : undefined,
    },
    twitter: {
      card: images && images.length > 0 ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images && images.length > 0 ? [images[0].image_url] : undefined,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Get post with user and world
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      user:users!posts_user_id_fkey(*),
      world:worlds!posts_world_id_fkey(*),
      images:post_images(*)
    `)
    .eq('id', postId)
    .single()

  if (!post) {
    notFound()
  }

  // Get counts
  const [likesResult, repostsResult, commentsResult] = await Promise.all([
    supabase
      .from('likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId),
    supabase
      .from('reposts')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId),
    supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId),
  ])

  // Check if user has liked/reposted
  let isLiked = false
  let isReposted = false
  if (authUser) {
    const [likeCheck, repostCheck] = await Promise.all([
      supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', authUser.id)
        .single(),
      supabase
        .from('reposts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', authUser.id)
        .single(),
    ])
    isLiked = !!likeCheck.data
    isReposted = !!repostCheck.data
  }

  const isOwner = authUser?.id === post.user_id

  const handleDelete = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.from('posts').delete().eq('id', postId)
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="sticky top-14 z-10 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">投稿</h1>
            </div>
            {isOwner && (
              <form action={handleDelete}>
                <Button type="submit" variant="danger" size="sm">
                  削除
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Post */}
        <PostCard
          post={post}
          currentUserId={authUser?.id}
          likeCount={likesResult.count || 0}
          repostCount={repostsResult.count || 0}
          commentCount={commentsResult.count || 0}
          isLiked={isLiked}
          isReposted={isReposted}
        />

        {/* Comments section */}
        <CommentSection postId={postId} currentUserId={authUser?.id} />
      </div>
    </Layout>
  )
}
