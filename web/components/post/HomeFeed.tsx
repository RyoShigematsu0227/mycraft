'use client'

import { useState } from 'react'
import FeedTabs from './FeedTabs'
import InfiniteFeed from './InfiniteFeed'
import type { FeedType } from '@/hooks/useFeed'

interface HomeFeedProps {
  currentUserId?: string
}

export default function HomeFeed({ currentUserId }: HomeFeedProps) {
  const [activeTab, setActiveTab] = useState<FeedType>('latest')

  return (
    <div>
      <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} showFollowing={!!currentUserId} />
      <InfiniteFeed key={activeTab} type={activeTab} currentUserId={currentUserId} />
    </div>
  )
}
