'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert } from '@/types/database'

export default function SetupForm() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingUserId, setCheckingUserId] = useState(false)
  const [userIdAvailable, setUserIdAvailable] = useState<boolean | null>(null)

  // OAuthプロバイダーからプロフィール情報を取得
  useEffect(() => {
    async function fetchOAuthProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.user_metadata) {
        // アバターURL（Google: picture or avatar_url, Discord: avatar_url）
        const avatar = user.user_metadata.avatar_url || user.user_metadata.picture
        if (avatar) setAvatarUrl(avatar)

        // 表示名（Google: full_name or name, Discord: full_name）
        const name = user.user_metadata.full_name || user.user_metadata.name
        if (name && !displayName) setDisplayName(name)
      }
    }
    fetchOAuthProfile()
  }, [])

  const validateUserId = (value: string) => {
    // Only alphanumeric and underscore, 3-30 characters
    return /^[a-zA-Z0-9_]{3,30}$/.test(value)
  }

  const checkUserIdAvailability = async (value: string) => {
    if (!validateUserId(value)) {
      setUserIdAvailable(null)
      return
    }

    setCheckingUserId(true)
    const supabase = createClient()
    const { data } = await supabase.from('users').select('user_id').eq('user_id', value).single()

    setUserIdAvailable(data === null)
    setCheckingUserId(false)
  }

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setUserId(value)

    // Debounce the availability check
    const timeoutId = setTimeout(() => {
      checkUserIdAvailability(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateUserId(userId)) {
      setError('ユーザーIDは英数字とアンダースコアのみ、3〜30文字で入力してください')
      return
    }

    if (!displayName.trim()) {
      setError('表示名を入力してください')
      return
    }

    if (userIdAvailable === false) {
      setError('このユーザーIDは既に使用されています')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('認証エラーが発生しました')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      user_id: userId,
      display_name: displayName.trim(),
      avatar_url: avatarUrl,
    } as TablesInsert<'users'>)

    if (insertError) {
      if (insertError.code === '23505') {
        setError('このユーザーIDは既に使用されています')
      } else {
        setError(insertError.message)
      }
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">プロフィール設定</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          MyCraftで使用するプロフィールを設定してください
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* アバタープレビュー */}
        {avatarUrl && (
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-accent/20">
              <Image
                src={avatarUrl}
                alt="プロフィール画像"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="text-xs text-muted">プロフィール画像を引き継ぎます</p>
          </div>
        )}

        <div>
          <label htmlFor="userId" className="block text-sm font-medium">
            ユーザーID
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={handleUserIdChange}
              required
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              className="w-full rounded-md border border-border bg-background py-2 pl-8 pr-3 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-border dark:bg-surface"
              placeholder="your_username"
            />
          </div>
          <div className="mt-1 flex items-center gap-2">
            {checkingUserId && (
              <span className="text-xs text-gray-500">確認中...</span>
            )}
            {!checkingUserId && userIdAvailable === true && (
              <span className="text-xs text-green-600 dark:text-green-400">
                このユーザーIDは使用できます
              </span>
            )}
            {!checkingUserId && userIdAvailable === false && (
              <span className="text-xs text-red-600 dark:text-red-400">
                このユーザーIDは既に使用されています
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            英数字とアンダースコアのみ、3〜30文字
          </p>
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium">
            表示名
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={50}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-border dark:bg-surface"
            placeholder="Your Name"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">最大50文字</p>
        </div>

        <button
          type="submit"
          disabled={loading || userIdAvailable === false}
          className="btn-glow w-full cursor-pointer rounded-md bg-gradient-to-r from-accent to-accent-secondary px-4 py-2 text-white hover:from-accent-hover hover:to-accent-secondary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '設定中...' : '設定を完了'}
        </button>
      </form>
    </div>
  )
}
