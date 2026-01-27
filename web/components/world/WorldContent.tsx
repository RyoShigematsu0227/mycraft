'use client'

import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { WorldHeader } from '@/components/world'
import { InfiniteFeed } from '@/components/post'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']
type User = Database['public']['Tables']['users']['Row']

interface WorldContentProps {
  world: World
  owner: User | null
  memberCount: number
}

async function checkMembership(
  worldId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('world_members')
    .select('id')
    .eq('world_id', worldId)
    .eq('user_id', userId)
    .single()
  return !!data
}

export default function WorldContent({ world, owner, memberCount }: WorldContentProps) {
  const { user: authUser } = useAuth()

  // Check membership status
  const { data: isMember = false } = useSWR(
    authUser ? ['world-membership', world.id, authUser.id] : null,
    () => checkMembership(world.id, authUser!.id),
    { revalidateOnFocus: false }
  )

  const isOwner = authUser?.id === world.owner_id

  return (
    <>
      <WorldHeader
        world={world}
        owner={owner}
        memberCount={memberCount}
        isMember={isMember}
        isOwner={isOwner}
        currentUserId={authUser?.id}
      />
      <InfiniteFeed
        type="latest"
        currentUserId={authUser?.id}
        worldId={world.id}
        showWorldInfo={false}
      />
    </>
  )
}
