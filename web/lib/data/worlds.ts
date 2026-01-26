import { createCacheClient } from '@/lib/supabase/cache'

/**
 * ワールド情報を取得
 */
export async function getWorld(worldId: string) {
  const supabase = createCacheClient()
  const { data } = await supabase
    .from('worlds')
    .select('*')
    .eq('id', worldId)
    .single()

  return data
}

/**
 * ワールドのオーナー情報を取得
 */
export async function getWorldOwner(ownerId: string) {
  const supabase = createCacheClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', ownerId)
    .single()

  return data
}

/**
 * ワールドのメンバー数を取得
 */
export async function getWorldMemberCount(worldId: string) {
  const supabase = createCacheClient()
  const { count } = await supabase
    .from('world_members')
    .select('id', { count: 'exact', head: true })
    .eq('world_id', worldId)

  return count || 0
}

/**
 * メタデータ用のワールド情報を取得
 */
export async function getWorldMetadata(worldId: string) {
  const supabase = createCacheClient()
  const { data } = await supabase
    .from('worlds')
    .select('name, description, icon_url')
    .eq('id', worldId)
    .single()

  return data
}
