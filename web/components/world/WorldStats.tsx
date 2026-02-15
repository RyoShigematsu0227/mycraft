'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useWorldStatsStore } from '@/lib/stores'

interface WorldStatsProps {
  worldId: string
  initialMemberCount: number
  isMember?: boolean
}

export default function WorldStats({
  worldId,
  initialMemberCount,
  isMember = false,
}: WorldStatsProps) {
  const stats = useWorldStatsStore((state) => state.stats[worldId])
  const initWorld = useWorldStatsStore((state) => state.initWorld)

  // Initialize store with server-rendered values
  useEffect(() => {
    initWorld(worldId, {
      memberCount: initialMemberCount,
      isMember,
    })
  }, [worldId, initialMemberCount, isMember, initWorld])

  // Use store value if available, fallback to initial value
  const memberCount = stats?.memberCount ?? initialMemberCount

  return (
    <div className="mt-3 flex gap-4 text-sm">
      <Link
        href={`/worlds/${worldId}/members`}
        className="text-gray-600 hover:underline dark:text-gray-400"
      >
        <span className="font-bold text-gray-900 dark:text-gray-100">{memberCount}</span> メンバー
      </Link>
    </div>
  )
}
