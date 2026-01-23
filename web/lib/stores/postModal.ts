import { create } from 'zustand'

interface PostModalState {
  isOpen: boolean
  defaultWorldId?: string
  openModal: (defaultWorldId?: string) => void
  closeModal: () => void
}

export const usePostModalStore = create<PostModalState>((set) => ({
  isOpen: false,
  defaultWorldId: undefined,
  openModal: (defaultWorldId) => set({ isOpen: true, defaultWorldId }),
  closeModal: () => set({ isOpen: false, defaultWorldId: undefined }),
}))
