import { createCacheClient } from '@/lib/supabase/cache'

/**
 * ユーザープロフィールを取得
 */
export async function getUserProfile(userId: string) {
  const supabase = createCacheClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single()

  return data
}

/**
 * ユーザーIDからプロフィールを取得
 */
export async function getUserProfileById(id: string) {
  const supabase = createCacheClient()
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  return data
}

/**
 * ユーザー統計情報を取得
 */
export async function getUserStats(userId: string) {
  const supabase = createCacheClient()

  const [followersResult, followingResult, postsResult] = await Promise.all([
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  return {
    followersCount: followersResult.count || 0,
    followingCount: followingResult.count || 0,
    postsCount: postsResult.count || 0,
  }
}

/**
 * メタデータ用のユーザー情報を取得
 */
export async function getUserMetadata(userId: string) {
  const supabase = createCacheClient()
  const { data } = await supabase
    .from('users')
    .select('display_name, bio, avatar_url')
    .eq('user_id', userId)
    .single()

  return data
}
