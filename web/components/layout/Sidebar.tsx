'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore } from '@/lib/stores'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']

interface WorldWithMemberCount extends World {
  memberCount: number
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user: authUser, isAuthenticated, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { profile, setProfile } = useProfileStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [userWorlds, setUserWorlds] = useState<WorldWithMemberCount[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAllWorlds, setShowAllWorlds] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    } else {
      router.push('/search')
    }
  }

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!authUser?.id) return
      if (profile?.id === authUser.id) return
      const client = createClient()
      const { data } = await client
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      if (data) setProfile(data)
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id])

  // Fetch user's worlds with member counts
  useEffect(() => {
    async function fetchUserWorlds() {
      console.log('fetchUserWorlds called, authUser?.id:', authUser?.id)
      if (!authUser?.id) return
      const client = createClient()
      const { data, error } = await client
        .from('world_members')
        .select('world:worlds(*)')
        .eq('user_id', authUser.id)

      console.log('world_members data:', data, 'error:', error)

      if (data) {
        const worlds = data
          .map((item) => item.world)
          .filter((w): w is World => w !== null)

        console.log('filtered worlds:', worlds)

        // Fetch member counts for each world
        const worldsWithCounts = await Promise.all(
          worlds.map(async (world) => {
            const { count } = await client
              .from('world_members')
              .select('id', { count: 'exact', head: true })
              .eq('world_id', world.id)
            return { ...world, memberCount: count || 0 }
          })
        )
        console.log('worldsWithCounts:', worldsWithCounts)
        setUserWorlds(worldsWithCounts)
      }
    }
    fetchUserWorlds()
  }, [authUser?.id])

  // Fetch unread notification count
  useEffect(() => {
    if (!authUser?.id) return

    const client = createClient()

    async function fetchUnreadCount() {
      const { count } = await client
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authUser!.id)
        .eq('is_read', false)
      setUnreadCount(count || 0)
    }
    fetchUnreadCount()

    const channel = client
      .channel('sidebar-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${authUser.id}`,
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [authUser?.id])

  const displayedWorlds = showAllWorlds ? userWorlds : userWorlds.slice(0, 4)

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-gradient-to-b from-background via-background to-surface/30 lg:flex lg:flex-col">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 top-20 h-40 w-40 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -left-20 bottom-40 h-32 w-32 rounded-full bg-accent-secondary/5 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative flex h-14 items-center justify-between px-4">
        <Link href="/" className="group relative">
          <Image
            src="/mycraft-logo.png"
            alt="MyCraft"
            width={140}
            height={32}
            className="h-8 w-auto transition-opacity duration-200 group-hover:opacity-80"
            priority
          />
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="cursor-pointer rounded-lg p-2 text-muted transition-all duration-200 hover:bg-surface-hover hover:text-foreground"
        >
          {theme === 'dark' ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* User Profile Card (when logged in) */}
      {isAuthenticated && profile && (
        <div className="relative mx-3 mb-3 rounded-2xl bg-gradient-to-br from-surface to-surface-hover p-3 ring-1 ring-border">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <Link href={`/users/${profile.user_id}`} className="group relative shrink-0">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-accent to-accent-secondary opacity-0 blur transition-opacity duration-300 group-hover:opacity-75" />
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-200 ring-2 ring-surface dark:bg-gray-700">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/users/${profile.user_id}`} className="group">
                <p className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-accent">
                  {profile.display_name}
                </p>
                <p className="truncate text-xs text-muted">@{profile.user_id}</p>
              </Link>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-background hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-2xl">
                  <Link
                    href={`/users/${profile.user_id}`}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    マイページ
                  </Link>
                  <Link
                    href="/settings/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    設定
                  </Link>
                  <hr className="my-1 border-border" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      signOut()
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-rose-500 transition-colors hover:bg-rose-500/10"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ログアウト
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative px-3 pb-2">
        <form onSubmit={handleSearch}>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-muted transition-colors group-focus-within:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索..."
              className="w-full rounded-xl border-0 bg-surface py-2 pl-9 pr-3 text-sm text-foreground ring-1 ring-border transition-all duration-200 placeholder:text-muted focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </form>
      </div>

      {/* Main Navigation */}
      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {/* Quick Actions */}
        {isAuthenticated && (
          <div className="mb-4">
            <Link
              href="/posts/new"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-4 py-3 font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-300 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
            >
              <svg className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              投稿する
            </Link>
          </div>
        )}

        {/* Main Links */}
        <div className="space-y-0.5">
          <NavLink href="/" icon="home" label="ホーム" isActive={pathname === '/'} />
          <NavLink href="/worlds" icon="world" label="ワールド一覧" isActive={pathname === '/worlds'} />
          {isAuthenticated && (
            <NavLink
              href="/notifications"
              icon="notification"
              label="通知"
              isActive={pathname === '/notifications'}
              badge={unreadCount}
            />
          )}
        </div>

        {/* My Worlds Section */}
        {isAuthenticated && userWorlds.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between px-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                マイワールド
              </h3>
              <Link
                href="/worlds"
                className="text-xs font-medium text-accent hover:underline"
              >
                すべて見る
              </Link>
            </div>

            <div className="space-y-1">
              {displayedWorlds.map((world) => {
                const isActive = pathname === `/worlds/${world.id}`
                return (
                  <Link
                    key={world.id}
                    href={`/worlds/${world.id}`}
                    className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-accent/15 to-accent-secondary/10'
                        : 'hover:bg-surface-hover'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-accent to-accent-secondary" />
                    )}

                    {/* World icon */}
                    <div className="relative">
                      <div className={`absolute -inset-0.5 rounded-lg bg-gradient-to-br from-accent/40 to-accent-secondary/40 opacity-0 blur transition-opacity duration-300 ${isActive ? 'opacity-50' : 'group-hover:opacity-50'}`} />
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-200 ring-1 ring-border shadow-sm dark:bg-gray-700">
                        <Image
                          src={world.icon_url || '/defaults/default-world-icon.png'}
                          alt={world.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          unoptimized={world.icon_url?.startsWith('http') ?? false}
                        />
                      </div>
                    </div>

                    {/* World info */}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium transition-colors ${isActive ? 'text-accent' : 'text-foreground'}`}>
                        {world.name}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{world.memberCount}</span>
                      </div>
                    </div>

                    {/* Quick action */}
                    <div className="opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-md bg-accent/10 p-1 text-accent">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Show more/less button */}
              {userWorlds.length > 4 && (
                <button
                  onClick={() => setShowAllWorlds(!showAllWorlds)}
                  className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  {showAllWorlds ? (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                      折りたたむ
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                      他 {userWorlds.length - 4} ワールドを表示
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Create World CTA */}
        {isAuthenticated && (
          <div className="mt-4">
            <Link
              href="/worlds/new"
              className="group flex items-center gap-2.5 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-muted transition-all duration-200 hover:border-accent hover:bg-accent/5 hover:text-accent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover transition-colors group-hover:bg-accent/10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-medium">ワールドを作成</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Bottom: Login buttons for non-authenticated users */}
      {!isAuthenticated && (
        <div className="relative border-t border-border p-3">
          <div className="space-y-2">
            <Link
              href="/login"
              className="block w-full rounded-xl border-2 border-border bg-surface px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-all duration-200 hover:border-muted hover:bg-surface-hover"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="relative block w-full overflow-hidden rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5"
            >
              新規登録
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}

// Navigation Link Component
function NavLink({
  href,
  icon,
  label,
  isActive,
  badge,
}: {
  href: string
  icon: 'home' | 'world' | 'notification'
  label: string
  isActive: boolean
  badge?: number
}) {
  const icons = {
    home: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    world: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    notification: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  }

  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-accent/15 to-accent-secondary/10 text-accent'
          : 'text-muted hover:bg-surface-hover hover:text-foreground'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-accent to-accent-secondary" />
      )}
      <span className={`relative transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`}>
        {icons[icon]}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span className="font-medium">{label}</span>
    </Link>
  )
}
