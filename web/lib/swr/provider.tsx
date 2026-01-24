'use client'

import { SWRConfig } from 'swr'

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        // 同じキーのリクエストを2秒間デデュープ（連続クリック防止）
        dedupingInterval: 2000,
        // タブに戻った時にバックグラウンドで再検証（SWRの強み）
        revalidateOnFocus: true,
        // ネットワーク復帰時に再検証
        revalidateOnReconnect: true,
        // エラー時のリトライ
        shouldRetryOnError: true,
        errorRetryCount: 3,
        // フォーカス時の再検証間隔（最低5秒空ける）
        focusThrottleInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  )
}
