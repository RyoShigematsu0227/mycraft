'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { UserCard } from '@/components/user'
import { BackButton } from '@/components/ui'

interface LikeUser {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
}

async function fetchPostLikes(postId: string): Promise<LikeUser[]> {
  const supabase = createClient()

  const { data: likes } = await supabase
    .from('likes')
    .select(`
      user_id,
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

  return (likes?.map((like) => like.user as LikeUser).filter(Boolean) || [])
}

export default function PostLikesPage() {
  const params = useParams()
  const postId = params.postId as string
  const { user } = useAuth()

  const { data: likeUsers = [], isLoading } = useSWR(
    postId ? ['postLikes', postId] : null,
    () => fetchPostLikes(postId),
    { revalidateOnFocus: false }
  )

  // キャッシュがない初回ローディング時のみスケルトン表示
  if (isLoading && likeUsers.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 animate-pulse rounded-full bg-surface-hover" />
            <div className="h-6 w-40 animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
        <div className="divide-y divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
              <div className="h-12 w-12 rounded-full bg-surface-hover" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded bg-surface-hover" />
                <div className="h-3 w-16 rounded bg-surface-hover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-sm dark:border-border dark:bg-background/80">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-xl font-bold">いいねしたユーザー</h1>
        </div>
      </div>

      {/* User list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {likeUsers.length > 0 ? (
          likeUsers.map((likeUser) => (
            <UserCard
              key={likeUser.id}
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
              currentUserId={user?.id}
            />
          ))
        ) : (
          <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
            まだいいねがありません
          </div>
        )}
      </div>
    </div>
  )
}
