import http from '../lib/http'
export function userList(params: Record<string,unknown>) { return http.get('/user/list', {params}) }
export function userSetPwd(params: {userId:number; password:string}) { return http.put('/user/setPwd', params) }
export function userSetStatus(params: {userId:number; status:number}) { return http.put('/user/setStatus', params) }
export function userSetType(params: {userId:number; type:number}) { return http.put('/user/setType', params) }
export function userDelete(userIds: string) { return http.delete('/user/delete', {params:{userIds}}) }
export function userAdd(form: {email:string; password:string; roleId:number}) { return http.post('/user/add', form) }
export function userRestSendCount(userId: number) { return http.put('/user/resetSendCount', {userId}) }
export function userRestore(userId: number, type: number) { return http.put('/user/restore', {userId, type}) }
export function userAllAccount(userId: number, num: number, size: number) { return http.get('/user/allAccount', {params:{userId,num,size}}) }
export function userDeleteAccount(accountId: number) { return http.delete('/user/deleteAccount', {params:{accountId}}) }
