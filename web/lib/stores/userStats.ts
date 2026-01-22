import { create } from 'zustand'

interface UserStats {
  followersCount: number
  followingCount: number
  postsCount: number
  isFollowing: boolean
}

interface UserStatsState {
  stats: Record<string, UserStats>

  // Initialize stats for a user
  initUser: (userId: string, stats: UserStats) => void

  // Update individual counts
  setFollowersCount: (userId: string, count: number) => void
  setFollowingCount: (userId: string, count: number) => void
  setPostsCount: (userId: string, count: number) => void

  // Update following status
  setIsFollowing: (userId: string, isFollowing: boolean) => void

  // Toggle follow with optimistic update (returns previous state for rollback)
  toggleFollow: (targetUserId: string, currentUserId: string) => {
    wasFollowing: boolean
    prevFollowersCount: number
    prevFollowingCount: number
  }

  // Rollback on error
  rollbackFollow: (
    targetUserId: string,
    currentUserId: string,
    wasFollowing: boolean,
    prevFollowersCount: number,
    prevFollowingCount: number
  ) => void

  // Get stats for a user
  getStats: (userId: string) => UserStats | undefined
}

const defaultStats: UserStats = {
  followersCount: 0,
  followingCount: 0,
  postsCount: 0,
  isFollowing: false,
}

export const useUserStatsStore = create<UserStatsState>((set, get) => ({
  stats: {},

  initUser: (userId, stats) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [userId]: stats,
      },
    })),

  setFollowersCount: (userId, count) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [userId]: {
          ...(state.stats[userId] || defaultStats),
          followersCount: count,
        },
      },
    })),

  setFollowingCount: (userId, count) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [userId]: {
          ...(state.stats[userId] || defaultStats),
          followingCount: count,
        },
      },
    })),

  setPostsCount: (userId, count) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [userId]: {
          ...(state.stats[userId] || defaultStats),
          postsCount: count,
        },
      },
    })),

  setIsFollowing: (userId, isFollowing) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [userId]: {
          ...(state.stats[userId] || defaultStats),
          isFollowing,
        },
      },
    })),

  toggleFollow: (targetUserId, currentUserId) => {
    const targetStats = get().stats[targetUserId] || defaultStats
    const currentUserStats = get().stats[currentUserId] || defaultStats
    const wasFollowing = targetStats.isFollowing
    const prevFollowersCount = targetStats.followersCount
    const prevFollowingCount = currentUserStats.followingCount

    set((state) => ({
      stats: {
        ...state.stats,
        // Update target user's followers count and isFollowing status
        [targetUserId]: {
          ...targetStats,
          isFollowing: !wasFollowing,
          followersCount: wasFollowing
            ? Math.max(0, prevFollowersCount - 1)
            : prevFollowersCount + 1,
        },
        // Update current user's following count
        [currentUserId]: {
          ...currentUserStats,
          followingCount: wasFollowing
            ? Math.max(0, prevFollowingCount - 1)
            : prevFollowingCount + 1,
        },
      },
    }))

    return { wasFollowing, prevFollowersCount, prevFollowingCount }
  },

  rollbackFollow: (
    targetUserId,
    currentUserId,
    wasFollowing,
    prevFollowersCount,
    prevFollowingCount
  ) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [targetUserId]: {
          ...(state.stats[targetUserId] || defaultStats),
          isFollowing: wasFollowing,
          followersCount: prevFollowersCount,
        },
        [currentUserId]: {
          ...(state.stats[currentUserId] || defaultStats),
          followingCount: prevFollowingCount,
        },
      },
    })),

  getStats: (userId) => get().stats[userId],
}))
