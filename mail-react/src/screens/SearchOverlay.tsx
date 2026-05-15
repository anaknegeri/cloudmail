import { useState, useEffect, useRef } from 'react'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'
import { emailSearch } from '../request/email'
import type { ApiEmail } from '../types/api'

interface SearchOverlayProps {
  onClose: () => void
  onSelect: (emailId: number) => void
}

export default function SearchOverlay({ onClose, onSelect }: SearchOverlayProps) {
  const [q, setQ] = useState('')
  const [emails, setEmails] = useState<ApiEmail[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number>()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // Search dengan debounce 300ms
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!q || q.trim() === '') {
      setEmails([])
      setTotal(0)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(() => {
      emailSearch(q.trim(), 50)
        .then((res: any) => {
          setEmails(res?.list ?? [])
          setTotal(res?.total ?? 0)
        })
        .catch(err => {
          console.error(err)
          setEmails([])
          setTotal(0)
        })
        .finally(() => setLoading(false))
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [q])

  const highlight = (text: string) => {
    if (!q) return <>{text}</>
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return <>{text}</>
    return (
      <>
        {text.slice(0, idx)}
        <mark
          className="px-0.5 rounded-[3px]"
          style={{ background: 'var(--sunshine)', color: 'var(--ink)' }}
        >
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-start justify-center animate-fade-in"
      style={{
        background: 'rgba(20, 16, 12, 0.35)',
        backdropFilter: 'blur(8px)',
        paddingTop: '12vh',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-xl overflow-hidden animate-slide-up shadow-pop"
        style={{ background: 'var(--surface)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-[22px] py-[18px]"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            className="flex-1 text-base font-serif"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search mail, people, files…"
            style={{ fontSize: 16, fontFamily: 'Newsreader, Georgia, serif', color: 'var(--ink)' }}
          />
          <button
            className="w-[34px] h-[34px] grid place-items-center rounded-[10px] transition-colors hover:bg-s3"
            style={{ color: 'var(--ink-2)' }}
            onClick={onClose}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Filter chips */}
        <div
          className="flex gap-1.5 px-[18px] py-2.5 flex-wrap"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          {[
            { label: 'Any', active: true },
            { label: 'Has files', icon: 'paperclip' },
            { label: 'Starred',   icon: 'star' },
            { label: 'From: anyone' },
            { label: 'Last 30 days' },
          ].map((c, i) => (
            <button
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={
                c.active
                  ? { background: 'var(--ink)', color: 'var(--surface)' }
                  : { background: 'var(--surface-3)', color: 'var(--ink-2)' }
              }
            >
              {c.icon && <Icon name={c.icon} size={11} />}
              {c.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="px-[18px] py-10 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>
            Searching…
          </div>
        ) : emails.length > 0 ? (
          <div className="px-[18px] pb-3.5 pt-1.5">
            <div
              className="text-[10.5px] font-bold tracking-[0.08em] uppercase px-1.5 py-2.5"
              style={{ color: 'var(--ink-3)' }}
            >
              Messages — {emails.length} {total > emails.length && `of ${total}`}
            </div>
            {emails.slice(0, 5).map((e: ApiEmail, i: number) => (
              <div
                key={e.emailId}
                className={[
                  'grid gap-3 px-3 py-[9px] rounded-[10px] cursor-pointer transition-colors',
                  i === 0 ? 'bg-s3' : 'hover:bg-s3',
                ].join(' ')}
                style={{ gridTemplateColumns: '32px 1fr auto' }}
                onClick={() => { onSelect(e.emailId); onClose() }}
              >
                <Avatar name={e.name || e.sendEmail || 'Unknown'} size={32} radius={10} />
                <div className="min-w-0">
                  <div
                    className="text-[13.5px] font-semibold truncate"
                    style={{ color: 'var(--ink)' }}
                  >
                    {highlight(e.subject || '(no subject)')}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: 'var(--ink-3)' }}
                  >
                    {e.name || e.sendEmail} · {highlight((e.text || '').slice(0, 80))}…
                  </div>
                </div>
                <div
                  className="text-[11.5px] self-center"
                  style={{ color: 'var(--ink-3)' }}
                >
                  {e.createTime ? new Date(e.createTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </div>
              </div>
            ))}
          </div>
        ) : q ? (
          <div className="px-[18px] py-10 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>
            No matches for "{q}"
          </div>
        ) : (
          <div className="px-[18px] py-10 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>
            Type to search all your emails…
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center gap-3.5 px-[18px] py-2.5 text-[11px]"
          style={{ background: 'var(--surface-2)', color: 'var(--ink-3)' }}
        >
          {[
            { keys: ['↑', '↓'], label: 'navigate' },
            { keys: ['↵'],       label: 'open' },
            { keys: ['esc'],     label: 'close' },
          ].map(item => (
            <span key={item.label} className="flex items-center gap-0.5">
              {item.keys.map(k => (
                <kbd
                  key={k}
                  className="text-[10.5px] px-[5px] py-px rounded-[5px] border font-mono mr-1"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--line)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {k}
                </kbd>
              ))}
              {item.label}
            </span>
          ))}
          {total > 0 && (
            <span className="ml-auto text-[10px]" style={{ color: 'var(--ink-3)' }}>
              Full-text search · {total} total
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
