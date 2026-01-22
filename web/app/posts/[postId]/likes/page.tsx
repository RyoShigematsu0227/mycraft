import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserCard } from '@/components/user'

interface Props {
  params: Promise<{ postId: string }>
}

export async function generateMetadata() {
  return {
    title: 'いいねしたユーザー - MyCraft',
  }
}

export default async function PostLikesPage({ params }: Props) {
  const { postId } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if post exists
  const { data: post } = await supabase
    .from('posts')
    .select('id, content')
    .eq('id', postId)
    .single()

  if (!post) {
    notFound()
  }

  // Get likes with user info
  const { data: likes } = await supabase
    .from('likes')
    .select(`
      user_id,
      created_at,
      user:users (
        id,
        user_id,
        display_name,
        avatar_url,
        bio
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false })

  // Get current user's profile
  const { data: currentUserProfile } = user
    ? await supabase.from('users').select('id').eq('id', user.id).single()
    : { data: null }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
        <div className="flex items-center gap-4">
          <Link
            href={`/posts/${postId}`}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">いいねしたユーザー</h1>
        </div>
      </div>

      {/* User list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {likes && likes.length > 0 ? (
          likes.map((like) => {
            const likeUser = like.user as {
              id: string
              user_id: string
              display_name: string
              avatar_url: string | null
              bio: string | null
            }
            return (
              <UserCard
                key={like.user_id}
                user={{
                  id: likeUser.id,
                  user_id: likeUser.user_id,
                  display_name: likeUser.display_name,
                  avatar_url: likeUser.avatar_url,
                  bio: likeUser.bio,
                  minecraft_java_username: null,
                  minecraft_bedrock_gamertag: null,
                  created_at: '',
                  updated_at: '',
                }}
                currentUserId={currentUserProfile?.id}
              />
            )
          })
        ) : (
          <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
            まだいいねがありません
          </div>
        )}
      </div>
    </div>
  )
}
