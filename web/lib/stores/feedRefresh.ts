import { create } from 'zustand'

interface FeedRefreshState {
  // リフレッシュトリガーカウンター
  refreshTrigger: number
  // フィードをリフレッシュする
  triggerRefresh: () => void
}

export const useFeedRefreshStore = create<FeedRefreshState>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}))
