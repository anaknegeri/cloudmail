import { create } from 'zustand'

export interface UserInfo {
  userId?: number
  email?: string
  name?: string
  role?: string
  permKeys?: string[]
  account?: {
    accountId: number
    email?: string
    name?: string
    allReceive?: number
  }
  [key: string]: unknown
}

interface UserState {
  user: Partial<UserInfo>
  token: string
  perms: string[]   // flat copy of permKeys, easier to pass down
  setUser: (u: UserInfo) => void
  setToken: (t: string) => void
  setPerms: (p: string[]) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()((set) => ({
  user: {},
  token: localStorage.getItem('token') || '',
  perms: [],
  setUser:  (u) => set({ user: u, perms: u.permKeys ?? [] }),
  setToken: (t) => set({ token: t }),
  setPerms: (p) => set({ perms: p }),
  clearUser: () => set({ user: {}, token: '', perms: [] }),
}))
