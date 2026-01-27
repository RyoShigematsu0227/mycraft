import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPost, getPostStats, getPostMetadata } from '@/lib/data'
import { PostDetailContent } from '@/components/post'
import { BackButton } from '@/components/ui'

interface PostPageProps {
  params: Promise<{ postId: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { postId } = await params
  const post = await getPostMetadata(postId)

  if (!post || !post.user) {
    return { title: '投稿が見つかりません' }
  }

  // world_only投稿はOGP情報を出さない
  if (post.visibility === 'world_only') {
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

  // Get post with user and world (キャッシュ付き)
  const post = await getPost(postId)

  if (!post) {
    notFound()
  }

  // Get counts (キャッシュ付き)
  const stats = await getPostStats(postId)

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">投稿</h1>
        </div>
      </div>

      {/* Post content (Client Component for auth-dependent data) */}
      <PostDetailContent post={post} stats={stats} />
    </div>
  )
}
