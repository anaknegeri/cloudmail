import http from '../lib/http'

export function accountList() {
  return http.get('/my/accounts')
}
