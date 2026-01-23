import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * キャッシュ用Supabaseクライアント（サーバーサイドのみ）
 * - cookies()を使用しないため、"use cache"内で安全に使用可能
 * - サービスロールキーを使用してRLSをバイパス
 * - world_only投稿も含めすべてのデータを取得可能
 */
export function createCacheClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
