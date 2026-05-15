import http from '../lib/http'

export function websiteConfig() {
  return http.get('/public/website-config', { noMsg: true } as any)
}

export function settingSet(setting: Record<string,unknown>) { return http.put('/setting/set', setting) }
export function settingQuery() { return http.get('/setting/query') }
export function setBackground(background: string) { return http.put('/setting/setBackground', {background}) }
export function deleteBackground() { return http.delete('/setting/deleteBackground') }
export function setBlackList(params: Record<string,unknown>) { return http.put('/setting/setBlacklist', params) }
