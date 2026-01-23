'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import WorldIcon from './WorldIcon'
import JoinButton from './JoinButton'
import { useWorldStatsStore } from '@/lib/stores'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']

interface WorldCardProps {
  world: World
  currentUserId?: string
  memberCount?: number
  isMember?: boolean
  showJoinButton?: boolean
}

export default function WorldCard({
  world,
  currentUserId,
  memberCount = 0,
  isMember = false,
  showJoinButton = true,
}: WorldCardProps) {
  const isOwner = currentUserId === world.owner_id

  const stats = useWorldStatsStore((state) => state.stats[world.id])
  const initWorld = useWorldStatsStore((state) => state.initWorld)

  // Initialize/update store with server values
  useEffect(() => {
    // Always update with server values on mount
    initWorld(world.id, {
      memberCount,
      isMember,
    })
  }, [world.id, memberCount, isMember, initWorld])

  // Use store value if available, fallback to prop
  const displayMemberCount = stats?.memberCount ?? memberCount

  return (
    <Link
      href={`/worlds/${world.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-background p-5 shadow-sm ring-1 ring-border transition-all duration-300 hover:shadow-lg hover:ring-muted dark:bg-surface dark:ring-border dark:hover:ring-muted"
    >
      {/* Background gradient accent */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-3xl transition-all duration-500 group-hover:scale-150" />

      <div className="relative flex items-start gap-4">
        <div className="rounded-xl ring-2 ring-background shadow-md transition-transform duration-300 group-hover:scale-105 dark:ring-border">
          <WorldIcon
            worldId={world.id}
            iconUrl={world.icon_url}
            name={world.name}
            size="lg"
            showLink={false}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <span className="block text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400 sm:truncate">
                {world.name}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">{displayMemberCount}</span>
                  <span>メンバー</span>
                </div>
              </div>
            </div>
            {showJoinButton && currentUserId && !isOwner && (
              <div
                className="shrink-0"
                onClick={(e) => e.preventDefault()}
              >
                <JoinButton
                  worldId={world.id}
                  currentUserId={currentUserId}
                  initialIsMember={isMember}
                />
              </div>
            )}
          </div>
          {world.description && (
            <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-2 dark:text-gray-300">
              {world.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
