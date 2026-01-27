import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getUserProfile, getUserStats, getUserMetadata } from '@/lib/data'
import { UserContent } from '@/components/user'

interface UserPageProps {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { userId } = await params
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

  // Get profile user (キャッシュ付き)
  const user = await getUserProfile(userId)

  if (!user) {
    notFound()
  }

  // Get user stats (キャッシュ付き)
  const stats = await getUserStats(user.id)

  return (
    <div className="mx-auto max-w-2xl">
      <UserContent user={user} stats={stats} />
    </div>
  )
}
