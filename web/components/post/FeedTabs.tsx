'use client'

import type { FeedType } from '@/hooks/useFeed'

interface FeedTabsProps {
  activeTab: FeedType
  onTabChange: (tab: FeedType) => void
  showFollowing?: boolean
}

export default function FeedTabs({ activeTab, onTabChange, showFollowing = true }: FeedTabsProps) {
  const tabs: { id: FeedType; label: string }[] = [
    { id: 'latest', label: '新着' },
    { id: 'recommended', label: 'おすすめ' },
    ...(showFollowing ? [{ id: 'following' as FeedType, label: 'フォロー中' }] : []),
  ]

  return (
    <div className="sticky top-[52px] z-10 flex border-b border-border bg-background/80 backdrop-blur-md dark:border-border dark:bg-background/80">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex-1 px-4 py-3.5 text-center text-sm font-semibold transition-colors duration-200 ${
            activeTab === tab.id
              ? 'text-accent'
              : 'text-muted hover:bg-surface hover:text-foreground dark:text-muted dark:hover:bg-surface/50 dark:hover:text-foreground'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-accent" />
          )}
        </button>
      ))}
    </div>
  )
}
