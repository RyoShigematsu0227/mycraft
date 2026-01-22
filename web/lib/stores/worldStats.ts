import { create } from 'zustand'

interface WorldStats {
  memberCount: number
  isMember: boolean
}

interface WorldStatsState {
  stats: Record<string, WorldStats>

  // Initialize stats for a world
  initWorld: (worldId: string, stats: WorldStats) => void

  // Update member count
  setMemberCount: (worldId: string, count: number) => void

  // Update membership status
  setIsMember: (worldId: string, isMember: boolean) => void

  // Toggle membership with optimistic update (returns previous state for rollback)
  toggleMembership: (worldId: string) => {
    wasMember: boolean
    prevCount: number
  }

  // Rollback on error
  rollbackMembership: (worldId: string, wasMember: boolean, prevCount: number) => void

  // Get stats for a world
  getStats: (worldId: string) => WorldStats | undefined
}

const defaultStats: WorldStats = {
  memberCount: 0,
  isMember: false,
}

export const useWorldStatsStore = create<WorldStatsState>((set, get) => ({
  stats: {},

  initWorld: (worldId, stats) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [worldId]: stats,
      },
    })),

  setMemberCount: (worldId, count) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [worldId]: {
          ...(state.stats[worldId] || defaultStats),
          memberCount: count,
        },
      },
    })),

  setIsMember: (worldId, isMember) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [worldId]: {
          ...(state.stats[worldId] || defaultStats),
          isMember,
        },
      },
    })),

  toggleMembership: (worldId) => {
    const current = get().stats[worldId] || defaultStats
    const wasMember = current.isMember
    const prevCount = current.memberCount

    set((state) => ({
      stats: {
        ...state.stats,
        [worldId]: {
          isMember: !wasMember,
          memberCount: wasMember ? Math.max(0, prevCount - 1) : prevCount + 1,
        },
      },
    }))

    return { wasMember, prevCount }
  },

  rollbackMembership: (worldId, wasMember, prevCount) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [worldId]: {
          isMember: wasMember,
          memberCount: prevCount,
        },
      },
    })),

  getStats: (worldId) => get().stats[worldId],
}))
