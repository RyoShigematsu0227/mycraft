'use server'

import { updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * いいねをトグル
 */
export async function toggleLike(postId: string, userId: string) {
  const supabase = await createClient()

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) throw error
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: userId })

    if (error) throw error
  }

  // Revalidate post stats cache (即時反映)
  updateTag(`post-stats-${postId}`)

  return { liked: !existingLike }
}

/**
 * リポストをトグル
 */
export async function toggleRepost(postId: string, userId: string) {
  const supabase = await createClient()

  // Check if already reposted
  const { data: existingRepost } = await supabase
    .from('reposts')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single()

  if (existingRepost) {
    // Remove repost
    const { error } = await supabase
      .from('reposts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) throw error
  } else {
    // Repost
    const { error } = await supabase
      .from('reposts')
      .insert({ post_id: postId, user_id: userId })

    if (error) throw error
  }

  // Revalidate post stats cache (即時反映)
  updateTag(`post-stats-${postId}`)

  return { reposted: !existingRepost }
}

/**
 * 投稿を削除
 */
export async function deletePost(postId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw error

  // Revalidate caches (即時反映)
  updateTag(`post-${postId}`)
  updateTag('posts')

  return { success: true }
}

/**
 * 投稿を作成
 */
export async function createPost(data: {
  userId: string
  worldId: string | null
  content: string
  visibility: 'public' | 'world_only'
}) {
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: data.userId,
      world_id: data.worldId,
      content: data.content,
      visibility: data.visibility,
    })
    .select()
    .single()

  if (error) throw error

  // Revalidate caches (即時反映)
  updateTag('posts')
  if (data.worldId) {
    updateTag(`world-${data.worldId}`)
  }

  return post
}
