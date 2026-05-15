import { create } from 'zustand'

export interface ContentData {
  email: unknown
  delType: 'logic' | 'physical' | null
  showStar: boolean
  showReply: boolean
  showUnread: boolean
}

interface EmailState {
  contentData: ContentData
  deleteIds: number
  cancelStarEmailId: number
  addStarEmailId: number
  setContentData: (data: Partial<ContentData>) => void
  setDeleteIds: (n: number) => void
}

export const useEmailStore = create<EmailState>()((set) => ({
  contentData: {
    email: null,
    delType: null,
    showStar: true,
    showReply: true,
    showUnread: false,
  },
  deleteIds: 0,
  cancelStarEmailId: 0,
  addStarEmailId: 0,
  setContentData: (data) =>
    set((s) => ({ contentData: { ...s.contentData, ...data } })),
  setDeleteIds: (n) => set({ deleteIds: n }),
}))
