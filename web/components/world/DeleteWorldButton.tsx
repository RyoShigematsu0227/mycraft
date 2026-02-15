'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSWRConfig } from 'swr'
import { Button, ConfirmDialog } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useFeedRefreshStore } from '@/lib/stores'

interface DeleteWorldButtonProps {
  worldId: string
  worldName: string
}

export default function DeleteWorldButton({ worldId, worldName }: DeleteWorldButtonProps) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const triggerFeedRefresh = useFeedRefreshStore((state) => state.triggerRefresh)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // ワールドの情報を取得（アイコンURL）
      const { data: world } = await supabase
        .from('worlds')
        .select('icon_url')
        .eq('id', worldId)
        .single()

      // ワールドに紐づく投稿の画像を取得
      const { data: posts } = await supabase
        .from('posts')
        .select('id, user_id')
        .eq('world_id', worldId)

      if (posts && posts.length > 0) {
        const postIds = posts.map((p) => p.id)
        const { data: images } = await supabase
          .from('post_images')
          .select('image_url')
          .in('post_id', postIds)

        // 投稿画像をStorageから削除
        if (images && images.length > 0) {
          const paths = images
            .map((img) => {
              const match = img.image_url.match(/post-images\/(.+)$/)
              return match ? match[1] : null
            })
            .filter((p): p is string => p !== null)

          if (paths.length > 0) {
            await supabase.storage.from('post-images').remove(paths)
          }
        }
      }

      // ワールドアイコンをStorageから削除
      if (world?.icon_url) {
        const match = world.icon_url.match(/world-icons\/(.+)$/)
        if (match) {
          await supabase.storage.from('world-icons').remove([match[1]])
        }
      }

      // ワールドを削除（投稿もカスケード削除される）
      await supabase.from('worlds').delete().eq('id', worldId)

      // Invalidate caches
      mutate(
        (key) => Array.isArray(key) && (key[0] === 'userWorlds' || key[0] === 'worlds'),
        undefined,
        { revalidate: true }
      )

      // フィードをリフレッシュ
      triggerFeedRefresh()

      router.push('/worlds')
    } catch (error) {
      console.error('Failed to delete world:', error)
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>
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
