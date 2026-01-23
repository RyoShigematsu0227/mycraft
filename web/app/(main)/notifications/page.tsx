import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationList } from '@/components/notification'
import { BackButton } from '@/components/ui'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
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
