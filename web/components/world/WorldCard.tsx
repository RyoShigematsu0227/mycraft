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
    <div className="flex items-start gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <WorldIcon
        worldId={world.id}
        iconUrl={world.icon_url}
        name={world.name}
        size="lg"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/worlds/${world.id}`}
              className="block truncate text-base font-bold text-gray-900 hover:underline dark:text-gray-100"
            >
              {world.name}
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {displayMemberCount}人のメンバー
            </p>
          </div>
          {showJoinButton && currentUserId && !isOwner && (
            <div className="shrink-0">
              <JoinButton
                worldId={world.id}
                currentUserId={currentUserId}
                initialIsMember={isMember}
              />
            </div>
          )}
        </div>
        {world.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {world.description}
          </p>
        )}
      </div>
    </div>
  )
}
