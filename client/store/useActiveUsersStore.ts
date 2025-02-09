import { create } from 'zustand'
import { socket } from '@/lib/socket'

interface ActiveUsersStore {
  count: number
  setCount: (count: number) => void
  initializeSocket: () => void
}

const useActiveUsersStore = create<ActiveUsersStore>((set) => ({
  count: 1,
  setCount: (count) => set({ count }),
  initializeSocket: () => {
    socket.on('active-users', (data: { count: number }) => {
      set({ count: data.count })
    })
  },
}))

export default useActiveUsersStore 