import { useEffect, useState } from 'react'
import { useEmailList } from './useEmailList'
import type { UseEmailListParams } from './useEmailList'

// Wrapper hook: auto-loads first page on mount, polls every N seconds
export function useEmailListInit(params: UseEmailListParams, pollIntervalSec = 60) {
  const result = useEmailList(params)
  const { loadMore, pollLatest, refresh } = result
  const [key, setKey] = useState(0)

  // Reset when type or accountId changes (route change)
  useEffect(() => {
    setKey(k => k + 1)
    refresh().then(() => loadMore())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.accountId, params.type])

  // Poll for new emails
  useEffect(() => {
    if (pollIntervalSec < 10) return
    const id = setInterval(() => { pollLatest() }, pollIntervalSec * 1000)
    return () => clearInterval(id)
  }, [pollLatest, pollIntervalSec])

  return result
}
