# MyCraft

MinecraftワールドのSNSアプリ。ユーザーはワールドの住人になりきって投稿し、スクリーンショットや建築を共有する。

## Tech Stack

### Web Frontend
- Framework: Next.js (latest, App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: 
  - Zustand（グローバル状態）
  - Tanstack Query（サーバー状態）

### Mobile Frontend（Web完成後）
- Framework: Expo (React Native)
- Language: TypeScript

### Backend
- BaaS: Supabase
  - Auth: Supabase Auth (Discord, Google, Email)
  - Database: PostgreSQL
  - Storage: Supabase Storage (画像)
  - Realtime: Supabase Realtime (通知)

## Project Structure

```
mycraft/
├── CLAUDE.md
├── docs/
│   ├── requirements.md      # 要件定義
│   ├── design.md            # 設計書
│   ├── tasks.md             # タスク管理
│   └── decisions.md         # 意思決定記録
├── web/                     # Next.js
│   ├── app/                 # App Router pages
│   ├── components/          # UIコンポーネント
│   ├── lib/                 # ユーティリティ、Supabaseクライアント
│   ├── hooks/               # カスタムフック
│   ├── types/               # 型定義
│   └── public/
├── mobile/                  # Expo（後で作成）
└── supabase/
    ├── migrations/          # DBマイグレーション
    └── seed.sql             # テストデータ
```

## Commands

### Web開発
```bash
cd web
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run lint         # ESLint実行
npm run type-check   # TypeScriptチェック
```

### Supabase
```bash
supabase start       # ローカルSupabase起動
supabase db reset    # DBリセット＋マイグレーション再実行
supabase gen types typescript --local > web/types/database.ts
```

## Coding Rules

### Before Coding
- **BP-1 (MUST)**: 不明点があれば実装前に質問する
- **BP-2 (MUST)**: 複数のアプローチがある場合はPros/Consを提示して確認する
- **BP-3 (SHOULD)**: 大きな変更は `docs/tasks.md` のタスクと照らし合わせる

### While Coding
- **C-1 (MUST)**: 既存のコードスタイル・命名規則に従う
- **C-2 (MUST)**: 型定義は `types/` に集約する
- **C-3 (MUST)**: Supabaseの型は自動生成したものを使う
- **C-4 (SHOULD)**: コンポーネントは小さく、単一責任に保つ
- **C-5 (SHOULD)**: ビジネスロジックはカスタムフックに切り出す
- **C-6 (SHOULD NOT)**: `any` 型を使わない

### After Coding
- **A-1 (MUST)**: 新しいパターンや決定事項は `docs/decisions.md` に記録
- **A-2 (SHOULD)**: 実装完了したタスクは `docs/tasks.md` でチェックを入れる

## Component Naming

- ページコンポーネント: `page.tsx`（App Router規約）
- UIコンポーネント: PascalCase（例: `PostCard.tsx`）
- フック: camelCase、`use` prefix（例: `useAuth.ts`）
- ユーティリティ: camelCase（例: `formatDate.ts`）

## Database Conventions

- テーブル名: snake_case, 複数形（例: `posts`, `world_members`）
- カラム名: snake_case（例: `created_at`, `user_id`）
- 外部キー: `{参照テーブル単数形}_id`（例: `user_id`, `world_id`）

## Git Commit Convention

```
feat: 新機能
fix: バグ修正
docs: ドキュメント
style: フォーマット（コード動作に影響なし）
refactor: リファクタリング
test: テスト
chore: ビルド、設定など
```

## Notes

- MVP開発フェーズでは、まずWebを完成させてからMobileに着手
- 通報・モデレーション機能はMVP後に実装
- ワールドの承認制参加機能はMVP後に実装
