'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useWorlds } from '@/hooks/useWorlds'
import { WorldList } from '@/components/world'
import { Button, EmptyState } from '@/components/ui'

export default function WorldsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { worlds, isLoading: worldsLoading } = useWorlds(user?.id)

  const isLoading = authLoading || worldsLoading

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/80">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">ワールド</h1>
          {user && (
            <Link href="/worlds/new">
              <Button size="sm">新規作成</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col gap-4 p-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-surface p-4">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-xl bg-surface-hover" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 rounded bg-surface-hover" />
                  <div className="h-4 w-full rounded bg-surface-hover" />
                  <div className="h-4 w-20 rounded bg-surface-hover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : worlds.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="まだワールドがありません"
          description={user ? '最初のワールドを作成しましょう' : undefined}
          action={
            user ? (
              <Link href="/worlds/new">
                <Button>ワールドを作成</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <WorldList worlds={worlds} currentUserId={user?.id} />
      )}
    </div>
  )
}
