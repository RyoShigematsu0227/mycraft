'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { WorldIcon, JoinButton, WorldStats } from '@/components/world'
import { Button, Linkify } from '@/components/ui'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']
type User = Database['public']['Tables']['users']['Row']

interface WorldHeaderProps {
  world: World
  owner: User | null
  memberCount: number
  isMember: boolean
  isOwner: boolean
  currentUserId?: string
}

export default function WorldHeader({
  world,
  owner,
  memberCount,
  isMember,
  isOwner,
  currentUserId,
}: WorldHeaderProps) {
  const [isCompact, setIsCompact] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      // Show compact header when scrolled past the header
      setIsCompact(scrollY > header.offsetHeight - 60)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Compact Fixed Header */}
      <div
        className={`fixed left-0 right-0 top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-sm transition-all duration-200 lg:left-72 ${
          isCompact ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2">
          <WorldIcon
            worldId={world.id}
            iconUrl={world.icon_url}
            name={world.name}
            size="sm"
            showLink={false}
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
              {world.name}
            </h2>
            <p className="text-xs text-muted">{memberCount}人のメンバー</p>
          </div>
          <div className="shrink-0">
            {isOwner ? (
              <Link href={`/worlds/${world.id}/edit`}>
                <Button variant="outline" size="sm">
                  編集
                </Button>
              </Link>
            ) : currentUserId ? (
              <JoinButton
                worldId={world.id}
                currentUserId={currentUserId}
                initialIsMember={isMember}
                size="sm"
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Full Header */}
      <div
        ref={headerRef}
        className="border-b border-border bg-surface px-4 py-6"
      >
        <div className="flex items-start gap-4">
          <WorldIcon
            worldId={world.id}
            iconUrl={world.icon_url}
            name={world.name}
            size="xl"
            showLink={false}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {world.name}
                </h1>
                {owner && (
                  <Link
                    href={`/users/${owner.user_id}`}
                    className="text-sm text-gray-500 hover:underline dark:text-gray-400"
                  >
                    作成者: @{owner.user_id}
                  </Link>
                )}
              </div>
              <div className="shrink-0">
                {isOwner ? (
                  <Link href={`/worlds/${world.id}/edit`}>
                    <Button variant="outline" size="sm">
                      編集
                    </Button>
                  </Link>
                ) : currentUserId ? (
                  <JoinButton
                    worldId={world.id}
                    currentUserId={currentUserId}
                    initialIsMember={isMember}
                  />
                ) : null}
              </div>
            </div>
            {world.description && (
              <p className="mt-3 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {world.description}
              </p>
            )}
            <WorldStats
              worldId={world.id}
              initialMemberCount={memberCount}
              isMember={isMember}
            />
          </div>
        </div>

        {/* How to Join */}
        {world.how_to_join && (
          <div className="mt-4 rounded-lg bg-surface-hover p-4 ring-1 ring-border">
            <h3 className="text-sm font-medium text-foreground">参加方法</h3>
            <p className="mt-1 text-sm text-muted whitespace-pre-wrap break-words">
              <Linkify>{world.how_to_join}</Linkify>
            </p>
          </div>
        )}
      </div>
    </>
  )
}
