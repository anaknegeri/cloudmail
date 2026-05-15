import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SiteSettings {
  title?: string
  r2Domain?: string
  loginOpacity?: number
  loginDarkenFactor?: number
  background?: string
  linuxdoSwitch?: boolean
  register?: number
  loginDomain?: number
  regKey?: number
  siteKey?: string
  autoRefresh?: number
  [key: string]: unknown
}

interface SettingState {
  domainList: string[]
  settings: SiteSettings
  lang: string
  setSettings: (s: SiteSettings) => void
  setDomainList: (list: string[]) => void
  setLang: (l: string) => void
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      domainList: [],
      settings: { loginOpacity: 1, loginDarkenFactor: 0 },
      lang: 'en',
      setSettings: (s) => set({ settings: s }),
      setDomainList: (list) => set({ domainList: list }),
      setLang: (l) => {
        localStorage.setItem('lang', l)
        set({ lang: l })
      },
    }),
    {
      name: 'setting-store',
      partialize: (state) => ({ lang: state.lang }),
    }
  )
)
