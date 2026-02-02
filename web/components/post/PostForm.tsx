'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { invalidateUserPostsCache } from '@/actions'
import { useFeedRefreshStore } from '@/lib/stores'
import { Button, Textarea } from '@/components/ui'
import { WorldIcon } from '@/components/world'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']

interface PostFormProps {
  userId: string
  worlds: World[]
  defaultWorldId?: string
  onSuccess?: (worldId: string) => void
}

type Visibility = 'public' | 'world_only'

export default function PostForm({ userId, worlds, defaultWorldId, onSuccess }: PostFormProps) {
  const router = useRouter()
  const triggerRefresh = useFeedRefreshStore((state) => state.triggerRefresh)
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [content, setContent] = useState('')
  const [selectedWorldId, setSelectedWorldId] = useState(defaultWorldId || worlds[0]?.id || '')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedWorld = worlds.find((w) => w.id === selectedWorldId)

  // Reset form when restored from bfcache (browser back)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Page was restored from bfcache
        setContent('')
        setImages([])
        setImagePreviews([])
        setLoading(false)
        setError('')
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  // Cleanup preview URLs on unmount
  const imagePreviewsRef = useRef(imagePreviews)
  imagePreviewsRef.current = imagePreviews
  useEffect(() => {
    return () => {
      imagePreviewsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent any form submission that might be triggered
    e.stopPropagation()

    const files = Array.from(e.target.files || [])
    const remainingSlots = 4 - images.length
    const newFiles = files.slice(0, remainingSlots)

    if (newFiles.length === 0) return

    // Create previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))

    setImages((prev) => [...prev, ...newFiles])
    setImagePreviews((prev) => [...prev, ...newPreviews])

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double submission
    if (loading) return
    if (!content.trim() || !selectedWorldId) return

    setLoading(true)
    setError('')

    // 即座に遷移（投稿処理はバックグラウンドで実行）
    const worldIdToNavigate = selectedWorldId
    const contentToPost = content.trim()
    const visibilityToPost = visibility
    const imagesToUpload = [...images]

    // フォームはリセットせず、ローディング状態を維持
    // モーダルが閉じる時（ナビゲーション完了時）にコンポーネントがアンマウントされる

    // 即座にコールバック/遷移（モーダルは閉じない）
    if (onSuccess) {
      onSuccess(worldIdToNavigate)
    } else {
      router.push(`/worlds/${worldIdToNavigate}`)
    }

    // バックグラウンドで投稿処理
    try {
      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          world_id: worldIdToNavigate,
          content: contentToPost,
          visibility: visibilityToPost,
        })
        .select()
        .single()

      if (postError) throw postError

      // Upload images
      if (imagesToUpload.length > 0) {
        const imagePromises = imagesToUpload.map(async (file, index) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${post.id}/${index}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(`${userId}/${fileName}`, file)

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage
            .from('post-images')
            .getPublicUrl(`${userId}/${fileName}`)

          return {
            post_id: post.id,
            image_url: urlData.publicUrl,
            display_order: index,
          }
        })

        const imageData = await Promise.all(imagePromises)

        const { error: imagesError } = await supabase.from('post_images').insert(imageData)

        if (imagesError) throw imagesError
      }

      // キャッシュ無効化
      await invalidateUserPostsCache(userId)

      // フィードをリフレッシュ
      triggerRefresh()
    } catch (err) {
      console.error('Post creation error:', err)
      // バックグラウンドエラーはコンソールに記録（既に遷移済みのため）
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* World selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ワールド:</label>
        <select
          value={selectedWorldId}
          onChange={(e) => setSelectedWorldId(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
        >
          {worlds.map((world) => (
            <option key={world.id} value={world.id}>
              {world.name}
            </option>
          ))}
        </select>
        {selectedWorld && (
          <WorldIcon
            worldId={selectedWorld.id}
            iconUrl={selectedWorld.icon_url}
            name={selectedWorld.name}
            size="sm"
            showLink={false}
          />
        )}
      </div>

      {/* Visibility selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">公開範囲:</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm"
        >
          <option value="public">全体公開</option>
          <option value="world_only">ワールド限定</option>
        </select>
      </div>

      {/* Content */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            if (content.trim() && selectedWorldId && !loading) {
              handleSubmit(e)
            }
          }
        }}
        placeholder="今日はどんなことがあった？"
        rows={4}
        maxLength={1000}
        hint={`${content.length}/1000`}
      />

      {/* Image previews */}
      {imagePreviews.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={preview}
                alt=""
                fill
                className="rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-4 dark:border-border">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= 4}
            className="rounded-full p-2 text-muted hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 dark:text-muted dark:hover:bg-surface"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            {images.length}/4
          </span>
        </div>
        <Button type="submit" disabled={loading || !content.trim() || !selectedWorldId}>
          {loading ? '投稿中...' : '投稿する'}
        </Button>
      </div>
    </form>
  )
}
