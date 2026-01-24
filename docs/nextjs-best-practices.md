# Next.js App Router SNSアプリ ベストプラクティス (2026年版)

本ドキュメントは、Next.js 16 App Routerを使用したSNSアプリケーション開発におけるベストプラクティスをまとめたものです。

## 目次

1. [レンダリング戦略](#1-レンダリング戦略)
2. [データフェッチング](#2-データフェッチング)
3. [キャッシュ戦略（Cache Components）](#3-キャッシュ戦略cache-components)
4. [無限スクロール](#4-無限スクロール)
5. [楽観的更新](#5-楽観的更新)
6. [リアルタイム更新](#6-リアルタイム更新)
7. [認証](#7-認証)
8. [SNS各機能のベストプラクティス](#8-sns各機能のベストプラクティス)

---

## 1. レンダリング戦略

### Server Components vs Client Components

Next.js App Routerでは、デフォルトですべてのコンポーネントがServer Componentsです。

#### Server Components を使う場面

- データフェッチング（DB/API呼び出し）
- 環境変数やシークレットへのアクセス
- 重いライブラリの使用（バンドルサイズ削減）
- SEOが重要なコンテンツ
- 静的なUI（レイアウト、ヘッダー、フッター）

#### Client Components を使う場面（`'use client'`）

- インタラクティブなUI（onClick, onChange）
- 状態管理（useState, useReducer）
- ライフサイクル（useEffect）
- ブラウザAPI（localStorage, window, geolocation）
- アニメーション、フォーカス管理

#### 設計原則

```
Server Component（親）
  └── Client Component（子・葉ノード）
```

**Client Componentsは「葉」に配置する**。データは親のServer Componentで取得し、propsで渡す。

### Cache Components + Partial Prerendering

Next.js 16では、PPRが Cache Components に統合されました。静的シェルをビルド時にプリレンダリングし、動的部分はストリーミング。

```tsx
// next.config.ts
import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  cacheComponents: true,  // Cache Components を有効化
}
export default nextConfig
```

```tsx
// app/page.tsx
import { Suspense } from "react"

export default function Page() {
  return (
    <>
      <StaticHeader />  {/* ビルド時にレンダリング */}
      <Suspense fallback={<FeedSkeleton />}>
        <DynamicFeed />  {/* リクエスト時にストリーミング */}
      </Suspense>
    </>
  )
}
```

**SNSでの活用例**:
- ヘッダー、ナビゲーション → 静的（`use cache`でキャッシュ）
- フィード、通知バッジ → 動的（Suspenseでラップ）

---

## 2. データフェッチング

### Server Actions vs Route Handlers

| 用途 | 推奨手法 |
|------|----------|
| データの書き込み（mutations） | Server Actions |
| データの読み取り（queries） | Server Component内でfetch / Route Handlers |
| Client Componentからの読み取り | Route Handlers (GET) |
| 外部からのWebhook受信 | Route Handlers |

#### Server Actions

- POST専用（内部的に）
- 型安全なRPC風呼び出し
- `updateTag` / `revalidateTag` でキャッシュ無効化

```tsx
// actions/post.ts
'use server'

import { updateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  // DB書き込み
  await db.posts.create({ ... })

  // キャッシュ無効化（即時反映）
  updateTag('posts')
}
```

#### Route Handlers

- 複数HTTPメソッド対応
- GETリクエストはキャッシュ可能
- 外部API向け

```tsx
// app/api/posts/route.ts
export async function GET(request: Request) {
  const posts = await db.posts.findMany()
  return Response.json(posts)
}
```

---

## 3. キャッシュ戦略（Cache Components）

### Next.js 16のキャッシュモデル

Next.js 16では、キャッシュが**完全にオプトイン**になりました。`"use cache"` ディレクティブで明示的にキャッシュを指定します。

- **fetchはデフォルトでキャッシュされない**
- `"use cache"` でページ、コンポーネント、関数をキャッシュ
- `cacheTag` でタグ付け、`updateTag` / `revalidateTag` で無効化

### 基本的な使い方

```tsx
// キャッシュされる関数
import { cacheTag } from 'next/cache'

export async function getProducts() {
  'use cache'
  cacheTag('products')
  const products = await db.query('SELECT * FROM products')
  return products
}
```

### キャッシュ無効化API

Next.js 16では3つの無効化APIがあります：

| API | 用途 | 特徴 |
|-----|------|------|
| `updateTag()` | Server Actions専用 | 即時反映（read-your-writes） |
| `revalidateTag()` | Server Actions / Route Handlers | 次のリクエストで反映 |
| `refresh()` | Server Actions | キャッシュされていない動的データの更新 |

```tsx
'use server'
import { updateTag, revalidateTag, refresh } from 'next/cache'

// ユーザーが自分の変更を即座に見る必要がある場合
export async function updateProfile(data: ProfileData) {
  await db.users.update(data)
  updateTag('user-profile')  // 即時反映
}

// 他のユーザーへの反映は遅延しても良い場合
export async function publishPost(data: PostData) {
  await db.posts.create(data)
  revalidateTag('posts')  // 次のリクエストで反映
}

// 通知バッジなどキャッシュされていない動的データの更新
export async function markNotificationRead(id: string) {
  await db.notifications.markAsRead(id)
  refresh()  // 動的データを更新（通知カウントなど）
}
```

### SNS各機能のキャッシュ設計

```tsx
// ユーザープロフィール
export async function getUserProfile(userId: string) {
  'use cache'
  cacheTag(`user-${userId}`)
  return await db.users.findUnique({ where: { id: userId } })
}

// 投稿詳細
export async function getPost(postId: string) {
  'use cache'
  cacheTag(`post-${postId}`)
  cacheTag('posts')
  return await db.posts.findUnique({ where: { id: postId } })
}

// ワールド情報
export async function getWorld(worldId: string) {
  'use cache'
  cacheTag(`world-${worldId}`)
  return await db.worlds.findUnique({ where: { id: worldId } })
}
```

### SNS各機能のキャッシュ方針

| 機能 | キャッシュ | 無効化API |
|------|-----------|-----------|
| ユーザープロフィール | `use cache` + タグ | `updateTag` (即時) |
| フィード | キャッシュなし | - |
| 投稿詳細 | `use cache` + タグ | `revalidateTag` |
| ワールド情報 | `use cache` + タグ | `revalidateTag` |
| 通知カウント | キャッシュなし | `refresh()` |

---

## 4. 無限スクロール

> **Note**: 本プロジェクトではTanStack QueryではなくSWR（useSWRInfinite）を採用しています。
> 以下はTanStack Queryでの参考実装です。SWRでも同様のパターンで実装可能です。

### TanStack Query + useInfiniteQuery

SNSフィードには `useInfiniteQuery` が最適。

```tsx
// hooks/useFeed.ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/feed?cursor=${pageParam}`)
      return res.json()
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 1000 * 60, // 1分
  })
}
```

### Intersection Observer連携

```tsx
// components/InfiniteFeed.tsx
import { useInView } from 'react-intersection-observer'

export function InfiniteFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed()
  const { ref, inView } = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage])

  return (
    <>
      {data?.pages.map(page =>
        page.posts.map(post => <PostCard key={post.id} post={post} />)
      )}
      <div ref={ref} /> {/* 監視ポイント */}
    </>
  )
}
```

### メモリ管理

長時間のスクロールでメモリ肥大を防ぐ:

```tsx
useInfiniteQuery({
  // ...
  maxPages: 10, // 最大10ページ保持
})
```

---

## 5. 楽観的更新

いいね、リポストなど高頻度アクションに適用。

### useOptimistic + Server Actions

```tsx
// components/LikeButton.tsx
'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleLike } from '@/actions/like'

export function LikeButton({ postId, initialLiked, initialCount }) {
  const [isPending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: state.count + (newLiked ? 1 : -1)
    })
  )

  const handleClick = () => {
    startTransition(async () => {
      setOptimistic(!optimistic.liked)
      await toggleLike(postId)
    })
  }

  return (
    <button onClick={handleClick} disabled={isPending}>
      {optimistic.liked ? '❤️' : '🤍'} {optimistic.count}
    </button>
  )
}
```

### 適用すべき/すべきでないアクション

**楽観的更新向き**:
- いいね/解除
- リポスト
- フォロー/解除
- ブックマーク

**楽観的更新不向き**:
- 投稿作成（失敗時のリスク高）
- 削除（取り消し困難）
- 認証関連

---

## 6. リアルタイム更新

### Supabase Realtime

```tsx
// hooks/useNotifications.ts
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

export function useRealtimeNotifications(userId: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // キャッシュを無効化して再フェッチ
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, queryClient])
}
```

### Row Level Security (RLS)

```sql
-- 自分の通知のみ購読可能
CREATE POLICY "Users can subscribe to own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);
```

---

## 7. 認証

### Supabase Auth + Next.js App Router

#### クライアント設定

```tsx
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```tsx
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

#### 重要なセキュリティルール

```tsx
// ❌ 危険: getSession()をServer Componentで信頼しない
const { data: { session } } = await supabase.auth.getSession()

// ✅ 安全: getUser()を使用（毎回サーバー検証）
const { data: { user } } = await supabase.auth.getUser()
```

**`getSession()` はCookieから読むだけで検証しない。`getUser()` は必ずSupabase Authサーバーに問い合わせる。**

#### Proxy（セッション更新）- Next.js 16

Next.js 16では `middleware.ts` が `proxy.ts` に変更されました。

```tsx
// proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // セッション更新（重要）
  supabase.auth.getUser()

  return response
}
```

**移行方法**: `middleware.ts` → `proxy.ts` にリネーム、エクスポート関数名を `middleware` → `proxy` に変更。

---

## 8. SNS各機能のベストプラクティス

### フィード

| 項目 | 推奨 |
|------|------|
| レンダリング | Client Component（無限スクロール） |
| データ取得 | SWR `useSWRInfinite` ※本プロジェクト採用 |
| キャッシュ | dedupingInterval: 2秒 |
| ページネーション | カーソルベース（timestamp） |

### 投稿詳細

| 項目 | 推奨 |
|------|------|
| レンダリング | Server Component + Cache Components |
| 静的部分 | 投稿本文、画像、著者情報（`use cache`） |
| 動的部分 | いいね数、コメント一覧（Suspense） |
| キャッシュ | `cacheTag` + `revalidateTag` |

### いいね・リポスト

| 項目 | 推奨 |
|------|------|
| レンダリング | Client Component |
| 更新方式 | 楽観的更新 + Server Actions |
| 状態管理 | useOptimistic + useTransition |
| エラー時 | ロールバック + トースト通知 |

### 通知

| 項目 | 推奨 |
|------|------|
| レンダリング | Client Component |
| リアルタイム | Supabase Realtime |
| 初期データ | Server Componentでプリフェッチ |
| 未読管理 | DB + `refresh()` で即時更新 |

### ユーザープロフィール

| 項目 | 推奨 |
|------|------|
| レンダリング | Server Component（基本情報） |
| 投稿一覧 | Client Component（無限スクロール） |
| フォローボタン | Client Component（楽観的更新） |
| キャッシュ | `use cache` + `updateTag` (即時) |

### コメント

| 項目 | 推奨 |
|------|------|
| レンダリング | Client Component |
| 投稿 | Server Actions |
| 更新 | 楽観的更新（新規追加のみ） |
| ソート | 新しい順 or 古い順（選択可能） |

### 検索

| 項目 | 推奨 |
|------|------|
| レンダリング | Client Component |
| デバウンス | 300ms |
| キャッシュ | TanStack Queryで自動キャッシュ |
| UI | Suspenseでローディング表示 |

---

## Next.js 16 主な変更点まとめ

| 項目 | Next.js 15 | Next.js 16 |
|------|------------|------------|
| キャッシュ | 暗黙的（予測困難） | 明示的（`use cache`） |
| PPR | `experimental.ppr` フラグ | Cache Componentsに統合 |
| Middleware | `middleware.ts` | `proxy.ts` |
| キャッシュ無効化 | `revalidateTag` | `updateTag`（即時）/ `revalidateTag` |
| 動的データ更新 | `router.refresh()` | `refresh()`（Server Actions） |
| React | React 19 | React 19.2 |
| Node.js | 18.17+ | 20.9.0+ |

---

## 参考リンク

### 公式ドキュメント
- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [Next.js Cache Components](https://nextjs.org/docs/app/getting-started/cache-components)
- [Next.js use cache Directive](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [Next.js cacheTag](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [Next.js updateTag](https://nextjs.org/docs/app/api-reference/functions/updateTag)
- [Next.js proxy.ts](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Next.js Version 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)
- [TanStack Query Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)

### 解説記事
- [Next.js 16 Cache Components Explained](https://webkul.com/blog/next-js-16-cache-components-explained/)
- [What's New in Next.js 16 - Strapi](https://strapi.io/blog/next-js-16-features)
- [Server Actions vs Route Handlers](https://makerkit.dev/blog/tutorials/server-actions-vs-route-handlers)
- [Real-time Notifications with Supabase](https://makerkit.dev/blog/tutorials/real-time-notifications-supabase-nextjs)
- [Optimistic Updates with useOptimistic](https://typeofweb.com/implementing-optimistic-updates-in-nextjs-using-react-18s-useoptimistic-hook)
