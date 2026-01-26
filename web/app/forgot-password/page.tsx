'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError('メールの送信に失敗しました。メールアドレスを確認してください。')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="rounded-md bg-accent/10 p-4">
            <h2 className="text-lg font-semibold text-accent">
              メールを送信しました
            </h2>
            <p className="mt-2 text-sm text-muted">
              パスワードリセット用のリンクをメールで送信しました。
              メールを確認してリンクをクリックしてください。
            </p>
          </div>
          <Link href="/login" className="text-accent hover:underline">
            ログインページに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">パスワードをリセット</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            登録したメールアドレスを入力してください。
            パスワードリセット用のリンクを送信します。
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-border dark:bg-surface"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow w-full rounded-md bg-gradient-to-r from-accent to-accent-secondary px-4 py-2 text-white hover:from-accent-hover hover:to-accent-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '送信中...' : 'リセットリンクを送信'}
          </button>
        </form>

        <div className="text-center">
          <Link href="/login" className="text-sm text-accent hover:underline">
            ログインページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
