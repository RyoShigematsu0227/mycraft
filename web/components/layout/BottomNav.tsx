'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { createClient } from '@/lib/supabase/client'
import { useProfileStore, usePostModalStore } from '@/lib/stores'
import type { Database } from '@/types/database'

export default function BottomNav() {
  const pathname = usePathname()
  const { user: authUser, isAuthenticated, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { profile, setProfile } = useProfileStore()
  const openPostModal = usePostModalStore((state) => state.openModal)
  const [showMenu, setShowMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!authUser?.id) return
      // Skip if profile is already loaded for this user
      if (profile?.id === authUser.id) return
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
      if (data) setProfile(data)
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id])

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

    const channel = supabase
      .channel('bottomnav-notifications')
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

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    {
      href: '/',
      label: 'ホーム',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      href: '/search',
      label: '検索',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
    ...(isAuthenticated
      ? [
          {
            label: '投稿',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            ),
            highlight: true,
            isPostButton: true,
          },
        ]
      : []),
    {
      href: '/worlds',
      label: 'ワールド',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    ...(isAuthenticated
      ? [
          {
            href: '/notifications',
            label: '通知',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            ),
            showBadge: true,
          },
        ]
      : [
          {
            href: '/login',
            label: 'ログイン',
            icon: (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
            ),
          },
        ]),
  ]

  return (
    <>
      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Mobile Slide-up Menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className="fixed bottom-16 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-background p-4 dark:border-border dark:bg-background lg:hidden"
        >
          {/* User info */}
          {profile && (
            <Link
              href={`/users/${profile.user_id}`}
              className="mb-4 flex items-center gap-3 rounded-lg p-2 hover:bg-surface dark:hover:bg-surface"
              onClick={() => setShowMenu(false)}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-surface">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-500">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                  {profile.display_name}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  @{profile.user_id}
                </p>
              </div>
            </Link>
          )}

          <div className="space-y-1">
            {/* Theme toggle */}
            <button
              onClick={() => {
                toggleTheme()
                setShowMenu(false)
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-surface dark:text-gray-300 dark:hover:bg-surface"
            >
              {theme === 'dark' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
              <span className="font-medium">{theme === 'dark' ? 'ライトモード' : 'ダークモード'}</span>
            </button>

            {/* Settings */}
            <Link
              href="/settings/profile"
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-gray-700 hover:bg-surface dark:text-gray-300 dark:hover:bg-surface"
              onClick={() => setShowMenu(false)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-medium">設定</span>
            </Link>

            {/* Sign out */}
            <button
              onClick={() => {
                setShowMenu(false)
                signOut()
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 hover:bg-surface dark:text-red-400 dark:hover:bg-surface"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">ログアウト</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background dark:border-border dark:bg-background lg:hidden">
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item, index) => {
            const isActive = 'href' in item && pathname === item.href
            const highlight = 'highlight' in item && item.highlight
            const showBadge = 'showBadge' in item && item.showBadge
            const isPostButton = 'isPostButton' in item && item.isPostButton

            if (isPostButton) {
              return (
                <button
                  key={`post-${index}`}
                  onClick={() => openPostModal()}
                  className="flex cursor-pointer flex-col items-center gap-1 px-3 py-2 text-accent"
                >
                  <span className="relative">{item.icon}</span>
                  <span className="text-xs">{item.label}</span>
                </button>
              )
            }

            const href = 'href' in item && item.href ? item.href : '/'
            return (
              <Link
                key={href}
                href={href as string}
                className={`flex flex-col items-center gap-1 px-3 py-2 ${
                  highlight
                    ? 'text-accent'
                    : isActive
                      ? 'text-accent'
                      : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <span className="relative">
                  {item.icon}
                  {showBadge && unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}

          {/* Profile/Menu button for authenticated users */}
          {isAuthenticated && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`flex flex-col items-center gap-1 px-3 py-2 ${
                showMenu ? 'text-accent' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div className="relative h-6 w-6 overflow-hidden rounded-full bg-gray-200 dark:bg-surface">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <svg className="h-full w-full p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs">メニュー</span>
            </button>
          )}
        </div>
      </nav>
    </>
  )
}
