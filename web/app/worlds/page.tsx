import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Layout } from '@/components/layout'
import { WorldCard } from '@/components/world'
import { Button, EmptyState } from '@/components/ui'

export default async function WorldsPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Get all worlds with member counts
  const { data: worlds } = await supabase
    .from('worlds')
    .select('*')
    .order('created_at', { ascending: false })

  // Get member counts for each world
  const worldsWithCounts = await Promise.all(
    (worlds || []).map(async (world) => {
      const { count } = await supabase
        .from('world_members')
        .select('id', { count: 'exact', head: true })
        .eq('world_id', world.id)

      let isMember = false
      if (authUser) {
        const { data: membership } = await supabase
          .from('world_members')
          .select('id')
          .eq('world_id', world.id)
          .eq('user_id', authUser.id)
          .single()
        isMember = !!membership
      }

      return {
        world,
        memberCount: count || 0,
        isMember,
      }
    })
  )

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="sticky top-14 z-10 border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">ワールド</h1>
            {authUser && (
              <Link href="/worlds/new">
                <Button size="sm">新規作成</Button>
              </Link>
            )}
          </div>
        </div>

        {/* World List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {worldsWithCounts.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="まだワールドがありません"
              description={authUser ? '最初のワールドを作成しましょう' : undefined}
              action={
                authUser ? (
                  <Link href="/worlds/new">
                    <Button>ワールドを作成</Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            worldsWithCounts.map(({ world, memberCount, isMember }) => (
              <div key={world.id} className="p-4">
                <WorldCard
                  world={world}
                  currentUserId={authUser?.id}
                  memberCount={memberCount}
                  isMember={isMember}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
