import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPost, getPostStats, getPostMetadata } from '@/lib/data'
import { PostCard, DeletePostButton } from '@/components/post'
import { CommentSection } from '@/components/comment'
import { BackButton } from '@/components/ui'

interface PostPageProps {
  params: Promise<{ postId: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { postId } = await params

  // キャッシュ付きメタデータ取得
  const post = await getPostMetadata(postId)

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

  // Get current user (動的 - キャッシュしない)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Get post with user and world (キャッシュ付き)
  const post = await getPost(postId)

  if (!post) {
    notFound()
  }

  // Get counts (キャッシュ付き)
  const stats = await getPostStats(postId)

  // Check if user has liked/reposted (動的 - キャッシュしない)
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

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">投稿</h1>
          </div>
          {isOwner && <DeletePostButton postId={postId} />}
        </div>
      </div>

      {/* Post */}
      <PostCard
        post={post}
        currentUserId={authUser?.id}
        likeCount={stats.likesCount}
        repostCount={stats.repostsCount}
        commentCount={stats.commentsCount}
        isLiked={isLiked}
        isReposted={isReposted}
        interactive={false}
      />

      {/* Comments section */}
      <CommentSection postId={postId} currentUserId={authUser?.id} />
    </div>
  )
}
