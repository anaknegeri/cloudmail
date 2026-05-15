import { websiteConfig } from '../request/setting'
import { loginUserInfo } from '../request/my'
import { useSettingStore } from '../store/setting'
import { useUserStore } from '../store/user'
import { useAccountStore } from '../store/account'

let initialized = false

export async function initApp(): Promise<{ isLoggedIn: boolean }> {
  if (initialized) return { isLoggedIn: !!localStorage.getItem('token') }
  initialized = true

  const token = localStorage.getItem('token')

  try {
    if (token) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [setting, user]: [any, any] = await Promise.all([
        websiteConfig(),
        loginUserInfo().catch(() => null),
      ])

      const settingStore = useSettingStore.getState()
      settingStore.setSettings(setting)
      settingStore.setDomainList(setting?.domainList ?? [])
      if (setting?.title) document.title = setting.title

      if (user) {
        useUserStore.getState().setUser(user)
        useAccountStore.getState().setAccount(user.account.accountId, user.account)
        return { isLoggedIn: true }
      }

      localStorage.removeItem('token')
      return { isLoggedIn: false }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setting: any = await websiteConfig()
      const settingStore = useSettingStore.getState()
      settingStore.setSettings(setting)
      settingStore.setDomainList(setting?.domainList ?? [])
      if (setting?.title) document.title = setting.title
      return { isLoggedIn: false }
    }
  } catch (e) {
    console.error('[init] failed', e)
    return { isLoggedIn: false }
  }
}
