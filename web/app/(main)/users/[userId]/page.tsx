import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile, getUserStats, getUserMetadata } from '@/lib/data'
import { UserAvatar, FollowButton, UserProfileStats } from '@/components/user'
import { InfiniteFeed } from '@/components/post'
import { Button } from '@/components/ui'

interface UserPageProps {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { userId } = await params

  // キャッシュ付きメタデータ取得
  const user = await getUserMetadata(userId)

  if (!user) {
    return { title: 'ユーザーが見つかりません' }
  }

  const description = user.bio || `${user.display_name}さんのプロフィール`

  return {
    title: user.display_name,
    description,
    openGraph: {
      title: `${user.display_name} (@${userId})`,
      description,
      images: user.avatar_url ? [{ url: user.avatar_url }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${user.display_name} (@${userId})`,
      description,
      images: user.avatar_url ? [user.avatar_url] : undefined,
    },
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const { userId } = await params
  const supabase = await createClient()

  // Get current user (動的 - キャッシュしない)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Get profile user (キャッシュ付き)
  const user = await getUserProfile(userId)

  if (!user) {
    notFound()
  }

  // Get user stats (キャッシュ付き)
  const stats = await getUserStats(user.id)

  // Check follow status (動的 - キャッシュしない)
  let isFollowing = false
  if (authUser) {
    const { data: followStatus } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', authUser.id)
      .eq('following_id', user.id)
      .single()
    isFollowing = !!followStatus
  }

  const isOwnProfile = authUser?.id === user.id

  return (
    <div className="mx-auto max-w-2xl">
      {/* Profile Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-4">
          <UserAvatar
            userId={user.user_id}
            avatarUrl={user.avatar_url}
            displayName={user.display_name}
            size="2xl"
            showLink={false}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {user.display_name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">@{user.user_id}</p>
              </div>
              {isOwnProfile ? (
                <Link href="/settings/profile">
                  <Button variant="outline" size="sm">
                    プロフィールを編集
                  </Button>
                </Link>
              ) : authUser ? (
                <FollowButton
                  targetUserId={user.id}
                  currentUserId={authUser.id}
                  initialFollowing={isFollowing}
                />
              ) : null}
            </div>
            {user.bio && (
              <p className="mt-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {user.bio}
              </p>
            )}
            <UserProfileStats
              userId={user.id}
              userIdSlug={user.user_id}
              initialStats={stats}
              isFollowing={isFollowing}
            />
            {(user.minecraft_java_username || user.minecraft_bedrock_gamertag) && (
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {user.minecraft_java_username && (
                  <span className="rounded bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Java: {user.minecraft_java_username}
                  </span>
                )}
                {user.minecraft_bedrock_gamertag && (
                  <span className="rounded bg-blue-100 px-2 py-1 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    Bedrock: {user.minecraft_bedrock_gamertag}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <InfiniteFeed
        type="latest"
        currentUserId={authUser?.id}
        profileUserId={user.id}
        showWorldInfo={true}
      />
    </div>
  )
}
