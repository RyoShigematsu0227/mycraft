'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfirmDialog } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { deleteAccount } from '@/actions'

export default function DeleteAccountButton() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ログインしていません')
      }

      // Delete account (both public.users and auth.users)
      await deleteAccount(user.id)

      // Sign out locally
      await supabase.auth.signOut()

      // Redirect to home
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Failed to delete account:', err)
      setError(err instanceof Error ? err.message : 'アカウントの削除に失敗しました')
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      <Button
        variant="danger"
        size="sm"
        onClick={() => setShowConfirm(true)}
      >
        アカウントを削除
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="アカウントを削除しますか？"
        description="この操作は取り消せません。すべての投稿、コメント、いいね、フォロー情報が完全に削除されます。"
        confirmText="削除する"
        loading={loading}
      />
    </>
  )
}
