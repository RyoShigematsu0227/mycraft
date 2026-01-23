import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorldForm } from '@/components/world'

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
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <WorldForm world={world} userId={authUser.id} />
      </div>
    </div>
  )
}
