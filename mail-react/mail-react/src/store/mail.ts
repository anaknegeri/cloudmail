import { create } from 'zustand'
import type { ApiEmail } from '../types/api'

interface MailState {
  selectedEmail: ApiEmail | null
  setSelectedEmail: (email: ApiEmail | null) => void
  composeOpen: boolean
  setComposeOpen: (open: boolean) => void
  replyEmail: ApiEmail | null
  setReplyEmail: (email: ApiEmail | null) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
}

export const useMailStore = create<MailState>((set) => ({
  selectedEmail: null,
  setSelectedEmail: (email) => set({ selectedEmail: email }),
  composeOpen: false,
  setComposeOpen: (open) => set({ composeOpen: open }),
  replyEmail: null,
  setReplyEmail: (email) => set({ replyEmail: email }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
}))
