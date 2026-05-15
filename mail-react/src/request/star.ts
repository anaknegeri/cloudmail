import http from '../lib/http'

export function starList(emailId?: number, size?: number) {
  return http.get('/star/list', { params: { emailId, size } })
}

export function starAdd(emailId: number) {
  return http.post('/star/add', { emailId })
}

export function starCancel(emailId: number) {
  return http.delete('/star/cancel', { params: { emailId } })
}
