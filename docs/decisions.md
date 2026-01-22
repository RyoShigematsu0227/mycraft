# MyCraft 意思決定記録

開発中に行った技術的な意思決定を記録する。

---

## テンプレート

### [日付] タイトル

**背景**
なぜこの決定が必要だったか

**選択肢**
1. 選択肢A - Pros / Cons
2. 選択肢B - Pros / Cons

**決定**
何を選んだか、なぜか

**結果**
（後から追記）実際どうだったか

---

## 決定事項

### [2024-XX-XX] 技術スタックの選定

**背景**
Webアプリ + 将来的なモバイル対応が必要

**選択肢**
1. Next.js + Expo + Supabase
   - Pros: TypeScript統一、Supabaseで認証・DB・Storageが一括管理
   - Cons: Supabaseへの依存
2. Next.js + Expo + 自前バックエンド
   - Pros: 柔軟性が高い
   - Cons: 開発コスト大

**決定**
Next.js + Expo + Supabase を採用。MVP開発のスピードを優先。

---

### [2024-XX-XX] State Management

**背景**
クライアント状態とサーバー状態の管理方法

**選択肢**
1. Zustand + Tanstack Query
   - Pros: 軽量、役割分担が明確
2. Redux Toolkit + RTK Query
   - Pros: 大規模対応
   - Cons: ボイラープレートが多い

**決定**
Zustand（グローバル状態） + Tanstack Query（サーバー状態）を採用。

---

（以降、開発中に追記）
