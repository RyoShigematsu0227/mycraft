'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

  useEffect(() => {
    initWorld(world.id, {
      memberCount,
      isMember,
    })
  }, [world.id, memberCount, isMember, initWorld])

  const displayMemberCount = stats?.memberCount ?? memberCount
  const displayIsMember = stats?.isMember ?? isMember

  // Generate gradient based on world name for consistent colors
  const getGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
    const gradients = [
      'from-rose-500/20 via-orange-500/20 to-amber-500/20',
      'from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
      'from-cyan-500/20 via-blue-500/20 to-indigo-500/20',
      'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
      'from-amber-500/20 via-orange-500/20 to-red-500/20',
      'from-pink-500/20 via-rose-500/20 to-red-500/20',
    ]
    return gradients[hash % gradients.length]
  }

  return (
    <Link
      href={`/worlds/${world.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-surface transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:bg-surface"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(world.name)} opacity-60 transition-opacity duration-500 group-hover:opacity-100`} />

        {/* Animated Glow */}
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/20 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:bg-accent/30" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-accent-secondary/20 blur-3xl transition-all duration-700 group-hover:scale-150 group-hover:bg-accent-secondary/30" />

        {/* Glass overlay */}
        <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm dark:bg-surface/90" />
      </div>

      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-border transition-all duration-300 group-hover:ring-2 group-hover:ring-accent/50" />

      {/* Content */}
      <div className="relative p-5">
        {/* Status Badges */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {isOwner && (
            <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-amber-500/25">
              オーナー
            </span>
          )}
          {displayIsMember && !isOwner && (
            <span className="rounded-full bg-gradient-to-r from-accent to-accent-secondary px-3 py-1 text-xs font-bold text-white shadow-lg shadow-accent/25">
              所属中
            </span>
          )}
        </div>

        <div className="flex items-start gap-4">
          {/* World Icon */}
          <div className="relative overflow-hidden rounded-2xl p-1">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/50 to-accent-secondary/50 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gray-200 shadow-lg ring-2 ring-white/50 transition-transform duration-300 group-hover:scale-105 dark:bg-gray-700 dark:ring-white/20">
              <Image
                src={world.icon_url || '/defaults/default-world-icon.png'}
                alt={world.name}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                unoptimized={world.icon_url?.startsWith('http') ?? false}
              />
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-accent dark:text-gray-100">
              {world.name}
            </h3>

            {/* Stats */}
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {[...Array(Math.min(3, displayMemberCount))].map((_, i) => (
                    <div
                      key={i}
                      className="h-5 w-5 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 ring-2 ring-surface dark:from-gray-600 dark:to-gray-700"
                      style={{ zIndex: 3 - i }}
                    />
                  ))}
                </div>
                <span className="ml-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {displayMemberCount}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  メンバー
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {world.description && (
          <p className="mt-4 text-sm leading-relaxed text-gray-600 line-clamp-2 dark:text-gray-400">
            {world.description}
          </p>
        )}

        {/* Action Area */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Minecraft ワールド</span>
          </div>

          {showJoinButton && currentUserId && !isOwner && (
            <div onClick={(e) => e.preventDefault()}>
              <JoinButton
                worldId={world.id}
                currentUserId={currentUserId}
                initialIsMember={isMember}
              />
            </div>
          )}

          {!currentUserId && (
            <span className="flex items-center gap-1 text-sm font-medium text-accent transition-transform duration-300 group-hover:translate-x-1">
              詳細を見る
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
