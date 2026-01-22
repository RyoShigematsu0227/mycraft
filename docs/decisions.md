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

### [2026-01-22] ユーザーページURLパターン

**背景**
ユーザーページのURLを `/@{user_id}` にする予定だったが、Next.js App Routerでは `@` プレフィックスがParallel Routes（スロット）用に予約されているため、そのまま使用できない。

**選択肢**
1. `/users/{user_id}` - 標準的なパターン
   - Pros: シンプル、App Routerと競合しない
   - Cons: TwitterライクなURL形式ではない
2. `/%40{user_id}` - URLエンコード使用
   - Pros: 見た目は@を維持
   - Cons: 見た目が悪い、ルーティング複雑
3. Catch-all routeで `/@username` をハンドリング
   - Pros: 希望のURL形式
   - Cons: 実装が複雑、他のルートとの競合リスク

**決定**
`/users/{user_id}` を採用。シンプルさと保守性を優先。UI上では `@user_id` と表示することで、ユーザー体験は維持。

---

### [2026-01-22] Buttonコンポーネントのtype属性デフォルト値

**背景**
プロフィール設定画面で画像をトリミングするためにImageCropperモーダルを開き、「トリミングを適用」ボタンを押すと、親フォーム（ProfileForm）が送信されてしまう問題が発生。これにより、保存ボタンを押す前に「プロフィールを保存しました」というメッセージが表示されてしまった。

**原因**
HTMLの`<button>`要素は、`type`属性を指定しない場合デフォルトで`type="submit"`となる。そのため、フォーム内にあるボタンをクリックすると意図せずフォームが送信される。

**選択肢**
1. Button使用箇所で毎回`type="button"`を明示的に指定
   - Pros: 既存の挙動を変えない
   - Cons: 指定漏れのリスク、ボイラープレート増加
2. Buttonコンポーネントのデフォルトを`type="button"`に変更
   - Pros: 安全なデフォルト、指定漏れがなくなる
   - Cons: フォーム送信ボタンでは`type="submit"`の明示が必要

**決定**
Buttonコンポーネントのデフォルトを`type="button"`に変更。フォーム送信が必要な場合のみ`type="submit"`を明示的に指定する方針とした。これにより、モーダル内のボタンや操作ボタンが意図せずフォームを送信するバグを防止できる。

---

（以降、開発中に追記）
