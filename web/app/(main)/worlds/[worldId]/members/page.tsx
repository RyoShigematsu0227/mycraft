import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MemberList } from '@/components/world'

interface MembersPageProps {
  params: Promise<{ worldId: string }>
}

export default async function MembersPage({ params }: MembersPageProps) {
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

  // Get members
  const { data: memberships } = await supabase
    .from('world_members')
    .select('user:users!world_members_user_id_fkey(*)')
    .eq('world_id', worldId)
    .order('joined_at', { ascending: false })

  const members = memberships?.map((m) => m.user).filter(Boolean) || []

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center gap-4">
          <Link
            href={`/worlds/${worldId}`}
            className="rounded-full p-2 hover:bg-surface dark:hover:bg-surface"
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
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">メンバー</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{world.name}</p>
          </div>
        </div>
      </div>

      {/* Member List */}
      <MemberList
        members={members}
        ownerId={world.owner_id}
        currentUserId={authUser?.id}
      />
    </div>
  )
}
