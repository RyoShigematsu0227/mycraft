'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmDialog } from '@/components/ui'
import { deletePost } from '@/actions'

interface DeletePostButtonProps {
  postId: string
  userId?: string
}

export default function DeletePostButton({ postId, userId }: DeletePostButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deletePost(postId, userId)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete post:', error)
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="danger"
        size="sm"
        onClick={() => setShowConfirm(true)}
      >
        削除
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="投稿を削除しますか？"
        description="この操作は取り消せません。投稿に関連するコメントやいいねも削除されます。"
        confirmText="削除する"
        loading={loading}
      />
    </>
  )
}
