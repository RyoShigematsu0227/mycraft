'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLButtonElement>(null)

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
        return [...joinedWorlds, ...otherWorlds]
    }
  }

  const filteredWorlds = getFilteredWorlds()

  const filters: { key: FilterType; label: string; count: number; icon: React.ReactNode }[] = [
    {
      key: 'all',
      label: 'すべて',
      count: worlds.length,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      key: 'joined',
      label: '所属中',
      count: joinedWorlds.length,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: 'other',
      label: '未参加',
      count: otherWorlds.length,
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
  ]

  // Update indicator position
  useEffect(() => {
    if (activeTabRef.current && tabsRef.current) {
      const tab = activeTabRef.current
      const tabs = tabsRef.current
      const tabRect = tab.getBoundingClientRect()
      const tabsRect = tabs.getBoundingClientRect()
      setIndicatorStyle({
        left: tabRect.left - tabsRect.left,
        width: tabRect.width,
      })
    }
  }, [filter])

  return (
    <div>
      {/* Filter Tabs */}
      {currentUserId && (
        <div className="relative border-b border-border px-4 py-4">
          {/* Tabs Container */}
          <div ref={tabsRef} className="relative flex gap-2 overflow-x-auto">
            {/* Animated Background Indicator */}
            <div
              className="absolute top-0 h-full rounded-xl bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 ease-out"
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
            />

            {filters.map((f) => {
              const isActive = filter === f.key
              return (
                <button
                  key={f.key}
                  ref={isActive ? activeTabRef : null}
                  onClick={() => setFilter(f.key)}
                  className={`relative z-10 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-muted hover:bg-surface-hover hover:text-foreground'
                  }`}
                >
                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                    {f.icon}
                  </span>
                  <span>{f.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold transition-colors duration-300 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-surface text-muted'
                    }`}
                  >
                    {f.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* World Grid */}
      <div className="p-4">
        {filteredWorlds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
              <svg className="h-10 w-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-foreground">
              {filter === 'joined' && 'まだワールドに参加していません'}
              {filter === 'other' && '他のワールドはありません'}
              {filter === 'all' && 'ワールドがありません'}
            </p>
            <p className="mt-1 text-sm text-muted">
              {filter === 'joined' && '気になるワールドを探して参加してみましょう'}
              {filter === 'other' && 'すべてのワールドに参加済みです'}
              {filter === 'all' && '最初のワールドを作成しましょう'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Section Headers for "All" filter */}
            {filter === 'all' && (
              <>
                {joinedWorlds.length > 0 && (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-secondary">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-sm font-bold text-foreground">所属中のワールド</h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    {joinedWorlds.map(({ world, memberCount, isMember }) => (
                      <WorldCard
                        key={world.id}
                        world={world}
                        currentUserId={currentUserId}
                        memberCount={memberCount}
                        isMember={isMember}
                      />
                    ))}
                  </>
                )}

                {otherWorlds.length > 0 && (
                  <>
                    <div className={`flex items-center gap-3 ${joinedWorlds.length > 0 ? 'mt-4' : ''}`}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface">
                        <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h2 className="text-sm font-bold text-foreground">その他のワールド</h2>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    {otherWorlds.map(({ world, memberCount, isMember }) => (
                      <WorldCard
                        key={world.id}
                        world={world}
                        currentUserId={currentUserId}
                        memberCount={memberCount}
                        isMember={isMember}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {/* Regular list for filtered views */}
            {filter !== 'all' &&
              filteredWorlds.map(({ world, memberCount, isMember }) => (
                <WorldCard
                  key={world.id}
                  world={world}
                  currentUserId={currentUserId}
                  memberCount={memberCount}
                  isMember={isMember}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
