import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Layout } from '@/components/layout'
import { UserAvatar, FollowButton } from '@/components/user'
import { Button, EmptyState } from '@/components/ui'

interface UserPageProps {
  params: Promise<{ userId: string }>
}

export default async function UserPage({ params }: UserPageProps) {
  const { userId } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Get profile user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!user) {
    notFound()
  }

  // Get user stats
  const [followersResult, followingResult, postsResult] = await Promise.all([
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', user.id),
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', user.id),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const stats = {
    followersCount: followersResult.count || 0,
    followingCount: followingResult.count || 0,
    postsCount: postsResult.count || 0,
  }

  const isOwnProfile = authUser?.id === user.id

  return (
    <Layout>
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
                  <FollowButton targetUserId={user.id} currentUserId={authUser.id} />
                ) : null}
              </div>
              {user.bio && (
                <p className="mt-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {user.bio}
                </p>
              )}
              <div className="mt-3 flex gap-4 text-sm">
                <Link
                  href={`/users/${user.user_id}/following`}
                  className="text-gray-600 hover:underline dark:text-gray-400"
                >
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {stats.followingCount}
                  </span>{' '}
                  フォロー中
                </Link>
                <Link
                  href={`/users/${user.user_id}/followers`}
                  className="text-gray-600 hover:underline dark:text-gray-400"
                >
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {stats.followersCount}
                  </span>{' '}
                  フォロワー
                </Link>
              </div>
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
        <div className="p-4">
          {stats.postsCount === 0 ? (
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              }
              title="まだ投稿がありません"
              description={isOwnProfile ? '最初の投稿を作成しましょう' : undefined}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              {/* Posts will be displayed here after Phase 7 */}
              投稿一覧（Phase 7で実装）
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
