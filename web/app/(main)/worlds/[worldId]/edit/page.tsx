'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { WorldForm, DeleteWorldButton } from '@/components/world'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']

async function fetchWorld(worldId: string): Promise<World | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from('worlds')
    .select('*')
    .eq('id', worldId)
    .single()
  return data
}

export default function EditWorldPage() {
  const params = useParams()
  const router = useRouter()
  const worldId = params.worldId as string
  const { user, isLoading: authLoading } = useAuth()

  const { data: world, isLoading: worldLoading } = useSWR(
    worldId ? ['world', worldId] : null,
    () => fetchWorld(worldId)
  )

  // 未認証の場合はログインページへ
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  // ワールドが見つからない場合は404
  useEffect(() => {
    if (!worldLoading && world === null) {
      router.push('/404')
    }
  }, [worldLoading, world, router])

  // オーナーでない場合はワールドページへリダイレクト
  useEffect(() => {
    if (world && user && world.owner_id !== user.id) {
      router.push(`/worlds/${worldId}`)
    }
  }, [world, user, worldId, router])

  const isLoading = authLoading || worldLoading

  // loading.tsx handles initial loading state
  if (isLoading || !world || !user) {
    return null
  }

  // オーナーでない場合は表示しない
  if (world.owner_id !== user.id) {
    return null
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        ワールドを編集
      </h1>
      <div className="rounded-xl border border-border bg-surface p-6">
        <WorldForm world={world} userId={user.id} />
      </div>

      {/* Danger Zone */}
      <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/10">
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
          危険な操作
        </h2>
        <p className="mt-2 text-sm text-red-600/80 dark:text-red-400/80">
          ワールドを削除すると、すべての投稿・メンバー情報が完全に削除されます。
        </p>
        <div className="mt-4">
          <DeleteWorldButton worldId={world.id} worldName={world.name} />
        </div>
      </div>
    </div>
  )
}
