'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { deleteAccount } from '@/actions'

export default function DeleteAccountButton() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setShowConfirm(false)
    setPassword('')
    setError('')
  }

  const handleDelete = async () => {
    if (!password) {
      setError('パスワードを入力してください')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
      setError('ログインしていません')
      setLoading(false)
      return
    }

    // Verify password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    })

    if (signInError) {
      setError('パスワードが正しくありません')
      setLoading(false)
      return
    }

    try {
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
      {error && !showConfirm && (
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

      {/* Custom delete confirmation dialog with password input */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />
          <div className="relative w-full max-w-md rounded-xl bg-background p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground">
              アカウントを削除しますか？
            </h2>
            <p className="mt-2 text-sm text-muted">
              この操作は取り消せません。すべての投稿、コメント、いいね、フォロー情報が完全に削除されます。
            </p>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label htmlFor="delete-password" className="block text-sm font-medium text-foreground">
                  確認のためパスワードを入力
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-accent hover:underline"
                  onClick={handleClose}
                >
                  パスワードを忘れた場合
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  id="delete-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-border dark:bg-surface"
                  placeholder="パスワード"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-muted hover:text-foreground"
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || !password}
                className="flex-1 cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
