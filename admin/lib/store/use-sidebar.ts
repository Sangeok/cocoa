import { create } from 'zustand'

interface SidebarState {
  isExpanded: boolean
  toggle: () => void
}

export const useSidebar = create<SidebarState>((set) => ({
  isExpanded: false,
  toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
})) 