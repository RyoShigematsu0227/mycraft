'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { EmptyState, Button } from '@/components/ui'
import { HomeFeed, NewPostButton } from '@/components/post'

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth()

  // 認証状態の読み込み中は何も表示しない（レイアウトは表示される）
  if (isLoading) {
    return null
  }

  // 未ログインの場合はウェルカムページ
  if (!isAuthenticated) {
    return (
      <div className="px-4 py-6">
        <EmptyState
          icon={
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          }
          title="MyCraftへようこそ"
          description="Minecraftワールドの住人になりきって、出来事・景色・建築を共有しよう"
          action={
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="outline">ログイン</Button>
              </Link>
              <Link href="/signup">
                <Button>新規登録</Button>
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/80 px-4 py-3.5 backdrop-blur-md dark:border-border dark:bg-background/80">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            ホーム
          </h1>
          <NewPostButton />
        </div>
      </div>

      {/* Feed with tabs */}
      <HomeFeed currentUserId={user?.id} />
    </div>
  )
}
