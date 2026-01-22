# MyCraft 設計書

## 1. データベース設計

### 1.1 ER図（概念）

```
users ||--o{ posts : "投稿する"
users ||--o{ worlds : "作成する"
users ||--o{ world_members : "参加する"
users ||--o{ follows : "フォローする"
users ||--o{ likes : "いいねする"
users ||--o{ comments : "コメントする"
users ||--o{ reposts : "拡散する"
users ||--o{ notifications : "受け取る"

worlds ||--o{ world_members : "メンバーを持つ"
worlds ||--o{ posts : "投稿が紐づく"

posts ||--o{ post_images : "画像を持つ"
posts ||--o{ likes : "いいねされる"
posts ||--o{ comments : "コメントされる"
posts ||--o{ reposts : "拡散される"

comments ||--o{ comment_likes : "いいねされる"
comments ||--o{ comments : "返信される（無制限ネスト）"
```

### 1.2 テーブル定義

#### users
ユーザー情報。Supabase Authの `auth.users` と連携。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK | Supabase Auth のuser id |
| user_id | varchar(30) | UNIQUE, NOT NULL | 表示用ID（英数字） |
| display_name | varchar(50) | NOT NULL | 表示名 |
| avatar_url | text | | アイコン画像URL |
| bio | text | | 自己紹介 |
| minecraft_java_username | varchar(16) | UNIQUE | Java版ユーザー名 |
| minecraft_bedrock_gamertag | varchar(16) | UNIQUE | Bedrock版ゲーマータグ |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 作成日時 |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | 更新日時 |

#### worlds
ワールド情報。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | |
| name | varchar(100) | NOT NULL | ワールド名 |
| description | text | | 説明文 |
| how_to_join | text | | 参加方法 |
| icon_url | text | | ワールドアイコン（未設定時はデフォルト） |
| owner_id | uuid | FK → users.id, NOT NULL | 管理者 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| updated_at | timestamptz | NOT NULL, DEFAULT now() | |

#### world_members
ワールドへの参加情報。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | |
| world_id | uuid | FK → worlds.id, NOT NULL | |
| user_id | uuid | FK → users.id, NOT NULL | |
| joined_at | timestamptz | NOT NULL, DEFAULT now() | |
| UNIQUE(world_id, user_id) | | | 重複参加防止 |

#### posts
投稿情報。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | |
| user_id | uuid | FK → users.id, NOT NULL | 投稿者 |
| world_id | uuid | FK → worlds.id | 紐づけワールド（任意、単一） |
| content | text | NOT NULL | 本文 |
| visibility | varchar(20) | NOT NULL, DEFAULT 'public' | 'public' or 'world_only' |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

#### post_images
投稿に添付された画像（0〜4枚）。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | |
| post_id | uuid | FK → posts.id, NOT NULL, ON DELETE CASCADE | |
| image_url | text | NOT NULL | 画像URL |
| display_order | int | NOT NULL | 表示順（0-3） |

#### likes
投稿へのいいね。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | |
| user_id | uuid | FK → users.id, NOT NULL | |
| post_id | uuid | FK → posts.id, NOT NULL, ON DELETE CASCADE | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| UNIQUE(user_id, post_id) | | | 重複いいね防止 |

#### comments
コメント（投稿への返信、コメントへの返信）。無制限ネスト対応。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | |
| user_id | uuid | FK → users.id, NOT NULL | |
| post_id | uuid | FK → posts.id, NOT NULL, ON DELETE CASCADE | 対象投稿 |
| parent_comment_id | uuid | FK → comments.id, ON DELETE CASCADE | 返信先コメント（NULLなら投稿直下） |
| content | text | NOT NULL | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

#### comment_likes
コメントへのいいね。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | |
| user_id | uuid | FK → users.id, NOT NULL | |
| comment_id | uuid | FK → comments.id, NOT NULL, ON DELETE CASCADE | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| UNIQUE(user_id, comment_id) | | | |

#### reposts
拡散（リポスト）。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | |
| user_id | uuid | FK → users.id, NOT NULL | |
| post_id | uuid | FK → posts.id, NOT NULL, ON DELETE CASCADE | |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| UNIQUE(user_id, post_id) | | | |

#### follows
フォロー関係。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | |
| follower_id | uuid | FK → users.id, NOT NULL | フォローする人 |
| following_id | uuid | FK → users.id, NOT NULL | フォローされる人 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |
| UNIQUE(follower_id, following_id) | | | |
| CHECK(follower_id != following_id) | | | 自分をフォロー不可 |

#### notifications
通知。

| カラム | 型 | 制約 | 説明 |
|--------|-----|------|------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | |
| user_id | uuid | FK → users.id, NOT NULL | 通知を受け取る人 |
| type | varchar(20) | NOT NULL | 'like', 'comment', 'follow', 'repost', 'comment_like' |
| actor_id | uuid | FK → users.id, NOT NULL | アクションした人 |
| post_id | uuid | FK → posts.id, ON DELETE CASCADE | 関連投稿 |
| comment_id | uuid | FK → comments.id, ON DELETE CASCADE | 関連コメント |
| is_read | boolean | NOT NULL, DEFAULT false | 既読フラグ |
| created_at | timestamptz | NOT NULL, DEFAULT now() | |

---

## 2. Row Level Security (RLS) ポリシー

### 2.1 基本方針
- 閲覧: 未ログインでも公開コンテンツは閲覧可能
- 作成・更新・削除: ログイン必須、本人のみ

### 2.2 主要ポリシー

#### users
- SELECT: 全員可
- INSERT: 認証済み（自分のレコードのみ）
- UPDATE: 本人のみ

#### worlds
- SELECT: 全員可
- INSERT: ログインユーザー
- UPDATE, DELETE: owner_idが本人

#### world_members
- SELECT: 全員可
- INSERT: ログインユーザー（自分を追加）
- DELETE: 本人のみ（脱退）

#### posts
- SELECT: visibility='public' OR (visibility='world_only' AND 閲覧者がそのワールドメンバー)
- INSERT: ログインユーザー
- DELETE: 投稿者本人

#### post_images
- SELECT: 親postのRLSに従う
- INSERT: ログインユーザー
- DELETE: 投稿者本人

#### likes, comment_likes, reposts
- SELECT: 全員可
- INSERT: ログインユーザー
- DELETE: 本人のみ

#### comments
- SELECT: 親postのRLSに従う
- INSERT: ログインユーザー
- DELETE: コメント投稿者本人

#### follows
- SELECT: 全員可
- INSERT: ログインユーザー（自分がfollower）
- DELETE: follower本人

#### notifications
- SELECT: 本人のみ
- INSERT: システム（トリガー経由）
- UPDATE: 本人のみ（既読更新）

---

## 3. Storage設計

### 3.1 バケット構成

| バケット名 | 用途 | 公開設定 |
|------------|------|----------|
| avatars | ユーザーアイコン | public |
| world-icons | ワールドアイコン | public |
| post-images | 投稿画像 | public |

### 3.2 ファイルパス規則

```
avatars/{user_id}/{timestamp}_{filename}
world-icons/{world_id}/{timestamp}_{filename}
post-images/{user_id}/{post_id}/{display_order}_{timestamp}_{filename}
```

### 3.3 デフォルトアセット

| アセット | 用途 | 保存場所 |
|----------|------|----------|
| default-avatar.png | ユーザーアイコン未設定時 | public/defaults/ |
| default-world-icon.png | ワールドアイコン未設定時（風景画像） | public/defaults/ |

---

## 4. 画面構成

### 4.1 ページ一覧

| パス | ページ名 | 認証 | 説明 |
|------|----------|------|------|
| / | ホーム | 不要 | フィード（新着/おすすめ切り替え） |
| /login | ログイン | 不要 | |
| /signup | 新規登録 | 不要 | |
| /settings/profile | プロフィール設定 | 必要 | |
| /@{user_id} | ユーザーページ | 不要 | プロフィール + 投稿一覧 |
| /@{user_id}/followers | フォロワー一覧 | 不要 | |
| /@{user_id}/following | フォロー中一覧 | 不要 | |
| /worlds | ワールド一覧 | 不要 | |
| /worlds/new | ワールド作成 | 必要 | |
| /worlds/{world_id} | ワールドページ | 不要 | 説明 + 投稿一覧 + メンバー |
| /worlds/{world_id}/edit | ワールド編集 | 必要(owner) | |
| /worlds/{world_id}/members | メンバー一覧 | 不要 | |
| /posts/{post_id} | 投稿詳細 | 不要* | コメント表示 |
| /posts/new | 新規投稿 | 必要 | |
| /following | フォロー中フィード | 必要 | |
| /notifications | 通知一覧 | 必要 | |
| /search | 検索 | 不要 | ユーザー/ワールド/投稿 |

*ワールド限定投稿はメンバーのみ閲覧可

### 4.2 コンポーネント構成

```
components/
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── BottomNav.tsx (mobile)
│   └── Layout.tsx
├── auth/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   └── AuthGuard.tsx
├── user/
│   ├── UserCard.tsx
│   ├── UserAvatar.tsx
│   ├── ProfileForm.tsx
│   └── FollowButton.tsx
├── world/
│   ├── WorldCard.tsx
│   ├── WorldIcon.tsx
│   ├── WorldForm.tsx
│   ├── JoinButton.tsx
│   └── MemberList.tsx
├── post/
│   ├── PostCard.tsx
│   ├── PostForm.tsx
│   ├── PostImages.tsx
│   ├── LikeButton.tsx
│   ├── RepostButton.tsx
│   └── CommentSection.tsx
├── comment/
│   ├── CommentCard.tsx
│   ├── CommentForm.tsx
│   ├── CommentThread.tsx (ネスト対応)
│   └── CommentLikeButton.tsx
├── feed/
│   ├── FeedTabs.tsx
│   └── InfiniteFeed.tsx
├── notification/
│   ├── NotificationCard.tsx
│   └── NotificationList.tsx
├── search/
│   ├── SearchBar.tsx
│   └── SearchResults.tsx
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    ├── Modal.tsx
    ├── Avatar.tsx
    └── ImageUpload.tsx
```

---

## 5. API設計（Supabase RPC / Edge Functions）

### 5.1 基本方針
- 基本的なCRUDはSupabaseクライアントで直接実行
- 複雑なクエリや集計はDatabase Functions (RPC)
- 外部連携が必要な場合はEdge Functions

### 5.2 Database Functions

| 関数名 | 用途 |
|--------|------|
| get_feed_latest(limit, cursor) | 新着フィード取得 |
| get_feed_recommended(limit, cursor) | おすすめフィード取得 |
| get_feed_following(user_id, limit, cursor) | フォロー中フィード |
| get_feed_world(world_id, limit, cursor) | ワールド別フィード |
| get_post_with_details(post_id) | 投稿詳細（いいね数、コメント数、リポスト数含む） |
| get_comments_tree(post_id) | コメントツリー取得（ネスト対応） |
| search_users(query, limit) | ユーザー検索 |
| search_worlds(query, limit) | ワールド検索 |
| search_posts(query, limit) | 投稿検索 |
| get_user_stats(user_id) | ユーザー統計（投稿数、フォロー数等） |

### 5.3 Database Triggers

| トリガー | 用途 |
|----------|------|
| on_like_created | いいね通知作成 |
| on_comment_created | コメント通知作成 |
| on_follow_created | フォロー通知作成 |
| on_repost_created | リポスト通知作成 |
| on_comment_like_created | コメントいいね通知作成 |

---

## 6. おすすめアルゴリズム（MVP版）

シンプルに、直近24時間のいいね数 + コメント数 + リポスト数でスコアリング。

```sql
score = (likes_count * 1) + (comments_count * 2) + (reposts_count * 3)
ORDER BY score DESC, created_at DESC
```

将来的にはフォロー関係や興味関心を加味。

---

## 7. インデックス設計

| テーブル | カラム | 用途 |
|----------|--------|------|
| posts | user_id | ユーザーの投稿一覧 |
| posts | world_id | ワールドの投稿一覧 |
| posts | created_at | 時系列ソート |
| comments | post_id | 投稿のコメント一覧 |
| comments | parent_comment_id | 返信ツリー |
| follows | follower_id | フォロー中一覧 |
| follows | following_id | フォロワー一覧 |
| notifications | user_id, is_read | 未読通知取得 |
| world_members | world_id | ワールドメンバー一覧 |
| world_members | user_id | 参加ワールド一覧 |
