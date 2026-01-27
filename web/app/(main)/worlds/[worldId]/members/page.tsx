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

async function fetchWorldWithMembers(worldId: string) {
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

  return { world, members }
}

export default function MembersPage() {
  const params = useParams()
  const worldId = params.worldId as string
  const { user } = useAuth()

  const { data } = useSWR(
    worldId ? ['worldMembers', worldId] : null,
    () => fetchWorldWithMembers(worldId)
  )

  // data === undefined: キャッシュなしの初回ローディング時のみスケルトン表示
  if (data === undefined) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 animate-pulse rounded-full bg-surface-hover" />
            <div className="space-y-1">
              <div className="h-5 w-20 animate-pulse rounded bg-surface-hover" />
              <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
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

  const world = data.world
  const members = data.members

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
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
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
      />
    </div>
  )
}
