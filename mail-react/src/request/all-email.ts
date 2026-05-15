import http from '../lib/http'
export function allEmailList(params: Record<string,unknown>) { return http.get('/allEmail/list', {params}) }
export function allEmailDelete(emailIds: string) { return http.delete('/allEmail/delete?emailIds=' + emailIds) }
export function allEmailBatchDelete(params: Record<string,unknown>) { return http.delete('/allEmail/batchDelete', {params}) }
export function allEmailLatest(emailId: number) { return http.get('/allEmail/latest', {params:{emailId}, noMsg:true, timeout:35000} as any) }
