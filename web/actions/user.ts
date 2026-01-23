'use server'

import { updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * フォローをトグル
 */
export async function toggleFollow(targetUserId: string, currentUserId: string) {
  const supabase = await createClient()

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
  const supabase = await createClient()

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
