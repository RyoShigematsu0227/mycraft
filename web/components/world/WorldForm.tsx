'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translateError } from '@/lib/utils/errorMessages'
import { Button, Input, Textarea, ImageUpload } from '@/components/ui'
import type { Database } from '@/types/database'

type World = Database['public']['Tables']['worlds']['Row']

interface WorldFormProps {
  world?: World
  userId: string
}

export default function WorldForm({ world, userId }: WorldFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!world

  const [name, setName] = useState(world?.name || '')
  const [description, setDescription] = useState(world?.description || '')
  const [howToJoin, setHowToJoin] = useState(world?.how_to_join || '')
  const [iconUrl, setIconUrl] = useState(world?.icon_url || '')
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleIconChange = (file: File | null) => {
    setIconFile(file)
    if (file) {
      setIconUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let newIconUrl = world?.icon_url || null

      // Upload icon if changed (use userId as folder prefix for RLS)
      if (iconFile) {
        const fileExt = iconFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${userId}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('world-icons')
          .upload(filePath, iconFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('world-icons')
          .getPublicUrl(filePath)

        newIconUrl = urlData.publicUrl
      }

      if (isEditing) {
        // Update existing world
        const { error: updateError } = await supabase
          .from('worlds')
          .update({
            name: name.trim(),
            description: description.trim() || null,
            how_to_join: howToJoin.trim() || null,
            icon_url: newIconUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', world.id)

        if (updateError) throw updateError

        router.push(`/worlds/${world.id}`)
      } else {
        // Create new world
        const { data: newWorld, error: insertError } = await supabase
          .from('worlds')
          .insert({
            name: name.trim(),
            description: description.trim() || null,
            how_to_join: howToJoin.trim() || null,
            icon_url: newIconUrl,
            owner_id: userId,
          })
          .select()
          .single()

        if (insertError) throw insertError

        // Owner automatically becomes a member
        await supabase.from('world_members').insert({
          world_id: newWorld.id,
          user_id: userId,
        })

        router.push(`/worlds/${newWorld.id}`)
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? translateError(err.message) : '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-start gap-6">
        <ImageUpload
          value={iconUrl}
          onChange={handleIconChange}
          className="h-24 w-24"
          aspectRatio="square"
          placeholder="アイコン"
        />
        <div className="flex-1">
          <Input
            label="ワールド名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            placeholder="My World"
          />
        </div>
      </div>

      <Textarea
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="ワールドの説明を入力してください"
        hint={`${description.length}/1000`}
      />

      <Textarea
        label="参加方法"
        value={howToJoin}
        onChange={(e) => setHowToJoin(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="ワールドへの参加方法を入力してください（サーバーアドレスなど）"
        hint={`${howToJoin.length}/500`}
      />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? '保存中...' : isEditing ? '更新する' : '作成する'}
        </Button>
      </div>
    </form>
  )
}
