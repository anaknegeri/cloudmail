import http from '../lib/http'

export function loginUserInfo() {
  return http.get('/my/loginUserInfo')
}

export function updateName(name: string) {
  return http.put('/my/name', { name })
}

export function updatePassword(oldPassword: string, newPassword: string) {
  return http.put('/my/password', { oldPassword, newPassword })
}

export function deleteAccount() {
  return http.delete('/my/delete')
}

export function getAccounts() {
  return http.get('/my/accounts')
}

export function addAccount(address: string) {
  return http.post('/my/account', { address })
}

export function deleteMyAccount(accountId: number) {
  return http.delete('/my/account/' + accountId)
}

export function renameAccount(accountId: number, name: string) {
  return http.put('/my/account/' + accountId + '/name', { name })
}

export function setDefaultAccount(accountId: number) {
  return http.put('/my/account/' + accountId + '/default')
}
