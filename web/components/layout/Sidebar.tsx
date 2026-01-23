'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']
type User = Database['public']['Tables']['users']['Row']

const navItems = [
  {
    href: '/',
    label: 'ホーム',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    href: '/worlds',
    label: 'ワールド',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
]

const authNavItems = [
  {
    href: '/notifications',
    label: '通知',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user: authUser, isAuthenticated, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [profile, setProfile] = useState<User | null>(null)
  const [userWorlds, setUserWorlds] = useState<World[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const allNavItems = isAuthenticated ? [...navItems, ...authNavItems] : navItems

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
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      if (data) setProfile(data)
    }
    fetchProfile()
  }, [authUser?.id, supabase])

  // Fetch user's worlds
  useEffect(() => {
    async function fetchUserWorlds() {
      if (!authUser?.id) return
      const { data } = await supabase
        .from('world_members')
        .select('world:worlds(*)')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (data) {
        const worlds = data
          .map((item) => item.world)
          .filter((w): w is World => w !== null)
        setUserWorlds(worlds)
      }
    }
    fetchUserWorlds()
  }, [authUser?.id, supabase])

  // Fetch unread notification count
  useEffect(() => {
    async function fetchUnreadCount() {
      if (!authUser?.id) return
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authUser.id)
        .eq('is_read', false)
      setUnreadCount(count || 0)
    }
    fetchUnreadCount()

    // Subscribe to realtime updates
    const channel = supabase
      .channel('sidebar-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${authUser?.id}`,
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authUser?.id, supabase])

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-gradient-to-b from-background to-surface/50 dark:border-border dark:from-background dark:to-surface/50 lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-5">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-lg shadow-orange-600/25 transition-transform duration-200 group-hover:scale-105">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">MyCraft</span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索"
              className="w-full rounded-xl border-0 bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground ring-1 ring-transparent transition-all duration-200 placeholder:text-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-surface dark:text-foreground dark:placeholder:text-muted dark:focus:bg-surface"
            />
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {allNavItems.map((item) => {
            const isActive = pathname === item.href
            const isNotification = item.href === '/notifications'
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/10 to-orange-600/10 text-orange-700 dark:from-amber-500/20 dark:to-orange-600/20 dark:text-orange-400'
                    : 'text-gray-600 hover:bg-surface hover:text-foreground dark:text-gray-400 dark:hover:bg-surface dark:hover:text-foreground'
                }`}
              >
                <span className={`relative transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`}>
                  {item.icon}
                  {isNotification && unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-orange-500" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Post button */}
        {isAuthenticated && (
          <div className="mt-5">
            <Link
              href="/posts/new"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-700 px-4 py-3.5 font-semibold text-white shadow-lg shadow-orange-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-600/30"
            >
              <svg className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              投稿する
            </Link>
          </div>
        )}

        {/* User's Worlds */}
        {isAuthenticated && userWorlds.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-3 px-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              参加ワールド
            </h3>
            <div className="space-y-1">
              {userWorlds.map((world) => {
                const isActive = pathname === `/worlds/${world.id}`
                return (
                  <Link
                    key={world.id}
                    href={`/worlds/${world.id}`}
                    className={`group flex items-center gap-3 rounded-xl px-3.5 py-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/10 to-orange-600/10 text-orange-700 dark:from-amber-500/20 dark:to-orange-600/20 dark:text-orange-400'
                        : 'text-gray-600 hover:bg-surface hover:text-foreground dark:text-gray-400 dark:hover:bg-surface dark:hover:text-foreground'
                    }`}
                  >
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg bg-gray-200 ring-2 ring-white shadow-sm transition-transform duration-200 group-hover:scale-105 dark:bg-gray-700 dark:ring-gray-800">
                      <Image
                        src={world.icon_url || '/defaults/default-world-icon.png'}
                        alt={world.name}
                        width={28}
                        height={28}
                        className="h-full w-full object-cover"
                        unoptimized={world.icon_url?.startsWith('http') ?? false}
                      />
                    </div>
                    <span className="truncate text-sm font-medium">{world.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-4 dark:border-border">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="mb-3 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-gray-600 transition-all duration-200 hover:bg-surface hover:text-foreground dark:text-gray-400 dark:hover:bg-surface dark:hover:text-foreground"
        >
          {theme === 'dark' ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
          <span className="font-medium">{theme === 'dark' ? 'ライトモード' : 'ダークモード'}</span>
        </button>

        {/* User profile or login */}
        {isAuthenticated && profile ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 hover:bg-surface dark:hover:bg-surface"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-gray-200 to-gray-300 ring-2 ring-white shadow-md dark:from-gray-700 dark:to-gray-600 dark:ring-gray-800">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {profile.display_name}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  @{profile.user_id}
                </p>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-border bg-background py-1 shadow-xl dark:border-border dark:bg-surface">
                <Link
                  href={`/users/${profile.user_id}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-surface dark:text-gray-300 dark:hover:bg-surface-hover"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  マイページ
                </Link>
                <Link
                  href="/settings/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-surface dark:text-gray-300 dark:hover:bg-surface-hover"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  設定
                </Link>
                <hr className="my-1 border-border dark:border-border" />
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    signOut()
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  ログアウト
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              className="block w-full rounded-xl border-2 border-border bg-background px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-all duration-200 hover:border-muted hover:bg-surface dark:border-border dark:bg-surface dark:text-foreground dark:hover:border-muted dark:hover:bg-surface-hover"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="block w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-600/30"
            >
              新規登録
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
