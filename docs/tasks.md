# MyCraft 実装タスク

## 概要

MVP開発のタスク一覧。フェーズ順に実装を進める。

---

## Phase 1: プロジェクトセットアップ

### 1.1 リポジトリ・開発環境
- [ ] GitHubリポジトリ作成
- [ ] .gitignore設定
- [ ] README.md作成

### 1.2 Next.jsプロジェクト
- [ ] Next.js (latest) プロジェクト作成（TypeScript, Tailwind CSS, App Router）
- [ ] ESLint, Prettier設定
- [ ] パスエイリアス設定（@/）
- [ ] 基本的なフォルダ構成作成

### 1.3 Supabase
- [ ] Supabaseプロジェクト作成
- [ ] ローカル開発環境セットアップ（supabase init）
- [ ] 環境変数設定（.env.local）

### 1.4 共通ライブラリ
- [ ] Supabaseクライアント設定
- [ ] Tanstack Query設定
- [ ] Zustand設定

---

## Phase 2: データベース構築

### 2.1 マイグレーション作成
- [ ] users テーブル
- [ ] worlds テーブル
- [ ] world_members テーブル
- [ ] posts テーブル
- [ ] post_images テーブル
- [ ] likes テーブル
- [ ] comments テーブル
- [ ] comment_likes テーブル
- [ ] reposts テーブル
- [ ] follows テーブル
- [ ] notifications テーブル

### 2.2 RLSポリシー設定
- [ ] users RLS
- [ ] worlds RLS
- [ ] world_members RLS
- [ ] posts RLS（visibility考慮）
- [ ] post_images RLS
- [ ] likes RLS
- [ ] comments RLS
- [ ] comment_likes RLS
- [ ] reposts RLS
- [ ] follows RLS
- [ ] notifications RLS

### 2.3 Database Functions
- [ ] get_feed_latest
- [ ] get_feed_recommended
- [ ] get_feed_following
- [ ] get_feed_world
- [ ] get_post_with_details
- [ ] get_comments_tree
- [ ] search_users
- [ ] search_worlds
- [ ] search_posts
- [ ] get_user_stats

### 2.4 Triggers
- [ ] 通知作成トリガー（いいね、コメント、フォロー、リポスト）

### 2.5 Storage
- [ ] avatarsバケット作成
- [ ] world-iconsバケット作成
- [ ] post-imagesバケット作成
- [ ] Storageポリシー設定

### 2.6 型生成
- [ ] Supabase型定義ファイル生成

---

## Phase 3: 認証機能

### 3.1 Supabase Auth設定
- [ ] Discord OAuth設定
- [ ] Google OAuth設定
- [ ] Email認証設定

### 3.2 認証UI
- [ ] ログインページ（/login）
- [ ] 新規登録ページ（/signup）
- [ ] LoginForm コンポーネント
- [ ] SignupForm コンポーネント
- [ ] ソーシャルログインボタン

### 3.3 認証フック・状態管理
- [ ] useAuth フック
- [ ] AuthGuard コンポーネント
- [ ] 認証状態のZustand store

### 3.4 初回登録フロー
- [ ] プロフィール初期設定ページ
- [ ] ユーザーID設定（ユニークチェック）

---

## Phase 4: 共通レイアウト・UIコンポーネント

### 4.1 レイアウト
- [ ] Layout コンポーネント
- [ ] Header コンポーネント
- [ ] Sidebar コンポーネント
- [ ] BottomNav コンポーネント（モバイル用）

### 4.2 汎用UIコンポーネント
- [ ] Button コンポーネント
- [ ] Input コンポーネント
- [ ] Textarea コンポーネント
- [ ] Modal コンポーネント
- [ ] Avatar コンポーネント
- [ ] ImageUpload コンポーネント
- [ ] Loading コンポーネント
- [ ] EmptyState コンポーネント

### 4.3 デフォルトアセット
- [ ] デフォルトアバター画像
- [ ] デフォルトワールドアイコン（風景）

---

## Phase 5: ユーザー機能

### 5.1 プロフィール設定
- [ ] プロフィール設定ページ（/settings/profile）
- [ ] ProfileForm コンポーネント
- [ ] アバター画像アップロード
- [ ] Minecraft ID設定

### 5.2 ユーザーページ
- [ ] ユーザーページ（/@{user_id}）
- [ ] UserCard コンポーネント
- [ ] UserAvatar コンポーネント
- [ ] ユーザーの投稿一覧表示

### 5.3 フォロー機能
- [ ] FollowButton コンポーネント
- [ ] useFollow フック
- [ ] フォロワー一覧ページ（/@{user_id}/followers）
- [ ] フォロー中一覧ページ（/@{user_id}/following）

---

## Phase 6: ワールド機能

### 6.1 ワールド作成・編集
- [ ] ワールド作成ページ（/worlds/new）
- [ ] ワールド編集ページ（/worlds/{world_id}/edit）
- [ ] WorldForm コンポーネント
- [ ] ワールドアイコンアップロード

### 6.2 ワールドページ
- [ ] ワールド一覧ページ（/worlds）
- [ ] ワールド詳細ページ（/worlds/{world_id}）
- [ ] WorldCard コンポーネント
- [ ] WorldIcon コンポーネント
- [ ] メンバー一覧ページ（/worlds/{world_id}/members）
- [ ] MemberList コンポーネント

### 6.3 ワールド参加
- [ ] JoinButton コンポーネント
- [ ] useWorldMembership フック
- [ ] 参加・脱退処理

---

## Phase 7: 投稿機能

### 7.1 投稿作成
- [ ] 新規投稿ページ（/posts/new）
- [ ] PostForm コンポーネント
- [ ] 画像アップロード（複数枚対応、0〜4枚）
- [ ] ワールド選択
- [ ] 公開範囲選択

### 7.2 投稿表示
- [ ] 投稿詳細ページ（/posts/{post_id}）
- [ ] PostCard コンポーネント
- [ ] PostImages コンポーネント
- [ ] 投稿削除機能

### 7.3 リアクション
- [ ] LikeButton コンポーネント
- [ ] useLike フック
- [ ] RepostButton コンポーネント
- [ ] useRepost フック

---

## Phase 8: コメント機能

### 8.1 コメント表示
- [ ] CommentSection コンポーネント
- [ ] CommentCard コンポーネント
- [ ] CommentThread コンポーネント（ネスト対応）

### 8.2 コメント投稿
- [ ] CommentForm コンポーネント
- [ ] useComment フック
- [ ] 返信機能（無制限ネスト）

### 8.3 コメントいいね
- [ ] CommentLikeButton コンポーネント
- [ ] useCommentLike フック

---

## Phase 9: フィード機能

### 9.1 ホームフィード
- [ ] ホームページ（/）
- [ ] FeedTabs コンポーネント（新着/おすすめ切り替え）
- [ ] InfiniteFeed コンポーネント
- [ ] useFeed フック

### 9.2 フォロー中フィード
- [ ] フォロー中ページ（/following）
- [ ] useFollowingFeed フック

### 9.3 ワールドフィード
- [ ] ワールドページ内のフィード表示
- [ ] useWorldFeed フック

---

## Phase 10: 通知機能

### 10.1 通知表示
- [ ] 通知ページ（/notifications）
- [ ] NotificationList コンポーネント
- [ ] NotificationCard コンポーネント
- [ ] useNotifications フック

### 10.2 通知状態
- [ ] 未読数表示（Header）
- [ ] 既読処理
- [ ] Supabase Realtime連携（リアルタイム通知）

---

## Phase 11: 検索機能

### 11.1 検索UI
- [ ] 検索ページ（/search）
- [ ] SearchBar コンポーネント
- [ ] SearchResults コンポーネント

### 11.2 検索機能実装
- [ ] ユーザー検索
- [ ] ワールド検索
- [ ] 投稿検索
- [ ] useSearch フック

---

## Phase 12: 仕上げ

### 12.1 エラーハンドリング
- [ ] エラーページ（404, 500）
- [ ] トースト通知
- [ ] フォームバリデーション

### 12.2 パフォーマンス
- [ ] 画像最適化
- [ ] ローディング状態の改善
- [ ] メタタグ・OGP設定

### 12.3 レスポンシブ対応
- [ ] モバイル表示確認・調整
- [ ] タブレット表示確認・調整

### 12.4 テスト・デプロイ
- [ ] 主要機能の動作確認
- [ ] Vercelデプロイ設定
- [ ] 本番Supabase設定
- [ ] 環境変数設定（本番）

---

## 進捗サマリー

| フェーズ | 状態 |
|----------|------|
| Phase 1: プロジェクトセットアップ | 未着手 |
| Phase 2: データベース構築 | 未着手 |
| Phase 3: 認証機能 | 未着手 |
| Phase 4: 共通レイアウト・UI | 未着手 |
| Phase 5: ユーザー機能 | 未着手 |
| Phase 6: ワールド機能 | 未着手 |
| Phase 7: 投稿機能 | 未着手 |
| Phase 8: コメント機能 | 未着手 |
| Phase 9: フィード機能 | 未着手 |
| Phase 10: 通知機能 | 未着手 |
| Phase 11: 検索機能 | 未着手 |
| Phase 12: 仕上げ | 未着手 |
