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
    <div className="sticky top-[52px] z-10 flex border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex-1 px-4 py-3.5 text-center text-sm font-semibold transition-colors duration-200 ${
            activeTab === tab.id
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-300'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
          )}
        </button>
      ))}
    </div>
  )
}
