'use server'

import { updateTag } from 'next/cache'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

/**
 * フォローをトグル
 */
export async function toggleFollow(targetUserId: string, currentUserId: string) {
  const supabase = await createServerClient()

  // Check if already following
  const { data: existingFollow } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', currentUserId)
    .eq('following_id', targetUserId)
    .single()

  if (existingFollow) {
    // Unfollow
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)

    if (error) throw error
  } else {
    // Follow
    const { error } = await supabase.from('follows').insert({
      follower_id: currentUserId,
      following_id: targetUserId,
    })

    if (error) throw error
  }

  // Revalidate user stats caches (即時反映)
  updateTag(`user-stats-${targetUserId}`)
  updateTag(`user-stats-${currentUserId}`)

  return { following: !existingFollow }
}

/**
 * プロフィールを更新
 */
export async function updateProfile(
  userId: string,
  data: {
    displayName?: string
    bio?: string
    avatarUrl?: string
    minecraftJavaUsername?: string
    minecraftBedrockGamertag?: string
  }
) {
  const supabase = await createServerClient()

  const updateData: Record<string, unknown> = {}
  if (data.displayName !== undefined) updateData.display_name = data.displayName
  if (data.bio !== undefined) updateData.bio = data.bio
  if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl
  if (data.minecraftJavaUsername !== undefined)
    updateData.minecraft_java_username = data.minecraftJavaUsername
  if (data.minecraftBedrockGamertag !== undefined)
    updateData.minecraft_bedrock_gamertag = data.minecraftBedrockGamertag

  const { data: user } = await supabase.from('users').select('user_id').eq('id', userId).single()

  const { error } = await supabase.from('users').update(updateData).eq('id', userId)

  if (error) throw error

  // Revalidate user cache (即時反映)
  if (user?.user_id) {
    updateTag(`user-${user.user_id}`)
  }
  updateTag(`user-id-${userId}`)

  return { success: true }
}

/**
 * アカウントを完全に削除（auth.usersからも削除）
 */
export async function deleteAccount(userId: string) {
  // サービスロールキーを使用してadminクライアントを作成
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ユーザーの情報を取得（アバターURL）
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('avatar_url')
    .eq('id', userId)
    .single()

  // ユーザーの投稿画像を取得して削除
  const { data: posts } = await supabaseAdmin.from('posts').select('id').eq('user_id', userId)

  if (posts && posts.length > 0) {
    const postIds = posts.map((p) => p.id)
    const { data: images } = await supabaseAdmin
      .from('post_images')
      .select('image_url')
      .in('post_id', postIds)

    if (images && images.length > 0) {
      const paths = images
        .map((img) => {
          const match = img.image_url.match(/post-images\/(.+)$/)
          return match ? match[1] : null
        })
        .filter((p): p is string => p !== null)

      if (paths.length > 0) {
        await supabaseAdmin.storage.from('post-images').remove(paths)
      }
    }
  }

  // ユーザーが所有するワールドのアイコンを取得して削除
  const { data: worlds } = await supabaseAdmin
    .from('worlds')
    .select('icon_url')
    .eq('owner_id', userId)

  if (worlds && worlds.length > 0) {
    const iconPaths = worlds
      .map((w) => {
        if (!w.icon_url) return null
        const match = w.icon_url.match(/world-icons\/(.+)$/)
        return match ? match[1] : null
      })
      .filter((p): p is string => p !== null)

    if (iconPaths.length > 0) {
      await supabaseAdmin.storage.from('world-icons').remove(iconPaths)
    }
  }

  // アバターをStorageから削除
  if (user?.avatar_url) {
    const match = user.avatar_url.match(/avatars\/(.+?)(\?|$)/)
    if (match) {
      await supabaseAdmin.storage.from('avatars').remove([match[1]])
    }
  }

  // public.usersから削除（カスケードで関連データも削除）
  const { error: deleteUserError } = await supabaseAdmin.from('users').delete().eq('id', userId)

  if (deleteUserError) {
    throw new Error(`ユーザーデータの削除に失敗しました: ${deleteUserError.message}`)
  }

  // auth.usersから削除
  const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (deleteAuthError) {
    throw new Error(`認証情報の削除に失敗しました: ${deleteAuthError.message}`)
  }

  return { success: true }
}
