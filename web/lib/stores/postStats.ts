import { create } from 'zustand'

interface PostStats {
  likeCount: number
  repostCount: number
  commentCount: number
  isLiked: boolean
  isReposted: boolean
}

interface PostStatsState {
  stats: Record<string, PostStats>

  // Initialize stats for a post
  initPost: (postId: string, stats: PostStats) => void

  // Update individual counts
  setLikeCount: (postId: string, count: number) => void
  setRepostCount: (postId: string, count: number) => void
  setCommentCount: (postId: string, count: number) => void
  incrementCommentCount: (postId: string) => void
  decrementCommentCount: (postId: string) => void

  // Update like/repost status
  setIsLiked: (postId: string, isLiked: boolean) => void
  setIsReposted: (postId: string, isReposted: boolean) => void

  // Toggle with optimistic update (returns previous state for rollback)
  toggleLike: (postId: string) => { wasLiked: boolean; prevCount: number }
  toggleRepost: (postId: string) => { wasReposted: boolean; prevCount: number }

  // Rollback on error
  rollbackLike: (postId: string, wasLiked: boolean, prevCount: number) => void
  rollbackRepost: (postId: string, wasReposted: boolean, prevCount: number) => void

  // Get stats for a post
  getStats: (postId: string) => PostStats | undefined
}

const defaultStats: PostStats = {
  likeCount: 0,
  repostCount: 0,
  commentCount: 0,
  isLiked: false,
  isReposted: false,
}

export const usePostStatsStore = create<PostStatsState>((set, get) => ({
  stats: {},

  initPost: (postId, stats) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: stats,
      },
    })),

  setLikeCount: (postId, count) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...(state.stats[postId] || defaultStats),
          likeCount: count,
        },
      },
    })),

  setRepostCount: (postId, count) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...(state.stats[postId] || defaultStats),
          repostCount: count,
        },
      },
    })),

  setCommentCount: (postId, count) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...(state.stats[postId] || defaultStats),
          commentCount: count,
        },
      },
    })),

  incrementCommentCount: (postId) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...(state.stats[postId] || defaultStats),
          commentCount: (state.stats[postId]?.commentCount || 0) + 1,
        },
      },
    })),

  decrementCommentCount: (postId) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...(state.stats[postId] || defaultStats),
          commentCount: Math.max(0, (state.stats[postId]?.commentCount || 0) - 1),
        },
      },
    })),

  setIsLiked: (postId, isLiked) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...(state.stats[postId] || defaultStats),
          isLiked,
        },
      },
    })),

  setIsReposted: (postId, isReposted) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...(state.stats[postId] || defaultStats),
          isReposted,
        },
      },
    })),

  toggleLike: (postId) => {
    const current = get().stats[postId] || defaultStats
    const wasLiked = current.isLiked
    const prevCount = current.likeCount

    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...current,
          isLiked: !wasLiked,
          likeCount: wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1,
        },
      },
    }))

    return { wasLiked, prevCount }
  },

  toggleRepost: (postId) => {
    const current = get().stats[postId] || defaultStats
    const wasReposted = current.isReposted
    const prevCount = current.repostCount

    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...current,
          isReposted: !wasReposted,
          repostCount: wasReposted ? Math.max(0, prevCount - 1) : prevCount + 1,
        },
      },
    }))

    return { wasReposted, prevCount }
  },

  rollbackLike: (postId, wasLiked, prevCount) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...(state.stats[postId] || defaultStats),
          isLiked: wasLiked,
          likeCount: prevCount,
        },
      },
    })),

  rollbackRepost: (postId, wasReposted, prevCount) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [postId]: {
          ...(state.stats[postId] || defaultStats),
          isReposted: wasReposted,
          repostCount: prevCount,
        },
      },
    })),

  getStats: (postId) => get().stats[postId],
}))
