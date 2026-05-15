import { useState, useEffect, useRef } from 'react'
import type { ApiEmail, ApiAttachment } from '../types/api'
import { useSettingStore } from '../store/setting'
import { emailRead, emailDelete } from '../request/email'
import { starAdd, starCancel } from '../request/star'
import http from '../lib/http'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'

interface ReaderProps {
  email: ApiEmail | null
  onClose: () => void
  onDeleted: (emailId: number) => void
  onReply?: (email: ApiEmail) => void
}

function IconBtn({
  title, onClick, danger, active, children,
}: {
  title?: string
  onClick?: () => void
  danger?: boolean
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={[
        'w-[34px] h-[34px] grid place-items-center rounded-[10px] transition-all',
        danger  ? 'hover:bg-rose-soft hover:text-[#C46A7E]' : 'hover:bg-s3 text-ink-2 hover:text-ink',
        active  ? 'text-[#E8B355]' : '',
      ].join(' ')}
      style={{ color: active ? '#E8B355' : 'var(--ink-2)' }}
    >
      {children}
    </button>
  )
}

function getSenderName(email: ApiEmail): string {
  try {
    const p = JSON.parse(email.sendName || '{}')
    return p.name || p.address || email.sendEmail || ''
  } catch { return email.sendName || email.sendEmail || '' }
}

function getRecipients(email: ApiEmail): string {
  try {
    const arr = JSON.parse(email.recipient || '[]')
    return arr.map((r: {address: string; name?: string}) => r.address).join(', ')
  } catch { return '' }
}

function getAttachments(email: ApiEmail): ApiAttachment[] {
  try {
    return JSON.parse(email.attachment || '[]') as ApiAttachment[]
  } catch { return [] }
}

function getMessageText(email: ApiEmail): string {
  try {
    const msg = JSON.parse(email.message || '{}')
    return msg.message || ''
  } catch { return email.message || '' }
}

function formatR2Url(key: string, r2Domain: string): string {
  if (!key) return ''
  if (key.startsWith('http')) return key
  return `${r2Domain.replace(/\/$/, '')}/${key}`
}

function isImage(filename: string): boolean {
  return ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'jfif', 'webp'].some(ext =>
    filename.toLowerCase().endsWith(`.${ext}`)
  )
}

function markUnread(emailId: number) {
  return http.put('/email/markUnread', { emailIds: [emailId] })
}

// Shadow DOM iframe for HTML emails (XSS isolation)
function HtmlEmailFrame({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc) return
    doc.open()
    doc.write(`<!DOCTYPE html><html><head><style>body{margin:0;font-family:inherit;word-break:break-word;}img{max-width:100%}</style></head><body>${html}</body></html>`)
    doc.close()
    // auto-resize
    const resize = () => {
      if (iframe.contentDocument?.body) {
        iframe.style.height = iframe.contentDocument.body.scrollHeight + 'px'
      }
    }
    iframe.onload = resize
    setTimeout(resize, 300)
  }, [html])
  return <iframe ref={ref} className="w-full border-0" style={{ minHeight: 200 }} sandbox="allow-same-origin" title="email-content" />
}

export default function Reader({ email, onClose, onDeleted, onReply }: ReaderProps) {
  const settings = useSettingStore(s => s.settings)
  const r2Domain = settings?.r2Domain || ''

  const [starred, setStarred] = useState(false)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (!email) return
    setStarred(email.isStar === 1)
    // mark read
    if (email.unread === 1) {
      emailRead([email.emailId]).catch(console.error)
    }
  }, [email])

  // Keyboard shortcut: 'r' to reply
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (
        e.key === 'r' &&
        email &&
        onReply &&
        (document.activeElement as HTMLElement)?.tagName !== 'INPUT' &&
        (document.activeElement as HTMLElement)?.tagName !== 'TEXTAREA'
      ) {
        onReply(email)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [email, onReply])

  if (!email) {
    return (
      <section className="rounded-lg flex flex-col min-h-0 overflow-hidden shadow-1" style={{ background: 'var(--surface)' }}>
        <div className="flex-1 grid place-items-center p-10">
          <div className="text-center max-w-[380px]">
            <div className="relative w-[120px] h-[90px] mx-auto mb-[22px]">
              <div className="cloud-illus-1" />
              <div className="absolute rounded-full" style={{ width: 50, height: 18, left: 8, top: 64, background: 'var(--peach-soft)' }} />
              <div className="absolute rounded-full" style={{ width: 36, height: 14, right: 14, top: 12, background: 'var(--sage-soft)' }} />
            </div>
            <div className="font-serif text-2xl font-medium mb-2 tracking-[-0.01em]" style={{ color: 'var(--ink)' }}>
              A quiet inbox is a good inbox
            </div>
            <div className="text-[13.5px] leading-relaxed" style={{ color: 'var(--ink-3)' }}>
              Pick a message from the list to read it here, or start something new.
            </div>
          </div>
        </div>
      </section>
    )
  }

  const senderName = getSenderName(email)
  const recipients = getRecipients(email)
  const attachments = getAttachments(email)
  const messageText = getMessageText(email)
  const isHtml = email.messageType === 1 || (email.html != null && email.html !== '')
  const htmlContent = email.html || (isHtml ? messageText : '')

  // Replace {{domain}} placeholder in HTML
  const processedHtml = htmlContent.replace(/\{\{domain\}\}/g, r2Domain.replace(/\/$/, '') + '/')

  async function toggleStar() {
    const next = !starred
    setStarred(next)
    try {
      if (next) await starAdd(email!.emailId)
      else await starCancel(email!.emailId)
    } catch {
      setStarred(!next) // rollback
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this email?')) return
    try {
      await emailDelete(email!.emailId)
      onDeleted(email!.emailId)
      onClose()
    } catch { /* toast already shown by interceptor */ }
  }

  async function handleMarkUnread() {
    try {
      await markUnread(email!.emailId)
    } catch { /* toast already shown by interceptor */ }
  }

  return (
    <section className="rounded-lg flex flex-col min-h-0 overflow-hidden shadow-1" style={{ background: 'var(--surface)' }}>
      <div className="flex items-center gap-1 px-[18px] py-[14px]" style={{ borderBottom: '1px solid var(--line)' }}>
        <IconBtn title="Back to inbox" onClick={onClose}><Icon name="corner-up-left" size={17} /></IconBtn>
        <div className="w-px h-[18px] mx-1.5" style={{ background: 'var(--line)' }} />
        <IconBtn title="Star" active={starred} onClick={toggleStar}>
          <Icon name={starred ? 'star-fill' : 'star'} size={17} />
        </IconBtn>
        <IconBtn title="Trash" danger onClick={handleDelete}><Icon name="trash" size={17} /></IconBtn>
        <div className="w-px h-[18px] mx-1.5" style={{ background: 'var(--line)' }} />
        <IconBtn title="Mark unread" onClick={handleMarkUnread}><Icon name="mail" size={17} /></IconBtn>
        <div className="ml-auto flex items-center gap-1">
          <IconBtn title="Reply" onClick={() => onReply?.(email)}><Icon name="reply" size={17} /></IconBtn>
          <IconBtn title="Forward"><Icon name="forward" size={17} /></IconBtn>
          <div className="w-px h-[18px] mx-1.5" style={{ background: 'var(--line)' }} />
          <IconBtn title="More"><Icon name="more" size={17} /></IconBtn>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-10 pt-8 pb-20">
          <h1 className="font-serif font-medium leading-[1.15] tracking-[-0.02em] m-0 mb-[18px]" style={{ fontSize: 34, color: 'var(--ink)' }}>
            {email.subject}
          </h1>

          <div className="flex items-center gap-3 py-[14px] mb-6" style={{ borderBottom: '1px solid var(--line)' }}>
            <Avatar name={senderName} size={44} radius={14} />
            <div className="flex-1">
              <div className="font-semibold text-[15px]" style={{ color: 'var(--ink)' }}>
                {senderName}{' '}
                <span className="font-medium text-[13px]" style={{ color: 'var(--ink-3)' }}>&lt;{email.sendEmail}&gt;</span>
              </div>
              {recipients && (
                <div className="text-xs mt-0.5" style={{ color: 'var(--ink-3)' }}>to {recipients}</div>
              )}
            </div>
            <div className="text-[13px] text-right" style={{ color: 'var(--ink-3)' }}>
              {new Date(email.createTime).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>

          {/* Body */}
          <div className="text-[15px] leading-[1.65]" style={{ color: 'var(--ink)' }}>
            {isHtml
              ? <HtmlEmailFrame html={processedHtml} />
              : messageText.split('\n').map((line, i) => (
                  <p key={i} className="mb-2" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{line || '\u00A0'}</p>
                ))
            }
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-8">
              <div className="text-[12px] font-semibold uppercase tracking-[0.06em] mb-3" style={{ color: 'var(--ink-3)' }}>
                Attachments ({attachments.length})
              </div>
              <div className="flex gap-2.5 flex-wrap">
                {attachments.map((att, i) => {
                  const url = formatR2Url(att.key, r2Domain)
                  const ext = att.name.split('.').pop()?.toUpperCase() || 'FILE'
                  const img = isImage(att.name)
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[12px] min-w-[200px] cursor-pointer border transition-colors hover:bg-s3 no-underline"
                      style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}
                    >
                      {img
                        ? <img src={url} alt={att.name} className="w-9 h-9 rounded-[8px] object-cover flex-shrink-0" />
                        : <div className="w-9 h-9 rounded-[8px] grid place-items-center font-bold text-[10px] text-white flex-shrink-0" style={{ background: 'var(--accent)' }}>{ext}</div>
                      }
                      <div className="min-w-0">
                        <div className="font-semibold text-[13px] truncate" style={{ color: 'var(--ink)' }}>{att.name}</div>
                        <div className="text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
                          {att.size ? (att.size / 1024).toFixed(1) + ' KB' : ''}
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick reply */}
          <div className="mt-10 flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] border" style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}>
            <input
              className="flex-1 text-[14px] bg-transparent outline-none"
              placeholder={`Reply to ${senderName.split(' ')[0]}…`}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              style={{ color: 'var(--ink)' }}
            />
            <button className="w-8 h-8 rounded-[10px] grid place-items-center text-white flex-shrink-0" style={{ background: 'var(--accent)' }}>
              <Icon name="send" size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
