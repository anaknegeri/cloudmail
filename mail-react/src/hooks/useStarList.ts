import { useState, useCallback } from 'react'
import type { ApiEmail } from '../types/api'
import { starList } from '../request/star'

export function useStarList() {
  const [emails, setEmails] = useState<ApiEmail[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const lastEmailId = emails.length > 0 ? emails[emails.length - 1].emailId : undefined
      const res = await starList(lastEmailId, 20) as unknown as { list: ApiEmail[] } | ApiEmail[]
      const newEmails = Array.isArray(res) ? res : (res?.list ?? [])
      if (newEmails.length === 0) {
        setHasMore(false)
      } else {
        setEmails(prev => [...prev, ...newEmails])
      }
    } catch (err) {
      console.error('Failed to load starred emails:', err)
    } finally {
      setLoading(false)
    }
  }, [emails, loading, hasMore])

  const refresh = useCallback(() => {
    setEmails([])
    setHasMore(true)
    setLoading(false)
  }, [])

  return {
    emails,
    loading,
    hasMore,
    loadMore,
    refresh,
  }
}
