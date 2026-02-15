'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { UserAvatar, FollowButton } from '@/components/user'
import { Button } from '@/components/ui'

interface UserProfileHeaderProps {
  userId: string
  userIdSlug: string
  avatarUrl: string | null
  displayName: string
  isOwnProfile: boolean
  currentUserId?: string
  isFollowing: boolean
  children: ReactNode
}

export default function UserProfileHeader({
  userId,
  userIdSlug,
  avatarUrl,
  displayName,
  isOwnProfile,
  currentUserId,
  isFollowing,
  children,
}: UserProfileHeaderProps) {
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
          isCompact
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-2">
          <UserAvatar
            userId={userIdSlug}
            avatarUrl={avatarUrl}
            displayName={displayName}
            size="sm"
            showLink={false}
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-foreground">{displayName}</h2>
            <p className="text-xs text-muted">@{userIdSlug}</p>
          </div>
          <div className="shrink-0">
            {isOwnProfile ? (
              <Link href="/settings/profile">
                <Button variant="outline" size="sm">
                  編集
                </Button>
              </Link>
            ) : currentUserId ? (
              <FollowButton
                targetUserId={userId}
                currentUserId={currentUserId}
                initialFollowing={isFollowing}
                size="sm"
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Full Header */}
      <div ref={headerRef}>{children}</div>
    </>
  )
}
