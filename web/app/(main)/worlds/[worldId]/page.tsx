import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getWorld, getWorldOwner, getWorldMemberCount, getWorldMetadata } from '@/lib/data'
import { WorldContent } from '@/components/world'

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

  // Get world (キャッシュ付き)
  const world = await getWorld(worldId)

  if (!world) {
    notFound()
  }

  // Get owner (キャッシュ付き)
  const owner = await getWorldOwner(world.owner_id)

  // Get member count (キャッシュ付き)
  const memberCount = await getWorldMemberCount(worldId)

  return (
    <div className="mx-auto max-w-2xl">
      <WorldContent
        world={world}
        owner={owner}
        memberCount={memberCount}
      />
    </div>
  )
}
