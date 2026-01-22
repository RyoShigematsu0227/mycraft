# MyCraft 実装タスク

## 概要

MVP開発のタスク一覧。フェーズ順に実装を進める。

---

## Phase 1: プロジェクトセットアップ

### 1.1 リポジトリ・開発環境
- [x] GitHubリポジトリ作成
- [x] .gitignore設定
- [x] README.md作成

### 1.2 Next.jsプロジェクト
- [x] Next.js (latest) プロジェクト作成（TypeScript, Tailwind CSS, App Router）
- [x] ESLint, Prettier設定
- [x] パスエイリアス設定（@/）
- [x] 基本的なフォルダ構成作成

### 1.3 Supabase
- [x] Supabaseプロジェクト作成
- [x] ローカル開発環境セットアップ（supabase init）
- [x] 環境変数設定（.env.local）

### 1.4 共通ライブラリ
- [x] Supabaseクライアント設定
- [x] Tanstack Query設定
- [x] Zustand設定

---

## Phase 2: データベース構築

### 2.1 マイグレーション作成
- [x] users テーブル
- [x] worlds テーブル
- [x] world_members テーブル
- [x] posts テーブル
- [x] post_images テーブル
- [x] likes テーブル
- [x] comments テーブル
- [x] comment_likes テーブル
- [x] reposts テーブル
- [x] follows テーブル
- [x] notifications テーブル

### 2.2 RLSポリシー設定
- [x] users RLS
- [x] worlds RLS
- [x] world_members RLS
- [x] posts RLS（visibility考慮）
- [x] post_images RLS
- [x] likes RLS
- [x] comments RLS
- [x] comment_likes RLS
- [x] reposts RLS
- [x] follows RLS
- [x] notifications RLS

### 2.3 Database Functions
- [x] get_feed_latest
- [x] get_feed_recommended
- [x] get_feed_following
- [x] get_feed_world
- [x] get_post_with_details
- [x] get_comments_tree
- [x] search_users
- [x] search_worlds
- [x] search_posts
- [x] get_user_stats

### 2.4 Triggers
- [x] 通知作成トリガー（いいね、コメント、フォロー、リポスト）

### 2.5 Storage
- [x] avatarsバケット作成
- [x] world-iconsバケット作成
- [x] post-imagesバケット作成
- [x] Storageポリシー設定

### 2.6 型生成
- [x] Supabase型定義ファイル生成

---

## Phase 3: 認証機能

### 3.1 Supabase Auth設定
- [x] Discord OAuth設定
- [x] Google OAuth設定
- [x] Email認証設定

### 3.2 認証UI
- [x] ログインページ（/login）
- [x] 新規登録ページ（/signup）
- [x] LoginForm コンポーネント
- [x] SignupForm コンポーネント
- [x] ソーシャルログインボタン

### 3.3 認証フック・状態管理
- [x] useAuth フック
- [x] AuthGuard コンポーネント
- [x] 認証状態のZustand store

### 3.4 初回登録フロー
- [x] プロフィール初期設定ページ
- [x] ユーザーID設定（ユニークチェック）

---

## Phase 4: 共通レイアウト・UIコンポーネント

### 4.1 レイアウト
- [x] Layout コンポーネント
- [x] Header コンポーネント
- [x] Sidebar コンポーネント
- [x] BottomNav コンポーネント（モバイル用）

### 4.2 汎用UIコンポーネント
- [x] Button コンポーネント
- [x] Input コンポーネント
- [x] Textarea コンポーネント
- [x] Modal コンポーネント
- [x] Avatar コンポーネント
- [x] ImageUpload コンポーネント
- [x] Loading コンポーネント
- [x] EmptyState コンポーネント

### 4.3 デフォルトアセット
- [x] デフォルトアバター画像
- [x] デフォルトワールドアイコン（風景）

---

## Phase 5: ユーザー機能

### 5.1 プロフィール設定
- [x] プロフィール設定ページ（/settings/profile）
- [x] ProfileForm コンポーネント
- [x] アバター画像アップロード
- [x] Minecraft ID設定

### 5.2 ユーザーページ
- [x] ユーザーページ（/users/{user_id}）※App Router制約により/@から/users/に変更
- [x] UserCard コンポーネント
- [x] UserAvatar コンポーネント
- [x] ユーザーの投稿一覧表示（Phase 7完了後に統合）

### 5.3 フォロー機能
- [x] FollowButton コンポーネント
- [x] useFollow フック
- [x] フォロワー一覧ページ（/users/{user_id}/followers）
- [x] フォロー中一覧ページ（/users/{user_id}/following）

---

## Phase 6: ワールド機能

### 6.1 ワールド作成・編集
- [x] ワールド作成ページ（/worlds/new）
- [x] ワールド編集ページ（/worlds/{world_id}/edit）
- [x] WorldForm コンポーネント
- [x] ワールドアイコンアップロード

### 6.2 ワールドページ
- [x] ワールド一覧ページ（/worlds）
- [x] ワールド詳細ページ（/worlds/{world_id}）
- [x] WorldCard コンポーネント
- [x] WorldIcon コンポーネント
- [x] メンバー一覧ページ（/worlds/{world_id}/members）
- [x] MemberList コンポーネント

### 6.3 ワールド参加
- [x] JoinButton コンポーネント
- [x] useWorldMembership フック
- [x] 参加・脱退処理

---

## Phase 7: 投稿機能

### 7.1 投稿作成
- [x] 新規投稿ページ（/posts/new）
- [x] PostForm コンポーネント
- [x] 画像アップロード（複数枚対応、0〜4枚）
- [x] ワールド選択
- [x] 公開範囲選択

### 7.2 投稿表示
- [x] 投稿詳細ページ（/posts/{post_id}）
- [x] PostCard コンポーネント
- [x] PostImages コンポーネント
- [x] 投稿削除機能

### 7.3 リアクション
- [x] LikeButton コンポーネント
- [x] useLike フック
- [x] RepostButton コンポーネント
- [x] useRepost フック

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
| Phase 1: プロジェクトセットアップ | 完了 |
| Phase 2: データベース構築 | 完了 |
| Phase 3: 認証機能 | 完了 |
| Phase 4: 共通レイアウト・UI | 完了 |
| Phase 5: ユーザー機能 | 完了 |
| Phase 6: ワールド機能 | 完了 |
| Phase 7: 投稿機能 | 完了 |
| Phase 8: コメント機能 | 未着手 |
| Phase 9: フィード機能 | 未着手 |
| Phase 10: 通知機能 | 未着手 |
| Phase 11: 検索機能 | 未着手 |
| Phase 12: 仕上げ | 未着手 |
