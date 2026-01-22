import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Layout } from '@/components/layout'
import { WorldIcon, JoinButton } from '@/components/world'
import { Button, EmptyState } from '@/components/ui'

interface WorldPageProps {
  params: Promise<{ worldId: string }>
}

export default async function WorldPage({ params }: WorldPageProps) {
  const { worldId } = await params
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Get world
  const { data: world } = await supabase
    .from('worlds')
    .select('*')
    .eq('id', worldId)
    .single()

  if (!world) {
    notFound()
  }

  // Get owner
  const { data: owner } = await supabase
    .from('users')
    .select('*')
    .eq('id', world.owner_id)
    .single()

  // Get member count
  const { count: memberCount } = await supabase
    .from('world_members')
    .select('id', { count: 'exact', head: true })
    .eq('world_id', worldId)

  // Check if current user is a member
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
    <Layout>
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
              <div className="mt-3 flex gap-4 text-sm">
                <Link
                  href={`/worlds/${world.id}/members`}
                  className="text-gray-600 hover:underline dark:text-gray-400"
                >
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {memberCount || 0}
                  </span>{' '}
                  メンバー
                </Link>
              </div>
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
        <div className="p-4">
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
            description={isMember || isOwner ? 'このワールドで最初の投稿をしましょう' : undefined}
          />
        </div>
      </div>
    </Layout>
  )
}
