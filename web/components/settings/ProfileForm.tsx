'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { translateError } from '@/lib/utils/errorMessages'
import { Button, Input, Textarea, ImageUpload } from '@/components/ui'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface ProfileFormProps {
  user: User
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState(user.display_name)
  const [bio, setBio] = useState(user.bio || '')
  const [minecraftJavaUsername, setMinecraftJavaUsername] = useState(
    user.minecraft_java_username || ''
  )
  const [minecraftBedrockGamertag, setMinecraftBedrockGamertag] = useState(
    user.minecraft_bedrock_gamertag || ''
  )
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarRemoved, setAvatarRemoved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file)
    setAvatarRemoved(false)
    if (file) {
      setAvatarUrl(URL.createObjectURL(file))
    }
  }

  const handleAvatarRemove = () => {
    setAvatarFile(null)
    setAvatarUrl('')
    setAvatarRemoved(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      let newAvatarUrl = user.avatar_url

      // Handle avatar removal
      if (avatarRemoved) {
        // Delete old avatar from storage if exists
        if (user.avatar_url) {
          const oldPath = user.avatar_url.split('/avatars/')[1]
          if (oldPath) {
            await supabase.storage.from('avatars').remove([oldPath])
          }
        }
        newAvatarUrl = null
      }
      // Upload new avatar if changed
      else if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const filePath = `${user.id}/avatar.${fileExt}`

        // Delete old avatar first if it exists with different extension
        if (user.avatar_url) {
          const oldPath = user.avatar_url.split('/avatars/')[1]
          if (oldPath && oldPath !== filePath) {
            await supabase.storage.from('avatars').remove([oldPath])
          }
        }

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        newAvatarUrl = urlData.publicUrl
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          minecraft_java_username: minecraftJavaUsername.trim() || null,
          minecraft_bedrock_gamertag: minecraftBedrockGamertag.trim() || null,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setAvatarFile(null)
      setAvatarRemoved(false)
      router.refresh()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? translateError(err.message) : '更新に失敗しました')
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

      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
          プロフィールを保存しました
        </div>
      )}

      <div className="flex items-start gap-6">
        <ImageUpload
          value={avatarUrl}
          onChange={handleAvatarChange}
          onRemove={handleAvatarRemove}
          className="h-24 w-24"
          aspectRatio="square"
          enableCrop
        />
        <div className="flex-1">
          <Input
            label="表示名"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={50}
          />
        </div>
      </div>

      <Textarea
        label="自己紹介"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
        maxLength={500}
        hint={`${bio.length}/500`}
      />

      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <h3 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
          Minecraft アカウント
        </h3>
        <div className="space-y-4">
          <Input
            label="Java Edition ユーザー名"
            value={minecraftJavaUsername}
            onChange={(e) => setMinecraftJavaUsername(e.target.value)}
            placeholder="Steve"
            hint="Minecraft Java Editionのユーザー名"
          />
          <Input
            label="Bedrock Edition ゲーマータグ"
            value={minecraftBedrockGamertag}
            onChange={(e) => setMinecraftBedrockGamertag(e.target.value)}
            placeholder="Steve1234"
            hint="Minecraft Bedrock Editionのゲーマータグ"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !displayName.trim()}>
          {loading ? '保存中...' : '保存する'}
        </Button>
      </div>
    </form>
  )
}
