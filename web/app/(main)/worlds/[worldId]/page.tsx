import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getWorld, getWorldOwner, getWorldMemberCount, getWorldMetadata } from '@/lib/data'
import { WorldIcon, JoinButton, WorldStats } from '@/components/world'
import { InfiniteFeed } from '@/components/post'
import { Button } from '@/components/ui'

interface WorldPageProps {
  params: Promise<{ worldId: string }>
}

export async function generateMetadata({ params }: WorldPageProps): Promise<Metadata> {
  const { worldId } = await params

  // キャッシュ付きメタデータ取得
  const world = await getWorldMetadata(worldId)

  if (!world) {
    return { title: 'ワールドが見つかりません' }
  }

  const description = world.description || `${world.name} - Minecraftワールド`

  return {
    title: world.name,
    description,
    openGraph: {
      title: world.name,
      description,
      images: world.icon_url ? [{ url: world.icon_url }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: world.name,
      description,
      images: world.icon_url ? [world.icon_url] : undefined,
    },
  }
}

export default async function WorldPage({ params }: WorldPageProps) {
  const { worldId } = await params
  const supabase = await createClient()

  // Get current user (動的 - キャッシュしない)
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Get world (キャッシュ付き)
  const world = await getWorld(worldId)

  if (!world) {
    notFound()
  }

  // Get owner (キャッシュ付き)
  const owner = await getWorldOwner(world.owner_id)

  // Get member count (キャッシュ付き)
  const memberCount = await getWorldMemberCount(worldId)

  // Check if current user is a member (動的 - キャッシュしない)
  let isMember = false
  if (authUser) {
    const { data: membership } = await supabase
      .from('world_members')
      .select('id')
      .eq('world_id', worldId)
      .eq('user_id', authUser.id)
      .single()
    isMember = !!membership
  }

  const isOwner = authUser?.id === world.owner_id

  return (
    <div className="mx-auto max-w-2xl">
      {/* World Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start gap-4">
          <WorldIcon
            worldId={world.id}
            iconUrl={world.icon_url}
            name={world.name}
            size="xl"
            showLink={false}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {world.name}
                </h1>
                {owner && (
                  <Link
                    href={`/users/${owner.user_id}`}
                    className="text-sm text-gray-500 hover:underline dark:text-gray-400"
                  >
                    作成者: @{owner.user_id}
                  </Link>
                )}
              </div>
              {isOwner ? (
                <Link href={`/worlds/${world.id}/edit`}>
                  <Button variant="outline" size="sm">
                    編集
                  </Button>
                </Link>
              ) : authUser ? (
                <JoinButton
                  worldId={world.id}
                  currentUserId={authUser.id}
                  initialIsMember={isMember}
                />
              ) : null}
            </div>
            {world.description && (
              <p className="mt-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {world.description}
              </p>
            )}
            <WorldStats
              worldId={world.id}
              initialMemberCount={memberCount}
              isMember={isMember}
            />
          </div>
        </div>

        {/* How to Join */}
        {world.how_to_join && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">参加方法</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {world.how_to_join}
            </p>
          </div>
        )}
      </div>

      {/* Posts Section */}
      <InfiniteFeed
        type="latest"
        currentUserId={authUser?.id}
        worldId={world.id}
        showWorldInfo={false}
      />
    </div>
  )
}
