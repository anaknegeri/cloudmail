import { useState, useCallback, useRef } from 'react'
import type { ApiEmail, ApiEmailListResponse } from '../types/api'
import { emailList, emailLatest } from '../request/email'
import { useSettingStore } from '../store/setting'

const PAGE_SIZE = 20

export interface UseEmailListParams {
  accountId?: number
  allReceive?: number
  type?: number  // 1=receive, 2=send, 3=draft
}

export function useEmailList(params: UseEmailListParams = {}) {
  const { accountId, allReceive = 0, type = 0 } = params
  const [emails, setEmails]       = useState<ApiEmail[]>([])
  const [loading, setLoading]     = useState(false)
  const [firstLoad, setFirstLoad] = useState(true)
  const [hasMore, setHasMore]     = useState(true)
  const [total, setTotal]         = useState(0)
  const latestEmailRef            = useRef<ApiEmail | null>(null)
  const refreshing                = useRef(false)

  const unreadCount = emails.filter(e => e.unread === 1).length

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const lastEmail = emails[emails.length - 1]
      const res = (await emailList(
        accountId,
        allReceive,
        lastEmail?.emailId,
        0,
        PAGE_SIZE,
        type,
      ) as unknown) as ApiEmailListResponse | null

      if (!res || !res.list || res.list.length === 0) {
        setHasMore(false)
      } else {
        const list = res.list
        setEmails(prev => {
          const merged = [...prev, ...list]
          latestEmailRef.current = res.latestEmail ?? merged[0] ?? null
          return merged
        })
        setTotal(res.total ?? 0)
        if (list.length < PAGE_SIZE) setHasMore(false)
      }
    } catch (e) {
      console.error('[useEmailList] loadMore', e)
    } finally {
      setLoading(false)
      setFirstLoad(false)
    }
  }, [loading, hasMore, emails, accountId, allReceive, type])

  const refresh = useCallback(async () => {
    refreshing.current = true
    setEmails([])
    setHasMore(true)
    setFirstLoad(true)
    setLoading(false)
    setTotal(0)
    latestEmailRef.current = null
  }, [])

  const pollLatest = useCallback(async () => {
    const autoRefresh = useSettingStore.getState().settings?.autoRefresh ?? 0
    if (autoRefresh <= 1) return
    if (!latestEmailRef.current) return
    try {
      const newList = (await emailLatest(
        latestEmailRef.current.emailId,
        accountId,
        allReceive,
      ) as unknown) as ApiEmail[] | null
      if (newList && newList.length > 0) {
        setEmails(prev => {
          const ids = new Set(prev.map(e => e.emailId))
          const fresh = newList.filter(e => !ids.has(e.emailId))
          const merged = [...fresh, ...prev]
          latestEmailRef.current = merged[0] ?? null
          return merged
        })
      }
    } catch {
      // silently ignore poll errors
    }
  }, [accountId, allReceive])

  return { emails, loading, firstLoad, hasMore, loadMore, refresh, pollLatest, setEmails, unreadCount, total, refreshing }
}