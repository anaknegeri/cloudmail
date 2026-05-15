import { useState, useEffect } from 'react'
import { useStarList } from '../hooks/useStarList'
import Reader from './Reader'
import type { ApiEmail } from '../types/api'
import { useMailStore } from '../store/mail'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  const diff = now.getTime() - d.getTime()
  if (diff < 7 * 24 * 3600 * 1000) {
    return d.toLocaleDateString('en', { weekday: 'short' })
  }
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export default function Starred() {
  const [selectedEmail, setSelectedEmail] = useState<ApiEmail | null>(null)
  const setComposeOpen = useMailStore(s => s.setComposeOpen)
  const setReplyEmail = useMailStore(s => s.setReplyEmail)
  const { emails, loading, hasMore, loadMore, refresh } = useStarList()

  // Initial load and reset on refresh button click
  const handleRefresh = async () => {
    await refresh()
    await loadMore()
  }

  useEffect(() => {
    handleRefresh()
  }, [])

  return (
    <div className="grid gap-3 min-w-0 overflow-hidden" style={{ gridTemplateColumns: selectedEmail ? '400px 1fr' : '1fr' }}>
      {/* Email List */}
      <div className="rounded-lg shadow-1 flex flex-col overflow-hidden" style={{ background: 'var(--surface)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--line)' }}>
          <h2 className="font-serif text-xl font-medium m-0" style={{ color: 'var(--ink)' }}>
            Starred
          </h2>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-s3 transition-colors"
            style={{ color: 'var(--ink-2)' }}
          >
            <Icon name="refresh-cw" size={16} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {emails.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--ink-3)' }}>
              <Icon name="star" size={48} />
              <p className="mt-4 text-sm">No starred emails</p>
            </div>
          )}

          {emails.map(email => (
            <button
              key={email.emailId}
              onClick={() => setSelectedEmail(email)}
              className={[
                'w-full flex items-start gap-3 px-5 py-3.5 border-b text-left transition-colors',
                selectedEmail?.emailId === email.emailId ? 'bg-s2' : 'hover:bg-s2',
              ].join(' ')}
              style={{ borderColor: 'var(--line)' }}
            >
              <Avatar name={email.sendName || email.sendEmail} size={40} radius={10} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm truncate" style={{ color: 'var(--ink)' }}>
                    {email.sendName || email.sendEmail}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--ink-3)' }}>
                    {formatTime(email.createTime)}
                  </span>
                </div>
                <div className="text-sm font-medium truncate mb-1" style={{ color: 'var(--ink)' }}>
                  {email.subject || '(no subject)'}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--ink-3)' }}>
                  {email.text || ''}
                </div>
              </div>
              <span style={{ color: 'var(--accent)' }}>
                <Icon name="star" size={16} />
              </span>
            </button>
          ))}

          {loading && (
            <div className="flex items-center justify-center py-4" style={{ color: 'var(--ink-3)' }}>
              Loading...
            </div>
          )}

          {hasMore && !loading && emails.length > 0 && (
            <button
              onClick={loadMore}
              className="w-full py-3 text-sm hover:bg-s2 transition-colors"
              style={{ color: 'var(--ink-2)' }}
            >
              Load more
            </button>
          )}
        </div>
      </div>

      {/* Reader */}
      {selectedEmail && (
        <Reader
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onDeleted={() => { setSelectedEmail(null); refresh() }}
          onReply={(email) => { setReplyEmail(email); setComposeOpen(true) }}
        />
      )}
    </div>
  )
}
