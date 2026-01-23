import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserCard } from '@/components/user'
import { EmptyState } from '@/components/ui'

interface FollowersPageProps {
  params: Promise<{ userId: string }>
}

export default async function FollowersPage({ params }: FollowersPageProps) {
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

  // Get followers
  const { data: followers } = await supabase
    .from('follows')
    .select('follower:users!follows_follower_id_fkey(*)')
    .eq('following_id', user.id)
    .order('created_at', { ascending: false })

  const followerUsers = followers?.map((f) => f.follower).filter(Boolean) || []

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
        <div className="flex items-center gap-4">
          <Link
            href={`/users/${userId}`}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">フォロワー</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{userId}</p>
          </div>
        </div>
      </div>

      {/* Followers List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {followerUsers.length === 0 ? (
          <EmptyState
            icon={
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            title="まだフォロワーがいません"
          />
        ) : (
          followerUsers.map((follower) => (
            <div key={follower.id} className="p-4">
              <UserCard
                user={follower}
                currentUserId={authUser?.id}
                showBio={true}
                showFollowButton={true}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
