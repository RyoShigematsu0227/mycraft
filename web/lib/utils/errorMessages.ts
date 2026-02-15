/**
 * Supabaseのエラーメッセージを日本語に変換
 */

const errorTranslations: Record<string, string> = {
  // Auth errors
  'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
  'Email not confirmed': 'メールアドレスが確認されていません。確認メールをご確認ください',
  'User already registered': 'このメールアドレスは既に登録されています',
  'Password should be at least 6 characters': 'パスワードは6文字以上で入力してください',
  'Unable to validate email address: invalid format': 'メールアドレスの形式が正しくありません',
  'Signup requires a valid password': 'パスワードを入力してください',
  'Email rate limit exceeded':
    'メール送信の上限に達しました。しばらく時間をおいてからお試しください',
  'For security purposes, you can only request this once every 60 seconds':
    'セキュリティのため、60秒に1回のみリクエストできます',
  'New password should be different from the old password':
    '新しいパスワードは現在のパスワードと異なる必要があります',
  'Auth session missing!': 'セッションが切れました。再度ログインしてください',
  'Token has expired or is invalid': 'トークンが期限切れか無効です。再度お試しください',

  // Database errors
  'duplicate key value violates unique constraint': '既に登録されています',
  'violates foreign key constraint': '関連するデータが見つかりません',
  'Row not found': 'データが見つかりませんでした',
  'JSON object requested, multiple (or no) rows returned': 'データの取得に失敗しました',

  // Storage errors
  'The resource already exists': 'ファイルは既に存在します',
  'Bucket not found': 'ストレージが見つかりません',
  'Object not found': 'ファイルが見つかりません',
  'Payload too large': 'ファイルサイズが大きすぎます',

  // Network errors
  'Failed to fetch': 'ネットワークエラーが発生しました。接続を確認してください',
  'Network request failed': 'ネットワークエラーが発生しました。接続を確認してください',

  // RLS errors
  'new row violates row-level security policy': '権限がありません',

  // Custom trigger errors
  'You must be a member of the world to create a post':
    'このワールドに投稿するには、まずワールドに参加してください',
}

/**
 * エラーメッセージを日本語に変換する
 * 完全一致がない場合は部分一致を試み、それでもなければ元のメッセージを返す
 */
export function translateError(message: string): string {
  // 完全一致をチェック
  if (errorTranslations[message]) {
    return errorTranslations[message]
  }

  // 部分一致をチェック
  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (message.includes(key)) {
      return translation
    }
  }

  // 一致しない場合は元のメッセージを返す
  return message
}

/**
 * Supabaseエラーオブジェクトから日本語メッセージを取得
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return '不明なエラーが発生しました'
  }

  if (typeof error === 'string') {
    return translateError(error)
  }

  if (error instanceof Error) {
    return translateError(error.message)
  }

  if (typeof error === 'object' && 'message' in error) {
    return translateError(String((error as { message: unknown }).message))
  }

  return '不明なエラーが発生しました'
}
