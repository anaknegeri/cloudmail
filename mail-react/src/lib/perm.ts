import { useUserStore } from '../store/user'

// All permission keys that grant access to specific routes
const PERM_ROUTES: Record<string, { path: string; name: string }[]> = {
  'email:send': [
    { path: '/sent', name: 'send' },
    { path: '/drafts', name: 'draft' },
  ],
  'user:query': [{ path: '/all-users', name: 'user' }],
  'role:query': [{ path: '/role', name: 'role' }],
  'setting:query': [{ path: '/system-setting', name: 'sys-setting' }],
  'reg-key:query': [{ path: '/invite-code', name: 'reg-key' }],
  'all-email:query': [{ path: '/all-mail', name: 'all-email' }],
  'analysis:query': [{ path: '/analysis', name: 'analysis' }],
}

export function hasPerm(permKey: string | string[], perms?: string[]): boolean {
  const keys = perms ?? useUserStore.getState().perms ?? []
  if (keys.includes('*')) return true
  if (Array.isArray(permKey)) return permKey.some((k) => keys.includes(k))
  return keys.includes(permKey)
}

export function getAllowedRouteNames(): Set<string> {
  const { perms } = useUserStore.getState()
  const allowed = new Set<string>()
  const isAdmin = perms.includes('*')

  for (const [perm, routes] of Object.entries(PERM_ROUTES)) {
    if (isAdmin || perms.includes(perm)) {
      routes.forEach((r) => allowed.add(r.name))
    }
  }
  return allowed
}
