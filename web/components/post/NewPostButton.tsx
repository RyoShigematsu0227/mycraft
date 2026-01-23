'use client'

import { Button } from '@/components/ui'
import { usePostModalStore } from '@/lib/stores'

interface NewPostButtonProps {
  worldId?: string
}

export default function NewPostButton({ worldId }: NewPostButtonProps) {
  const openModal = usePostModalStore((state) => state.openModal)

  return (
    <Button size="sm" onClick={() => openModal(worldId)}>
      投稿する
    </Button>
  )
}
