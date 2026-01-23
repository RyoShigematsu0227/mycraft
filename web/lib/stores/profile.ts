import { create } from 'zustand'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

interface ProfileState {
  profile: User | null
  setProfile: (profile: User | null) => void
  updateProfile: (updates: Partial<User>) => void
  reset: () => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
  reset: () => set({ profile: null }),
}))
