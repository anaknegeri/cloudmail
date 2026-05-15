import { useEffect } from 'react'
import { useEmailList } from './useEmailList'
import type { UseEmailListParams } from './useEmailList'

// Wrapper hook: auto-loads first page on mount, polls every N seconds
export function useEmailListInit(params: UseEmailListParams, pollIntervalSec = 60) {
  const result = useEmailList(params)
  const { loadMore, firstLoad, pollLatest, refresh } = result

  // Load first page on mount or when params change
  useEffect(() => {
    loadMore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.accountId, params.allReceive, params.type])

  // Reset and reload when type changes
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.type])

  // Poll for new emails
  useEffect(() => {
    if (pollIntervalSec < 10) return
    const id = setInterval(() => { pollLatest() }, pollIntervalSec * 1000)
    return () => clearInterval(id)
  }, [pollLatest, pollIntervalSec])

  return result
}
