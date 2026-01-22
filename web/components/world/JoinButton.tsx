'use client'

import { Button } from '@/components/ui'
import { useWorldMembership } from '@/hooks/useWorldMembership'

interface JoinButtonProps {
  worldId: string
  currentUserId: string
  initialIsMember?: boolean
  size?: 'sm' | 'md'
}

export default function JoinButton({
  worldId,
  currentUserId,
  initialIsMember = false,
  size = 'sm',
}: JoinButtonProps) {
  const { isMember, isLoading, toggleMembership } = useWorldMembership({
    worldId,
    currentUserId,
    initialIsMember,
  })

  return (
    <Button
      variant={isMember ? 'outline' : 'primary'}
      size={size}
      onClick={toggleMembership}
      disabled={isLoading}
    >
      {isLoading ? '...' : isMember ? '参加中' : '参加する'}
    </Button>
  )
}
