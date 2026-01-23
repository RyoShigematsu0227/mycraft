import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm, DeleteAccountButton } from '@/components/settings'

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
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        プロフィール設定
      </h1>
      <div className="rounded-lg bg-surface p-6 shadow-sm border border-border dark:bg-surface dark:border-border">
        <ProfileForm user={user} />
      </div>

      {/* Danger Zone */}
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/10">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
          危険な操作
        </h2>
        <p className="mt-2 text-sm text-red-600/80 dark:text-red-400/80">
          アカウントを削除すると、すべてのデータが完全に削除され、復元できません。
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  )
}
