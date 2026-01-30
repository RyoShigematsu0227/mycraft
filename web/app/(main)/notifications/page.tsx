'use client'

import { useAuth } from '@/hooks/useAuth'
import { NotificationList } from '@/components/notification'
import { BackButton } from '@/components/ui'

export default function NotificationsPage() {
  const { user, isLoading } = useAuth()

  // ミドルウェアで認証チェック済みなので、ローディング中は何も表示しない
  if (isLoading || !user) {
    return null
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">通知</h1>
        </div>
      </div>

      {/* Notification list */}
      <NotificationList userId={user.id} />
    </div>
  )
}
