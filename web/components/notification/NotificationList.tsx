'use client'

import { useEffect, useRef } from 'react'
import NotificationCard from './NotificationCard'
import { Loading, EmptyState } from '@/components/ui'
import useNotifications from '@/hooks/useNotifications'

interface NotificationListProps {
  userId: string
}

export default function NotificationList({ userId }: NotificationListProps) {
  const { notifications, loading, markAsRead, unreadCount } = useNotifications({ userId })
  const hasMarkedAsRead = useRef(false)

  // 通知一覧を表示した時点ですべて既読にする
  useEffect(() => {
    if (!loading && unreadCount > 0 && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true
      markAsRead()
    }
  }, [loading, unreadCount, markAsRead])

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
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  )
}
