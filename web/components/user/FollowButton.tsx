'use client'

import { Button } from '@/components/ui'
import { useFollow } from '@/hooks/useFollow'

interface FollowButtonProps {
  targetUserId: string
  currentUserId?: string
  initialFollowing?: boolean
  size?: 'sm' | 'md'
}

export default function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing,
  size = 'sm',
}: FollowButtonProps) {
  const { isFollowing, isLoading, toggleFollow } = useFollow({
    targetUserId,
    currentUserId,
    initialFollowing,
  })

  if (currentUserId && targetUserId === currentUserId) {
    return null
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'primary'}
      size={size}
      onClick={toggleFollow}
      disabled={isLoading}
    >
      {isLoading ? '...' : isFollowing ? 'フォロー中' : 'フォローする'}
    </Button>
  )
}
