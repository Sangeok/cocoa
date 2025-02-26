import { create } from 'zustand'
import { AdminProfile } from '../api'

interface ProfileState {
  profile: AdminProfile | null
  setProfile: (profile: AdminProfile) => void
  clearProfile: () => void
}

export const useProfile = create<ProfileState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  clearProfile: () => set({ profile: null }),
})) 