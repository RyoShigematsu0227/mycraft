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
    const { error } = await supabase
      .from('follows')
      .insert({
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
  if (data.minecraftJavaUsername !== undefined) updateData.minecraft_java_username = data.minecraftJavaUsername
  if (data.minecraftBedrockGamertag !== undefined) updateData.minecraft_bedrock_gamertag = data.minecraftBedrockGamertag

  const { data: user } = await supabase
    .from('users')
    .select('user_id')
    .eq('id', userId)
    .single()

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)

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

  // public.usersから削除（カスケードで関連データも削除）
  const { error: deleteUserError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId)

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
