'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { ProfileForm, DeleteAccountButton } from '@/components/settings'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

async function fetchUserProfile(userId: string): Promise<User | null> {
  const supabase = createClient()
  const { data } = await supabase.from('users').select('*').eq('id', userId).single()
  return data
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user: authUser, isLoading: authLoading } = useAuth()

  const { data: user, isLoading: profileLoading } = useSWR(
    authUser?.id ? ['profile', authUser.id] : null,
    () => fetchUserProfile(authUser!.id)
  )

  // 未認証の場合はログインページへ
  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login')
    }
  }, [authLoading, authUser, router])

  // プロフィール未設定の場合はセットアップへ
  useEffect(() => {
    if (!profileLoading && authUser && user === null) {
      router.push('/setup')
    }
  }, [profileLoading, authUser, user, router])

  const isLoading = authLoading || profileLoading

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-hover mb-6" />
        <div className="rounded-lg bg-surface p-6 shadow-sm border border-border">
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded bg-surface-hover" />
            <div className="h-10 w-full animate-pulse rounded bg-surface-hover" />
            <div className="h-24 w-full animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">プロフィール設定</h1>
      <div className="rounded-lg bg-surface p-6 shadow-sm border border-border dark:bg-surface dark:border-border">
        <ProfileForm user={user} />
      </div>

      {/* Danger Zone */}
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/10">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400">危険な操作</h2>
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
