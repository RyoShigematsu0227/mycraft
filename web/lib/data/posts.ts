import { createCacheClient } from '@/lib/supabase/cache'

/**
 * 投稿情報を取得
 */
export async function getPost(postId: string) {
  const supabase = createCacheClient()
  const { data } = await supabase
    .from('posts')
    .select(
      `
      *,
      user:users!posts_user_id_fkey(*),
      world:worlds!posts_world_id_fkey(*),
      images:post_images(*)
    `
    )
    .eq('id', postId)
    .single()

  return data
}

/**
 * 投稿の統計情報を取得
 */
export async function getPostStats(postId: string) {
  const supabase = createCacheClient()

  const [likesResult, repostsResult, commentsResult] = await Promise.all([
    supabase.from('likes').select('id', { count: 'exact', head: true }).eq('post_id', postId),
    supabase.from('reposts').select('id', { count: 'exact', head: true }).eq('post_id', postId),
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', postId),
  ])

  return {
    likesCount: likesResult.count || 0,
    repostsCount: repostsResult.count || 0,
    commentsCount: commentsResult.count || 0,
  }
}

/**
 * メタデータ用の投稿情報を取得
 */
export async function getPostMetadata(postId: string) {
  const supabase = createCacheClient()
  const { data } = await supabase
    .from('posts')
    .select(
      `
      content,
      visibility,
      user:users!posts_user_id_fkey(display_name, user_id),
      images:post_images(image_url)
    `
    )
    .eq('id', postId)
    .single()

  return data
}
