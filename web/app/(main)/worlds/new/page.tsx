'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { WorldForm } from '@/components/world'

export default function NewWorldPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  // 未認証の場合はログインページへ
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-hover mb-6" />
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="space-y-4">
            <div className="h-10 w-full animate-pulse rounded bg-surface-hover" />
            <div className="h-24 w-full animate-pulse rounded bg-surface-hover" />
            <div className="h-10 w-32 animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        新しいワールドを作成
      </h1>
      <div className="rounded-xl border border-border bg-surface p-6">
        <WorldForm userId={user.id} />
      </div>
    </div>
  )
}
