import { useState, useRef, useCallback } from 'react'
import { emailSend } from '../request/email'
import { useAccountStore } from '../store/account'
import { useUserStore } from '../store/user'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'

interface ComposeProps {
  onClose: () => void
  // For reply/forward
  replyTo?: {
    emailId: number
    subject: string
    sendEmail: string
    sendName: string
  }
}

interface Recipient {
  name: string
  email: string
}

function parseEmail(raw: string): Recipient | null {
  raw = raw.trim()
  if (!raw) return null
  const m = raw.match(/^(.+?)\s*<([^>]+)>$/)
  if (m) return { name: m[1].trim(), email: m[2].trim() }
  if (raw.includes('@')) return { name: raw.split('@')[0], email: raw }
  return null
}

function toast(message: string, type = 'error') {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type } }))
}

export default function Compose({ onClose, replyTo }: ComposeProps) {
  const { currentAccountId } = useAccountStore()
  const user = useUserStore(s => s.user)

  const [to, setTo]           = useState<Recipient[]>([])
  const [cc, setCc]           = useState<Recipient[]>([])
  const [showCc, setShowCc]   = useState(false)
  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject.replace(/^Re:\s*/i, '')}` : ''
  )
  const [body, setBody]       = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const [toInput, setToInput] = useState(replyTo?.sendEmail ?? '')
  const [ccInput, setCcInput] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  function addRecipient(
    raw: string,
    list: Recipient[],
    setList: (r: Recipient[]) => void,
    setInput: (s: string) => void
  ) {
    const r = parseEmail(raw)
    if (r && !list.find(x => x.email === r.email)) {
      setList([...list, r])
    }
    setInput('')
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    value: string,
    list: Recipient[],
    setList: (r: Recipient[]) => void,
    setInput: (s: string) => void
  ) {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault()
      addRecipient(value, list, setList, setInput)
    }
  }

  function removeRecipient(email: string, list: Recipient[], setList: (r: Recipient[]) => void) {
    setList(list.filter(r => r.email !== email))
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
    e.target.value = ''
  }

  const handleSend = useCallback(async () => {
    // flush any pending input
    const allTo = [...to]
    const raw = toInput.trim()
    if (raw) {
      const r = parseEmail(raw)
      if (r && !allTo.find(x => x.email === r.email)) allTo.push(r)
    }

    if (allTo.length === 0) { toast('Please add at least one recipient'); return }
    if (!subject.trim()) { toast('Subject cannot be empty'); return }
    if (!body.trim()) { toast('Message body cannot be empty'); return }

    setSending(true)
    try {
      const form = new FormData()
      form.append('accountId', String(currentAccountId ?? ''))
      form.append('subject', subject)
      form.append('message', JSON.stringify({ message: body }))
      form.append('messageType', '0')
      form.append('recipient', JSON.stringify(allTo.map(r => ({ address: r.email, name: r.name }))))
      if (cc.length > 0) {
        form.append('cc', JSON.stringify(cc.map(r => ({ address: r.email, name: r.name }))))
      }
      if (replyTo?.emailId) {
        form.append('replyEmailId', String(replyTo.emailId))
      }
      attachments.forEach(f => form.append('files', f))

      await emailSend(form)
      toast('Email sent successfully', 'success')
      onClose()
    } catch {
      // error toast handled by interceptor
    } finally {
      setSending(false)
    }
  }, [to, toInput, cc, subject, body, attachments, currentAccountId, replyTo, onClose])

  const senderEmail = user?.email ?? ''
  const senderName  = user?.name ?? ''

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end justify-center p-5 animate-fade-in"
      style={{ background: 'rgba(20, 16, 12, 0.3)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[720px] flex flex-col overflow-hidden rounded-xl shadow-pop animate-slide-up"
        style={{ background: 'var(--surface)', maxHeight: 'calc(100vh - 40px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="font-serif text-[18px] font-medium" style={{ color: 'var(--ink)' }}>
            {replyTo ? 'Reply' : 'New message'}
          </div>
          <div className="ml-auto flex gap-1">
            <button
              onClick={onClose}
              className="w-[34px] h-[34px] grid place-items-center rounded-[10px] transition-all hover:bg-s3"
              style={{ color: 'var(--ink-2)' }}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        {/* From */}
        <div className="flex items-center px-[22px] py-[10px] gap-3" style={{ borderBottom: '1px solid var(--line-2)' }}>
          <label className="w-14 text-xs font-semibold tracking-[0.04em] uppercase flex-shrink-0" style={{ color: 'var(--ink-3)' }}>From</label>
          <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--ink-2)' }}>
            <Avatar name={senderName} size={20} radius={999} />
            {senderName} &lt;{senderEmail}&gt;
          </span>
        </div>

        {/* To */}
        <RecipientField
          label="To"
          recipients={to}
          inputValue={toInput}
          onInputChange={setToInput}
          onKeyDown={e => handleKeyDown(e, toInput, to, setTo, setToInput)}
          onBlur={() => addRecipient(toInput, to, setTo, setToInput)}
          onRemove={email => removeRecipient(email, to, setTo)}
          extra={!showCc ? (
            <button className="text-xs px-2 py-1 transition-colors hover:bg-s3 rounded flex-shrink-0" style={{ color: 'var(--ink-3)' }} onClick={() => setShowCc(true)}>
              Cc / Bcc
            </button>
          ) : undefined}
        />

        {showCc && (
          <RecipientField
            label="Cc"
            recipients={cc}
            inputValue={ccInput}
            onInputChange={setCcInput}
            onKeyDown={e => handleKeyDown(e, ccInput, cc, setCc, setCcInput)}
            onBlur={() => addRecipient(ccInput, cc, setCc, setCcInput)}
            onRemove={email => removeRecipient(email, cc, setCc)}
          />
        )}

        {/* Subject */}
        <div className="flex items-center px-[22px] py-[11px] gap-3" style={{ borderBottom: '1px solid var(--line-2)' }}>
          <label className="w-14 text-xs font-semibold tracking-[0.04em] uppercase flex-shrink-0" style={{ color: 'var(--ink-3)' }}>Subject</label>
          <input
            className="flex-1 text-sm bg-transparent outline-none"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="What is this about?"
            style={{ color: 'var(--ink)' }}
          />
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 px-[22px] pt-[18px] pb-0 overflow-y-auto" style={{ minHeight: 240 }}>
          <textarea
            className="flex-1 resize-none text-[14.5px] leading-[1.6] bg-transparent outline-none"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: 'var(--ink)' }}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your message…"
            autoFocus
          />
        </div>

        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex gap-2 flex-wrap px-5 py-2" style={{ borderTop: '1px solid var(--line-2)' }}>
            {attachments.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs" style={{ background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
                <Icon name="paperclip" size={12} />
                <span className="max-w-[120px] truncate">{f.name}</span>
                <button onClick={() => setAttachments(a => a.filter((_, j) => j !== i))} style={{ color: 'var(--ink-3)' }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-3" style={{ borderTop: '1px solid var(--line)', background: 'var(--surface-2)' }}>
          <button
            onClick={handleSend}
            disabled={sending}
            className="inline-flex items-center gap-1.5 px-5 py-[9px] rounded-[10px] text-[13.5px] font-semibold transition-all hover:shadow-2 hover:-translate-y-px disabled:opacity-60"
            style={{ background: 'var(--ink)', color: 'var(--surface)' }}
          >
            {sending ? 'Sending…' : 'Send'}
            {!sending && <Icon name="arrow-right" size={14} />}
          </button>

          {/* Attach file */}
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-[9px] rounded-[10px] text-[13.5px] font-semibold transition-colors hover:bg-s3"
            style={{ color: 'var(--ink-2)' }}
            title="Attach file"
          >
            <Icon name="paperclip" size={15} />
          </button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={onFileChange} />

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-[34px] h-[34px] grid place-items-center rounded-[10px] transition-all hover:bg-rose-soft"
              style={{ color: 'var(--ink-2)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C46A7E')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-2)')}
              title="Discard"
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── RecipientField ────────────────────────────────────────────────────────────
function RecipientField({
  label, recipients, inputValue, onInputChange, onKeyDown, onBlur, onRemove, extra,
}: {
  label: string
  recipients: Recipient[]
  inputValue: string
  onInputChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onBlur: () => void
  onRemove: (email: string) => void
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-center px-[22px] py-[10px] gap-3" style={{ borderBottom: '1px solid var(--line-2)' }}>
      <label className="w-14 text-xs font-semibold tracking-[0.04em] uppercase flex-shrink-0" style={{ color: 'var(--ink-3)' }}>{label}</label>
      <div className="flex-1 flex flex-wrap gap-1.5 items-center min-w-0">
        {recipients.map(r => (
          <span key={r.email} className="inline-flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full text-[12.5px] font-medium" style={{ background: 'var(--accent-soft)', color: 'var(--ink)' }}>
            <Avatar name={r.name} size={20} radius={999} />
            {r.name || r.email}
            <button className="text-sm px-0.5" style={{ color: 'var(--ink-3)' }} onClick={() => onRemove(r.email)}>×</button>
          </span>
        ))}
        <input
          className="min-w-[120px] flex-1 py-0.5 text-sm bg-transparent outline-none"
          placeholder={recipients.length === 0 ? 'Add recipient…' : ''}
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          style={{ color: 'var(--ink)' }}
        />
      </div>
      {extra}
    </div>
  )
}
