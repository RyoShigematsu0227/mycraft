'use client'

import { useState } from 'react'
import { WorldCard } from '@/components/world'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']

type FilterType = 'all' | 'joined' | 'other'

interface WorldWithMeta {
  world: World
  memberCount: number
  isMember: boolean
}

interface WorldListProps {
  worlds: WorldWithMeta[]
  currentUserId?: string
}

export default function WorldList({ worlds, currentUserId }: WorldListProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const joinedWorlds = worlds.filter((w) => w.isMember)
  const otherWorlds = worlds.filter((w) => !w.isMember)

  const getFilteredWorlds = () => {
    switch (filter) {
      case 'joined':
        return joinedWorlds
      case 'other':
        return otherWorlds
      case 'all':
      default:
        // Show joined first, then others
        return [...joinedWorlds, ...otherWorlds]
    }
  }

  const filteredWorlds = getFilteredWorlds()

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'すべて', count: worlds.length },
    { key: 'joined', label: '所属中', count: joinedWorlds.length },
    { key: 'other', label: 'その他', count: otherWorlds.length },
  ]

  return (
    <div>
      {/* Filter Tabs */}
      {currentUserId && (
        <div className="flex gap-2 px-4 py-3 border-b border-border">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-accent text-white'
                  : 'bg-surface text-muted hover:bg-surface-hover hover:text-foreground'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${filter === f.key ? 'text-white/80' : 'text-muted'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* World List */}
      <div className="divide-y divide-border">
        {filteredWorlds.length === 0 ? (
          <div className="py-12 text-center text-muted">
            {filter === 'joined' && '所属しているワールドはありません'}
            {filter === 'other' && '他のワールドはありません'}
            {filter === 'all' && 'ワールドがありません'}
          </div>
        ) : (
          filteredWorlds.map(({ world, memberCount, isMember }) => (
            <div key={world.id} className="p-4">
              <WorldCard
                world={world}
                currentUserId={currentUserId}
                memberCount={memberCount}
                isMember={isMember}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
