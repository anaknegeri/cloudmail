import { create } from 'zustand'

interface UiState {
  asideShow: boolean
  setAsideShow: (v: boolean) => void
  toggleAside: () => void
}

export const useUiStore = create<UiState>()((set) => ({
  asideShow: window.innerWidth > 1024,
  setAsideShow: (v) => set({ asideShow: v }),
  toggleAside: () => set((s) => ({ asideShow: !s.asideShow })),
}))
