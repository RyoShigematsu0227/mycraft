import { create } from 'zustand'

interface WorldModalState {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

export const useWorldModalStore = create<WorldModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}))
