import { create } from 'zustand'
import type { UserAccount } from '../types/api'

interface AccountState {
  currentAccountId: number
  currentAccount: Partial<UserAccount>
  setAccount: (id: number, account: UserAccount) => void
  clearAccount: () => void
}

export const useAccountStore = create<AccountState>()((set) => ({
  currentAccountId: 0,
  currentAccount: {},
  setAccount: (id, account) => set({ currentAccountId: id, currentAccount: account }),
  clearAccount: () => set({ currentAccountId: 0, currentAccount: {} }),
}))
