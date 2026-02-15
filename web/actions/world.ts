'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * ワールド参加をトグル
 */
export async function toggleWorldMembership(worldId: string, userId: string) {
  const supabase = await createClient()

  // Check if already a member
  const { data: existingMembership } = await supabase
    .from('world_members')
    .select('id')
    .eq('world_id', worldId)
    .eq('user_id', userId)
    .single()

  if (existingMembership) {
    // Leave world
    const { error } = await supabase
      .from('world_members')
      .delete()
      .eq('world_id', worldId)
      .eq('user_id', userId)

    if (error) throw error
  } else {
    // Join world
    const { error } = await supabase.from('world_members').insert({
      world_id: worldId,
      user_id: userId,
    })

    if (error) throw error
  }

  // Revalidate caches (即時反映)
  revalidatePath('/worlds')
  revalidatePath(`/worlds/${worldId}`)

  return { isMember: !existingMembership }
}

/**
 * ワールドを作成
 */
export async function createWorld(data: {
  name: string
  description?: string
  howToJoin?: string
  iconUrl?: string
  ownerId: string
}) {
  const supabase = await createClient()

  const { data: world, error } = await supabase
    .from('worlds')
    .insert({
      name: data.name,
      description: data.description || null,
      how_to_join: data.howToJoin || null,
      icon_url: data.iconUrl || null,
      owner_id: data.ownerId,
    })
    .select()
    .single()

  if (error) throw error

  // Owner automatically becomes a member
  await supabase.from('world_members').insert({
    world_id: world.id,
    user_id: data.ownerId,
  })

  // Revalidate worlds list (即時反映)
  revalidatePath('/worlds')

  return world
}

/**
 * ワールドを更新
 */
export async function updateWorld(
  worldId: string,
  data: {
    name?: string
    description?: string
    howToJoin?: string
    iconUrl?: string
  }
) {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.howToJoin !== undefined) updateData.how_to_join = data.howToJoin
  if (data.iconUrl !== undefined) updateData.icon_url = data.iconUrl
  updateData.updated_at = new Date().toISOString()

  const { error } = await supabase.from('worlds').update(updateData).eq('id', worldId)

  if (error) throw error

  // Revalidate caches (即時反映)
  revalidatePath('/worlds')
  revalidatePath(`/worlds/${worldId}`)

  return { success: true }
}
