'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { MemberList } from '@/components/world'
import { BackButton } from '@/components/ui'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']
type User = Database['public']['Tables']['users']['Row']

async function fetchWorldWithMembers(worldId: string, currentUserId?: string) {
  const supabase = createClient()

  const [worldResult, membersResult] = await Promise.all([
    supabase.from('worlds').select('*').eq('id', worldId).single(),
    supabase
      .from('world_members')
      .select('user:users!world_members_user_id_fkey(*)')
      .eq('world_id', worldId)
      .order('joined_at', { ascending: false }),
  ])

  const world = worldResult.data as World | null
  const members = (membersResult.data?.map((m) => m.user).filter(Boolean) || []) as User[]

  // Get which members the current user is following
  let followingIds = new Set<string>()
  if (currentUserId && members.length > 0) {
    const memberIds = members.map((m) => m.id)
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUserId)
      .in('following_id', memberIds)
    followingIds = new Set(followingData?.map((f) => f.following_id) || [])
  }

  return { world, members, followingIds }
}

export default function MembersPage() {
  const params = useParams()
  const worldId = params.worldId as string
  const { user } = useAuth()

  const { data, isLoading } = useSWR(worldId ? ['worldMembers', worldId, user?.id] : null, () =>
    fetchWorldWithMembers(worldId, user?.id)
  )

  // loading.tsx handles initial loading state
  if (isLoading) {
    return null
  }

  const world = data?.world
  const members = data?.members ?? []
  const followingIds = data?.followingIds ?? new Set<string>()

  if (!world) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-muted">ワールドが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">メンバー</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{world.name}</p>
          </div>
        </div>
      </div>

      {/* Member List */}
      <MemberList
        members={members}
        ownerId={world.owner_id}
        currentUserId={user?.id}
        followingIds={followingIds}
      />
    </div>
  )
}
