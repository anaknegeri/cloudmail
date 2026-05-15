import http from '../lib/http'

export function accountList(accountId?: number, size?: number, lastSort?: number) {
  return http.get('/account/list', { params: { accountId, size, lastSort } })
}

export function accountAdd(email: string, token: string) {
  return http.post('/account/add', { email, token })
}

export function accountSetName(accountId: number, name: string) {
  return http.put('/account/setName', { name, accountId })
}

export function accountDelete(accountId: number) {
  return http.delete('/account/delete', { params: { accountId } })
}

export function accountSetAllReceive(accountId: number) {
  return http.put('/account/setAllReceive', { accountId })
}

export function accountSetAsTop(accountId: number) {
  return http.put('/account/setAsTop', { accountId })
}
