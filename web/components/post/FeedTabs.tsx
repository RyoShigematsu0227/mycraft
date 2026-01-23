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
    <div className="sticky top-[52px] z-10 flex border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-4 py-3 text-center text-sm font-medium transition ${
            activeTab === tab.id
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
