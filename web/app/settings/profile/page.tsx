import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Layout } from '@/components/layout'
import { ProfileForm } from '@/components/settings'

export default async function ProfileSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) {
    redirect('/setup')
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          プロフィール設定
        </h1>
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <ProfileForm user={user} />
        </div>
      </div>
    </Layout>
  )
}
