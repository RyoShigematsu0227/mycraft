# MyCraft Web

MyCraftのWebフロントエンドアプリケーション。

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (グローバル状態) + SWR (サーバー状態)
- **Backend**: Supabase (Auth, Database, Storage, Realtime)

## Getting Started

### 前提条件

- Node.js 18+
- npm または yarn
- Supabaseローカル環境（Docker）

### セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. 環境変数を設定

```bash
cp .env.example .env.local
# .env.localを編集してSupabaseの認証情報を設定
```

3. 開発サーバーを起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## Scripts

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run start        # 本番サーバー起動
npm run lint         # ESLint実行
npm run type-check   # TypeScript型チェック
```

## Project Structure

```
web/
├── app/                    # App Router ページ
│   ├── (main)/            # メインレイアウト（認証済みユーザー向け）
│   │   ├── posts/         # 投稿関連ページ
│   │   ├── users/         # ユーザー関連ページ
│   │   ├── worlds/        # ワールド関連ページ
│   │   ├── notifications/ # 通知ページ
│   │   └── search/        # 検索ページ
│   ├── (auth)/            # 認証ページ（ログイン、サインアップ）
│   └── settings/          # 設定ページ
├── components/             # 再利用可能なコンポーネント
│   ├── auth/              # 認証関連
│   ├── comment/           # コメント関連
│   ├── feed/              # フィード関連
│   ├── layout/            # レイアウト
│   ├── notification/      # 通知関連
│   ├── post/              # 投稿関連
│   ├── search/            # 検索関連
│   ├── settings/          # 設定関連
│   ├── ui/                # 汎用UIコンポーネント
│   ├── user/              # ユーザー関連
│   └── world/             # ワールド関連
├── hooks/                  # カスタムフック
├── lib/                    # ユーティリティ、設定
│   ├── supabase/          # Supabaseクライアント
│   └── stores/            # Zustand stores
├── types/                  # TypeScript型定義
└── public/                 # 静的ファイル
```

## Key Features

- **認証**: Discord、Google、メール+パスワード
- **ワールド**: 作成、参加、管理
- **投稿**: テキスト+画像（0〜4枚）、ワールド紐づけ
- **リアクション**: いいね、コメント（無制限ネスト）、リポスト
- **フォロー**: ユーザー間のフォロー機能
- **フィード**: 新着、おすすめ、フォロー中、ワールド別
- **通知**: リアルタイム通知
- **検索**: ユーザー、ワールド、投稿の検索

## Related Documentation

- [要件定義](/docs/requirements.md)
- [設計書](/docs/design.md)
- [意思決定記録](/docs/decisions.md)
- [Next.jsベストプラクティス](/docs/nextjs-best-practices.md)
