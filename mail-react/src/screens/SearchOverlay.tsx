import { useState, useEffect, useRef } from 'react'
import { EMAILS } from '../data'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'

interface SearchOverlayProps {
  onClose: () => void
  onSelect: (id: string) => void
}

export default function SearchOverlay({ onClose, onSelect }: SearchOverlayProps) {
  const [q, setQ] = useState('moodboard')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const results = EMAILS.filter(e =>
    !q ||
    e.subject.toLowerCase().includes(q.toLowerCase()) ||
    e.preview.toLowerCase().includes(q.toLowerCase()) ||
    e.from.toLowerCase().includes(q.toLowerCase())
  )

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
        {results.length > 0 ? (
          <div className="px-[18px] pb-3.5 pt-1.5">
            <div
              className="text-[10.5px] font-bold tracking-[0.08em] uppercase px-1.5 py-2.5"
              style={{ color: 'var(--ink-3)' }}
            >
              Messages — {results.length}
            </div>
            {results.slice(0, 5).map((e, i) => (
              <div
                key={e.id}
                className={[
                  'grid gap-3 px-3 py-[9px] rounded-[10px] cursor-pointer transition-colors',
                  i === 0 ? 'bg-s3' : 'hover:bg-s3',
                ].join(' ')}
                style={{ gridTemplateColumns: '32px 1fr auto' }}
                onClick={() => { onSelect(e.id); onClose() }}
              >
                <Avatar name={e.from} size={32} radius={10} />
                <div className="min-w-0">
                  <div
                    className="text-[13.5px] font-semibold truncate"
                    style={{ color: 'var(--ink)' }}
                  >
                    {highlight(e.subject)}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: 'var(--ink-3)' }}
                  >
                    {e.from} · {highlight(e.preview.slice(0, 80))}…
                  </div>
                </div>
                <div
                  className="text-[11.5px] self-center"
                  style={{ color: 'var(--ink-3)' }}
                >
                  {e.time}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-[18px] py-10 text-center text-[13px]" style={{ color: 'var(--ink-3)' }}>
            No matches for &ldquo;{q}&rdquo;
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
          <span className="ml-auto">Powered by CloudMail Search</span>
        </div>
      </div>
    </div>
  )
}
