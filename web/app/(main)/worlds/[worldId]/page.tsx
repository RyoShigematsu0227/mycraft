import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorld, getWorldOwner, getWorldMemberCount, getWorldMetadata } from '@/lib/data'
import { WorldHeader } from '@/components/world'
import { InfiniteFeed } from '@/components/post'

interface WorldPageProps {
  params: Promise<{ worldId: string }>
}

export async function generateMetadata({ params }: WorldPageProps): Promise<Metadata> {
  const { worldId } = await params
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
      <WorldHeader
        world={world}
        owner={owner}
        memberCount={memberCount}
        isMember={isMember}
        isOwner={isOwner}
        currentUserId={authUser?.id}
      />

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
