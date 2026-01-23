import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorldForm } from '@/components/world'

export default async function NewWorldPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        新しいワールドを作成
      </h1>
      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <WorldForm userId={authUser.id} />
      </div>
    </div>
  )
}
