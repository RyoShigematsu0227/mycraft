'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmDialog } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

interface DeleteWorldButtonProps {
  worldId: string
  worldName: string
}

export default function DeleteWorldButton({ worldId, worldName }: DeleteWorldButtonProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('worlds').delete().eq('id', worldId)
      router.push('/worlds')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete world:', error)
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
        ワールドを削除
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title={`「${worldName}」を削除しますか？`}
        description="この操作は取り消せません。ワールドに関連する投稿やメンバー情報も削除されます。"
        confirmText="削除する"
        loading={loading}
      />
    </>
  )
}
