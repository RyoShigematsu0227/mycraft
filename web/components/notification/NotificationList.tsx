'use client'

import NotificationCard from './NotificationCard'
import { Loading, EmptyState, Button } from '@/components/ui'
import useNotifications from '@/hooks/useNotifications'

interface NotificationListProps {
  userId: string
}

export default function NotificationList({ userId }: NotificationListProps) {
  const { notifications, loading, markAsRead, unreadCount } = useNotifications({ userId })

  if (loading) {
    return <Loading />
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        }
        title="通知はありません"
        description="いいねやコメントがあるとここに表示されます"
      />
    )
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="flex justify-end border-b border-gray-200 px-4 py-2 dark:border-gray-700">
          <Button variant="ghost" size="sm" onClick={() => markAsRead()}>
            すべて既読にする
          </Button>
        </div>
      )}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onClick={() => {
              if (!notification.is_read) {
                markAsRead(notification.id)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}
