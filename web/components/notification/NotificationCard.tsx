'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/user'
import type { Database } from '@/types/database'

type Notification = Database['public']['Tables']['notifications']['Row']
type User = Database['public']['Tables']['users']['Row']

interface NotificationWithActor extends Notification {
  actor: User
}

interface NotificationCardProps {
  notification: NotificationWithActor
}

function getNotificationContent(notification: NotificationWithActor): {
  actionText: string
  link: string
  icon: React.ReactNode
} {
  switch (notification.type) {
    case 'like':
      return {
        actionText: 'があなたの投稿にいいねしました',
        link: `/posts/${notification.post_id}`,
        icon: (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-500 dark:bg-pink-900/30">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        ),
      }
    case 'comment':
      return {
        actionText: 'があなたの投稿にコメントしました',
        link: `/posts/${notification.post_id}`,
        icon: (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-accent">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        ),
      }
    case 'follow':
      return {
        actionText: 'があなたをフォローしました',
        link: `/users/${notification.actor.user_id}`,
        icon: (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900/30">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        ),
      }
    case 'repost':
      return {
        actionText: 'があなたの投稿をリポストしました',
        link: `/posts/${notification.post_id}`,
        icon: (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        ),
      }
    case 'comment_like':
      return {
        actionText: 'があなたのコメントにいいねしました',
        link: `/posts/${notification.post_id}`,
        icon: (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-500 dark:bg-pink-900/30">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        ),
      }
    default:
      return {
        actionText: '通知があります',
        link: '/',
        icon: null,
      }
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '今'
  if (minutes < 60) return `${minutes}分前`
  if (hours < 24) return `${hours}時間前`
  if (days < 7) return `${days}日前`

  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
}

export default function NotificationCard({ notification }: NotificationCardProps) {
  const router = useRouter()
  const { actionText, link, icon } = getNotificationContent(notification)

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/users/${notification.actor.user_id}`)
  }

  return (
    <Link
      href={link}
      className="flex items-start gap-3 px-4 py-3 transition hover:bg-surface dark:hover:bg-surface"
    >
      <div onClick={handleUserClick} className="cursor-pointer">
        <UserAvatar
          userId={notification.actor.user_id}
          avatarUrl={notification.actor.avatar_url}
          displayName={notification.actor.display_name}
          size="md"
          showLink={false}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {icon}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              <span
                onClick={handleUserClick}
                className="cursor-pointer font-medium hover:underline"
              >
                {notification.actor.display_name}
              </span>
              {actionText}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {formatDate(notification.created_at)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
