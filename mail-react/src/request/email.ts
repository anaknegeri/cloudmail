import http from '../lib/http'

export function emailList(
  accountId?: number,
  allReceive?: number | boolean,
  emailId?: number,
  timeSort?: number,
  size?: number,
  type?: number | string
) {
  const params: any = {}
  if (accountId !== undefined) params.accountId = accountId
  if (allReceive !== undefined) params.allReceive = allReceive
  if (emailId !== undefined) params.emailId = emailId
  if (timeSort !== undefined) params.timeSort = timeSort
  if (size !== undefined) params.size = size
  if (type !== undefined) params.type = type
  return http.get('/email/list', { params })
}

export function emailDelete(emailIds: number | number[]) {
  const ids = Array.isArray(emailIds) ? emailIds.join(',') : emailIds
  return http.delete('/email/delete?emailIds=' + ids)
}

export function emailLatest(emailId: number, accountId?: number, allReceive?: number | boolean) {
  return http.get('/email/latest', {
    params: { emailId, accountId, allReceive },
    noMsg: true,
    timeout: 35_000,
  } as any)
}

export function emailRead(emailIds: number[]) {
  return http.put('/email/read', { emailIds })
}

export function emailSend(form: FormData | object, onProgress?: (e: ProgressEvent) => void) {
  return http.post('/email/send', form, {
    onUploadProgress: onProgress,
    noMsg: true,
  } as any)
}
