import { useEffect, useRef } from 'react'
import type { ApiEmail } from '../types/api'
import { useAccountStore } from '../store/account'
import { useEmailListInit } from '../hooks/useEmailListInit'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'

type EmailFilter = 'all' | 'unread' | 'starred'

interface InboxListProps {
  selectedId: number | null
  filter: EmailFilter
  setFilter: (f: EmailFilter) => void
  onSelect: (email: ApiEmail) => void
  onOpenSearch: () => void
  emailType?: number  // 1=receive, 2=send, 3=draft
}

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

function dateGroup(isoString: string): string {
  const d = new Date(isoString)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  const diff = now.getTime() - d.getTime()
  if (diff < 7 * 24 * 3600 * 1000) return 'This week'
  return 'Earlier'
}

function getSenderName(email: ApiEmail): string {
  try {
    const parsed = JSON.parse(email.sendName || '{}')
    return parsed.name || parsed.address || email.sendEmail || ''
  } catch {
    return email.sendName || email.sendEmail || ''
  }
}

function getPreview(email: ApiEmail): string {
  try {
    const msg = JSON.parse(email.message || '{}')
    return (msg.message || '').replace(/<[^>]+>/g, '').slice(0, 100)
  } catch {
    return ''
  }
}

export default function InboxList({
  selectedId,
  filter,
  setFilter,
  onSelect,
  onOpenSearch,
  emailType = 1,
}: InboxListProps) {
  const { currentAccountId, currentAccount } = useAccountStore()
  const allReceive = currentAccount?.allReceive ?? 0
  const { emails, loading, hasMore, loadMore, unreadCount } = useEmailListInit({
    accountId: currentAccountId ?? undefined,
    allReceive,
    type: emailType,
  })

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) loadMore()
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loading, loadMore])

  const filtered = emails.filter(e => {
    if (filter === 'unread')  return e.unread === 1
    if (filter === 'starred') return e.isStar === 1
    return true
  })

  // Group by date
  const groups: { label: string; items: ApiEmail[] }[] = []
  const seen: Record<string, ApiEmail[]> = {}
  filtered.forEach(e => {
    const grp = dateGroup(e.createTime)
    if (!seen[grp]) { seen[grp] = []; groups.push({ label: grp, items: seen[grp] }) }
    seen[grp].push(e)
  })

  const filterChips: { id: EmailFilter; label: string; count?: number }[] = [
    { id: 'all',     label: 'All',     count: emails.length },
    { id: 'unread',  label: 'Unread',  count: unreadCount },
    { id: 'starred', label: 'Starred', count: emails.filter(e => e.isStar === 1).length },
  ]

  return (
    <section
      className="rounded-lg flex flex-col min-h-0 overflow-hidden shadow-1"
      style={{ background: 'var(--surface)' }}
    >
      <div className="px-5 pt-[18px] pb-3 flex flex-col gap-3 max-w-[1080px] w-full mx-auto">
        <div className="flex items-center justify-between">
          <div className="font-serif font-medium tracking-[-0.02em]" style={{ fontSize: 32, color: 'var(--ink)' }}>
            {emailType === 2 ? 'Sent' : emailType === 3 ? 'Drafts' : 'Inbox'}
          </div>
          <div className="text-[13px]" style={{ color: 'var(--ink-3)' }}>{unreadCount} unread</div>
        </div>
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-[9px] rounded-[12px] text-[13px] transition-colors hover:bg-bg-2 text-left"
          style={{ background: 'var(--surface-3)', color: 'var(--ink-3)' }}
        >
          <Icon name="search" size={15} />
          Search mail, people, files…
          <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-[6px] border font-mono" style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink-3)' }}>⌘K</span>
        </button>
      </div>

      <div className="flex gap-1.5 px-5 pb-2 overflow-x-auto hide-scrollbar max-w-[1080px] w-full mx-auto">
        {filterChips.map(c => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
            style={filter === c.id ? { background: 'var(--ink)', color: 'var(--surface)' } : { background: 'var(--surface-3)', color: 'var(--ink-2)' }}
          >
            {c.label}
            {c.count != null && <span className="tabular-nums opacity-70">{c.count}</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {groups.map(g => (
          <div key={g.label} className="mt-3 max-w-[1080px] mx-auto">
            <div className="text-[11px] font-semibold tracking-[0.08em] uppercase px-[14px] py-2" style={{ color: 'var(--ink-3)' }}>
              {g.label}
            </div>
            {g.items.map(e => (
              <EmailRow
                key={e.emailId}
                email={e}
                selected={selectedId === e.emailId}
                onClick={() => onSelect(e)}
              />
            ))}
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="py-10 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>No mail here.</div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />

        {loading && (
          <div className="py-4 text-center text-[12px]" style={{ color: 'var(--ink-3)' }}>Loading…</div>
        )}

        {!hasMore && emails.length > 0 && (
          <div className="py-4 text-center text-[12px]" style={{ color: 'var(--ink-3)' }}>All caught up ✓</div>
        )}
      </div>
    </section>
  )
}

interface EmailRowProps {
  email: ApiEmail
  selected: boolean
  onClick: () => void
}

function EmailRow({ email, selected, onClick }: EmailRowProps) {
  const senderName = getSenderName(email)
  const preview = getPreview(email)
  const unread = email.unread === 1

  return (
    <div
      className={['grid gap-[14px] px-[18px] py-[14px] rounded-[14px] cursor-pointer transition-colors', unread ? 'email-row-unread' : '', selected ? 'bg-accent-soft' : 'hover:bg-s3'].filter(Boolean).join(' ')}
      style={{ gridTemplateColumns: '44px 220px 1fr auto', alignItems: 'center' }}
      onClick={onClick}
    >
      <Avatar name={senderName} size={44} radius={14} />
      <div className="flex flex-col gap-px min-w-0">
        <span className="text-sm truncate" style={{ fontWeight: unread ? 700 : 600, color: 'var(--ink)' }}>{senderName}</span>
        <span className="text-xs truncate" style={{ color: 'var(--ink-3)' }}>{email.sendEmail}</span>
      </div>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-[13.5px] flex-shrink-0 truncate" style={{ fontWeight: unread ? 600 : 400, color: 'var(--ink)', maxWidth: 340 }}>{email.subject}</span>
        {preview && <span className="text-[13px] truncate" style={{ color: 'var(--ink-3)' }}>— {preview}</span>}
      </div>
      <div className="flex flex-row items-center gap-3 flex-shrink-0">
        {email.isStar === 1 && <span style={{ color: '#E8B355' }}><Icon name="star-fill" size={13} /></span>}
        {email.attachment && email.attachment !== '[]' && <span style={{ color: 'var(--ink-3)', opacity: 0.6 }}><Icon name="paperclip" size={13} /></span>}
        <span className="text-[12.5px] tabular-nums" style={{ color: unread ? 'var(--accent)' : 'var(--ink-3)', fontWeight: unread ? 600 : 400 }}>
          {formatTime(email.createTime)}
        </span>
      </div>
    </div>
  )
}
