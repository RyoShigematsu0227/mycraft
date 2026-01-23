import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorldForm, DeleteWorldButton } from '@/components/world'

interface EditWorldPageProps {
  params: Promise<{ worldId: string }>
}

export default async function EditWorldPage({ params }: EditWorldPageProps) {
  const { worldId } = await params
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Get world
  const { data: world } = await supabase
    .from('worlds')
    .select('*')
    .eq('id', worldId)
    .single()

  if (!world) {
    notFound()
  }

  // Check if user is the owner
  if (world.owner_id !== authUser.id) {
    redirect(`/worlds/${worldId}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        ワールドを編集
      </h1>
      <div className="rounded-lg bg-background p-6 shadow dark:bg-surface">
        <WorldForm world={world} userId={authUser.id} />
      </div>

      {/* Danger Zone */}
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/10">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
          危険な操作
        </h2>
        <p className="mt-2 text-sm text-red-600/80 dark:text-red-400/80">
          ワールドを削除すると、すべての投稿・メンバー情報が完全に削除されます。
        </p>
        <div className="mt-4">
          <DeleteWorldButton worldId={world.id} worldName={world.name} />
        </div>
      </div>
    </div>
  )
}
