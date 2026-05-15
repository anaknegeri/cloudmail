import http from '../lib/http'
export function regKeyList(params: Record<string,unknown>) { return http.get('/regKey/list', {params}) }
export function regKeyAdd(form: {code?:string; roleId:number; expireTime?:string; count:number}) { return http.post('/regKey/add', form) }
export function regKeyDelete(regKeyIds: string) { return http.delete('/regKey/delete?regKeyIds=' + regKeyIds) }
export function regKeyClearNotUse() { return http.delete('/regKey/clearNotUse') }
export function regKeyHistory(regKeyId: number) { return http.get('/regKey/history', {params:{regKeyId}}) }
