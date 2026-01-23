import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostForm } from '@/components/post'
import { EmptyState, Button } from '@/components/ui'
import Link from 'next/link'

interface NewPostPageProps {
  searchParams: Promise<{ world?: string }>
}

export default async function NewPostPage({ searchParams }: NewPostPageProps) {
  const { world: defaultWorldId } = await searchParams
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Get worlds the user is a member of
  const { data: memberships } = await supabase
    .from('world_members')
    .select('world:worlds!world_members_world_id_fkey(*)')
    .eq('user_id', authUser.id)

  const worlds = memberships?.map((m) => m.world).filter(Boolean) || []

  if (worlds.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <EmptyState
          icon={
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="ワールドに参加してください"
          description="投稿するには、まずワールドに参加する必要があります"
          action={
            <Link href="/worlds">
              <Button>ワールドを探す</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        新しい投稿
      </h1>
      <div className="rounded-xl border border-border bg-surface p-6">
        <PostForm
          userId={authUser.id}
          worlds={worlds}
          defaultWorldId={defaultWorldId}
        />
      </div>
    </div>
  )
}
