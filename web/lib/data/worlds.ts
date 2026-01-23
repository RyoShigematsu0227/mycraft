import { cacheTag } from 'next/cache'
import { createCacheClient } from '@/lib/supabase/cache'

/**
 * ワールド情報を取得（キャッシュ付き）
 */
export async function getWorld(worldId: string) {
  'use cache'
  cacheTag(`world-${worldId}`)
  cacheTag('worlds')

  const supabase = createCacheClient()
  const { data } = await supabase
    .from('worlds')
    .select('*')
    .eq('id', worldId)
    .single()

  return data
}

/**
 * ワールドのオーナー情報を取得（キャッシュ付き）
 */
export async function getWorldOwner(ownerId: string) {
  'use cache'
  cacheTag(`user-id-${ownerId}`)

  const supabase = createCacheClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', ownerId)
    .single()

  return data
}

/**
 * ワールドのメンバー数を取得（キャッシュ付き）
 */
export async function getWorldMemberCount(worldId: string) {
  'use cache'
  cacheTag(`world-stats-${worldId}`)

  const supabase = createCacheClient()
  const { count } = await supabase
    .from('world_members')
    .select('id', { count: 'exact', head: true })
    .eq('world_id', worldId)

  return count || 0
}

/**
 * メタデータ用のワールド情報を取得（キャッシュ付き）
 */
export async function getWorldMetadata(worldId: string) {
  'use cache'
  cacheTag(`world-${worldId}`)

  const supabase = createCacheClient()
  const { data } = await supabase
    .from('worlds')
    .select('name, description, icon_url')
    .eq('id', worldId)
    .single()

  return data
}
