import { useState } from 'react'
import type { Theme } from '../types'
import { useUserStore } from '../store/user'
import { updateName, updatePassword, deleteAccount } from '../request/my'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'

function toast(message: string, type = 'error') {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type } }))
}

interface SettingsProps {
  theme: Theme
  onThemeChange: (t: Theme) => void
}

interface SettingRowProps {
  label: string
  desc: string
  on: boolean
  setOn: (v: boolean) => void
}

function Toggle({ on, setOn }: { on: boolean; setOn: (v: boolean) => void }) {
  return (
    <div
      onClick={() => setOn(!on)}
      className={[
        'toggle-thumb w-[38px] h-[22px] rounded-full relative cursor-pointer transition-colors flex-shrink-0',
        on ? 'bg-accent' : 'bg-s3',
      ].join(' ')}
    />
  )
}

function SettingRow({ label, desc, on, setOn }: SettingRowProps) {
  return (
    <div
      className="flex items-center px-[18px] py-3.5 rounded-[12px] mb-1.5 gap-4"
      style={{ background: 'var(--surface-2)' }}
    >
      <div className="flex-1">
        <div
          className="font-semibold text-sm"
          style={{ color: 'var(--ink)' }}
          dangerouslySetInnerHTML={{ __html: label }}
        />
        <div
          className="text-[12.5px] mt-0.5"
          style={{ color: 'var(--ink-3)' }}
          dangerouslySetInnerHTML={{ __html: desc }}
        />
      </div>
      <Toggle on={on} setOn={setOn} />
    </div>
  )
}

type Section = 'account' | 'appearance' | 'inbox' | 'compose' | 'ai' | 'notifs' | 'privacy' | 'aliases'

const NAV_SECTIONS: { id: Section; label: string; icon: string }[] = [
  { id: 'account',    label: 'Account',       icon: 'users' },
  { id: 'appearance', label: 'Appearance',    icon: 'palette' },
  { id: 'inbox',      label: 'Inbox',         icon: 'inbox' },
  { id: 'compose',    label: 'Writing',       icon: 'edit' },
  { id: 'ai',         label: 'AI assistant',  icon: 'sparkle' },
  { id: 'notifs',     label: 'Notifications', icon: 'bell' },
  { id: 'privacy',    label: 'Privacy',       icon: 'lock' },
  { id: 'aliases',    label: 'Aliases',       icon: 'globe' },
]

export default function Settings({ theme, onThemeChange }: SettingsProps) {
  const user = useUserStore(s => s.user)
  const setUser = useUserStore(s => s.setUser)
  const clearUser = useUserStore(s => s.clearUser)

  const [section, setSection] = useState<Section>('account')
  const [density, setDensity] = useState('balanced')
  const [accent, setAccent]   = useState('sky')
  const [aiOn, setAiOn]       = useState(true)
  const [previewOn, setPreviewOn] = useState(true)
  const [autoArchive, setAutoArchive] = useState(false)
  const [reminders, setReminders]     = useState(true)

  // Account edit state
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput]     = useState('')
  const [savingName, setSavingName]   = useState(false)

  // Password change
  const [pwdOpen, setPwdOpen]   = useState(false)
  const [pwdForm, setPwdForm]   = useState({ password: '', newPwd: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  async function handleSaveName() {
    if (!nameInput.trim()) { toast('Name cannot be empty'); return }
    if (nameInput === user?.name) { setEditingName(false); return }
    setSavingName(true)
    try {
      await updateName(nameInput.trim())
      setUser({ ...user, name: nameInput.trim() } as any)
      toast('Name updated', 'success')
      setEditingName(false)
    } catch { /* interceptor shows error */ }
    finally { setSavingName(false) }
  }

  async function handleChangePwd() {
    if (!pwdForm.password || pwdForm.password.length < 6) { toast('Password must be at least 6 characters'); return }
    if (pwdForm.password !== pwdForm.newPwd) { toast('Passwords do not match'); return }
    setSavingPwd(true)
    try {
      await updatePassword(pwdForm.password, pwdForm.newPwd)
      toast('Password updated', 'success')
      setPwdOpen(false)
      setPwdForm({ password: '', newPwd: '' })
    } catch { /* interceptor */ }
    finally { setSavingPwd(false) }
  }

  async function handleDeleteAccount() {
    if (!confirm('This will permanently delete your account. Are you sure?')) return
    try {
      await deleteAccount()
      clearUser()
      localStorage.removeItem('token')
      window.location.replace('/login')
    } catch { /* interceptor */ }
  }

  const accents = [
    { id: 'sky',      color: '#5E8FB8', label: 'Sky' },
    { id: 'peach',    color: '#D87856', label: 'Peach' },
    { id: 'sage',     color: '#7AA078', label: 'Sage' },
    { id: 'lavender', color: '#8A78B0', label: 'Lavender' },
    { id: 'rose',     color: '#B86A82', label: 'Rose' },
  ]

  const SwatchRow = ({
    items,
    active,
    onSelect,
  }: {
    items: { id: string; label: string; bg?: string; dot?: string; style?: React.CSSProperties }[]
    active: string
    onSelect: (id: string) => void
  }) => (
    <div
      className="flex gap-2.5 px-[18px] py-3.5 rounded-[12px]"
      style={{ background: 'var(--surface-2)' }}
    >
      {items.map(t => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] font-semibold text-[13px] transition-all"
          style={{
            border: `2px solid ${active === t.id ? 'var(--accent)' : 'transparent'}`,
            ...(t.style || {}),
            ...(t.bg ? { background: t.bg } : {}),
          }}
        >
          {t.dot && (
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ background: t.dot, border: '1px solid var(--line)' }}
            />
          )}
          {t.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="grid gap-3 min-w-0" style={{ gridTemplateColumns: '220px 1fr' }}>
      {/* Nav */}
      <aside
        className="rounded-lg p-4 flex flex-col gap-0.5 shadow-1"
        style={{ background: 'var(--surface)' }}
      >
        <div
          className="font-serif text-[22px] font-medium px-3 pb-3.5 pt-2"
          style={{ color: 'var(--ink)' }}
        >
          Settings
        </div>
        {NAV_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={[
              'flex items-center gap-3 py-2 px-3 rounded-[10px] text-sm font-medium transition-all text-left',
              section === s.id ? 'shadow-1' : 'hover:bg-s3',
            ].join(' ')}
            style={
              section === s.id
                ? { background: 'var(--surface)', color: 'var(--ink)' }
                : { color: 'var(--ink-2)' }
            }
          >
            <span
              className="w-[18px] h-[18px] grid place-items-center flex-shrink-0"
              style={{ color: section === s.id ? 'var(--accent)' : 'var(--ink-3)' }}
            >
              <Icon name={s.icon} size={16} />
            </span>
            {s.label}
          </button>
        ))}
      </aside>

      {/* Content */}
      <main
        className="rounded-lg shadow-1 px-10 py-8 overflow-y-auto"
        style={{ background: 'var(--surface)' }}
      >
        {section === 'appearance' && (
          <>
            <h2
              className="font-serif font-medium tracking-[-0.01em] m-0 mb-1"
              style={{ fontSize: 28, color: 'var(--ink)' }}
            >
              Appearance
            </h2>
            <p className="text-sm m-0 mb-7" style={{ color: 'var(--ink-3)' }}>
              Make CloudMail feel like yours.
            </p>

            <div className="mb-8">
              <div
                className="text-xs font-bold tracking-[0.08em] uppercase mb-3"
                style={{ color: 'var(--ink-3)' }}
              >
                Theme
              </div>
              <SwatchRow
                active={theme}
                onSelect={v => onThemeChange(v as Theme)}
                items={[
                  { id: 'light', label: 'Light',        bg: '#F5F1EA', dot: '#FFFFFF', style: { color: '#2A2520' } },
                  { id: 'dark',  label: 'Dark',         bg: '#18161A', dot: '#25232A', style: { color: '#F2EDE5' } },
                  { id: 'auto',  label: 'Match system', bg: 'linear-gradient(90deg, #F5F1EA 50%, #18161A 50%)', dot: '#E8B89A', style: { color: '#2A2520' } },
                ]}
              />
            </div>

            <div className="mb-8">
              <div
                className="text-xs font-bold tracking-[0.08em] uppercase mb-3"
                style={{ color: 'var(--ink-3)' }}
              >
                Accent color
              </div>
              <SwatchRow
                active={accent}
                onSelect={setAccent}
                items={accents.map(a => ({
                  id: a.id,
                  label: a.label,
                  dot: a.color,
                  style: { background: 'var(--surface-2)', color: 'var(--ink)' },
                }))}
              />
            </div>

            <div className="mb-8">
              <div
                className="text-xs font-bold tracking-[0.08em] uppercase mb-3"
                style={{ color: 'var(--ink-3)' }}
              >
                Density
              </div>
              <SwatchRow
                active={density}
                onSelect={setDensity}
                items={['comfortable', 'balanced', 'compact'].map(d => ({
                  id: d,
                  label: d.charAt(0).toUpperCase() + d.slice(1),
                  style: { background: 'var(--surface-2)', color: 'var(--ink)' },
                }))}
              />
            </div>

            <div className="mb-8">
              <div
                className="text-xs font-bold tracking-[0.08em] uppercase mb-3"
                style={{ color: 'var(--ink-3)' }}
              >
                Reading pane
              </div>
              <SettingRow
                label="Show reading pane"
                desc="A second pane on the right opens the selected message inline."
                on={previewOn}
                setOn={setPreviewOn}
              />
              <SettingRow
                label="Show AI summary at the top of each thread"
                desc="A short summary appears above long messages — never on threads under 80 words."
                on={aiOn}
                setOn={setAiOn}
              />
            </div>
          </>
        )}

        {section === 'inbox' && (
          <>
            <h2
              className="font-serif font-medium tracking-[-0.01em] m-0 mb-1"
              style={{ fontSize: 28, color: 'var(--ink)' }}
            >
              Inbox
            </h2>
            <p className="text-sm m-0 mb-7" style={{ color: 'var(--ink-3)' }}>
              How your incoming mail is sorted.
            </p>
            <div className="mb-8">
              <div
                className="text-xs font-bold tracking-[0.08em] uppercase mb-3"
                style={{ color: 'var(--ink-3)' }}
              >
                Triage
              </div>
              <SettingRow
                label="Auto-archive read newsletters after 7 days"
                desc="Newsletters tagged Reading are tucked away — never deleted."
                on={autoArchive}
                setOn={setAutoArchive}
              />
              <SettingRow
                label="Bundle receipts &amp; recurring charges"
                desc="Stripe, banks, and subscriptions get grouped into a single Finance digest."
                on={true}
                setOn={() => {}}
              />
              <SettingRow
                label="Send-and-forget"
                desc="Hide replies-to-self until someone else writes back."
                on={false}
                setOn={() => {}}
              />
            </div>
            <div className="mb-8">
              <div
                className="text-xs font-bold tracking-[0.08em] uppercase mb-3"
                style={{ color: 'var(--ink-3)' }}
              >
                Reminders
              </div>
              <SettingRow
                label="Nudge me about emails awaiting a reply"
                desc="If a sent message hasn't had a response in 3 days, we'll surface it gently."
                on={reminders}
                setOn={setReminders}
              />
            </div>
          </>
        )}

        {section === 'ai' && (
          <>
            <h2
              className="font-serif font-medium tracking-[-0.01em] m-0 mb-1"
              style={{ fontSize: 28, color: 'var(--ink)' }}
            >
              AI assistant
            </h2>
            <p className="text-sm m-0 mb-7" style={{ color: 'var(--ink-3)' }}>
              A quiet helper that stays out of the way until you ask.
            </p>
            <div className="mb-8">
              <div
                className="text-xs font-bold tracking-[0.08em] uppercase mb-3"
                style={{ color: 'var(--ink-3)' }}
              >
                Drafting
              </div>
              <SettingRow
                label="Suggest replies"
                desc="Three short reply options under every thread. You can edit them before sending."
                on={true}
                setOn={() => {}}
              />
              <SettingRow
                label="Draft from a one-liner"
                desc="Type a sentence in compose and we'll expand it into a full message."
                on={true}
                setOn={() => {}}
              />
            </div>
            <div className="mb-8">
              <div
                className="text-xs font-bold tracking-[0.08em] uppercase mb-3"
                style={{ color: 'var(--ink-3)' }}
              >
                Understanding
              </div>
              <SettingRow
                label="Summaries on long threads"
                desc="A 2-sentence summary for any thread over 4 messages or 500 words."
                on={true}
                setOn={() => {}}
              />
              <SettingRow
                label="Extract tasks &amp; dates"
                desc="Spot deadlines, meetings, and to-dos. Send them to your calendar or task list."
                on={false}
                setOn={() => {}}
              />
            </div>
          </>
        )}

        {section === 'account' && (
          <>
            <h2 className="font-serif font-medium tracking-[-0.01em] m-0 mb-1" style={{ fontSize: 28, color: 'var(--ink)' }}>
              Account
            </h2>
            <p className="text-sm m-0 mb-7" style={{ color: 'var(--ink-3)' }}>
              Your profile and security settings.
            </p>

            {/* Profile */}
            <div className="flex items-center px-[18px] py-3.5 rounded-[12px] mb-1.5 gap-4" style={{ background: 'var(--surface-2)' }}>
              <Avatar name={user?.name || 'User'} size={48} radius={14} />
              <div className="flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="text-sm px-2 py-1 rounded-[8px] border bg-transparent outline-none flex-1"
                      style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false) }}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="px-3 py-1.5 rounded-[8px] text-xs font-semibold disabled:opacity-60"
                      style={{ background: 'var(--ink)', color: 'var(--surface)' }}
                    >
                      {savingName ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditingName(false)} className="text-xs px-2 py-1 rounded-[8px] hover:bg-s3 transition-colors" style={{ color: 'var(--ink-3)' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{user?.name || '—'}</div>
                )}
                <div className="text-[12.5px] mt-0.5" style={{ color: 'var(--ink-3)' }}>{user?.email || ''}</div>
              </div>
              {!editingName && (
                <button
                  onClick={() => { setNameInput(user?.name || ''); setEditingName(true) }}
                  className="inline-flex items-center gap-1.5 px-3 py-[9px] rounded-[10px] text-[13.5px] font-semibold transition-colors hover:bg-s3"
                  style={{ color: 'var(--ink-2)' }}
                >
                  Edit name
                </button>
              )}
            </div>

            {/* Password */}
            <div className="mt-6 mb-3">
              <div className="text-xs font-bold tracking-[0.08em] uppercase mb-3" style={{ color: 'var(--ink-3)' }}>Security</div>
              {!pwdOpen ? (
                <div className="flex items-center px-[18px] py-3.5 rounded-[12px] mb-1.5 gap-4" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Password</div>
                    <div className="text-[12.5px]" style={{ color: 'var(--ink-3)' }}>Change your login password</div>
                  </div>
                  <button
                    onClick={() => setPwdOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-[9px] rounded-[10px] text-[13.5px] font-semibold transition-colors hover:bg-s3"
                    style={{ color: 'var(--ink-2)' }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="px-[18px] py-4 rounded-[12px] flex flex-col gap-3" style={{ background: 'var(--surface-2)' }}>
                  <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    className="px-3 py-2 rounded-[8px] border text-sm bg-transparent outline-none"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                    value={pwdForm.password}
                    onChange={e => setPwdForm(f => ({ ...f, password: e.target.value }))}
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="px-3 py-2 rounded-[8px] border text-sm bg-transparent outline-none"
                    style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                    value={pwdForm.newPwd}
                    onChange={e => setPwdForm(f => ({ ...f, newPwd: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') handleChangePwd() }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePwd}
                      disabled={savingPwd}
                      className="px-4 py-2 rounded-[8px] text-sm font-semibold disabled:opacity-60"
                      style={{ background: 'var(--ink)', color: 'var(--surface)' }}
                    >
                      {savingPwd ? 'Saving…' : 'Update password'}
                    </button>
                    <button onClick={() => { setPwdOpen(false); setPwdForm({ password: '', newPwd: '' }) }} className="px-3 py-2 text-sm rounded-[8px] hover:bg-s3 transition-colors" style={{ color: 'var(--ink-3)' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Danger zone */}
            <div className="mt-6">
              <div className="text-xs font-bold tracking-[0.08em] uppercase mb-3" style={{ color: '#C46A7E' }}>Danger zone</div>
              <div className="flex items-center px-[18px] py-3.5 rounded-[12px] gap-4" style={{ background: 'var(--surface-2)', border: '1px solid #fecaca' }}>
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Delete account</div>
                  <div className="text-[12.5px]" style={{ color: 'var(--ink-3)' }}>Permanently delete your account and all data. This cannot be undone.</div>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center gap-1.5 px-3 py-[9px] rounded-[10px] text-[13.5px] font-semibold transition-colors hover:bg-rose-soft"
                  style={{ color: '#C46A7E' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        )}

        {(['compose', 'notifs', 'privacy', 'aliases'] as Section[]).includes(section) && (
          <>
            <h2
              className="font-serif font-medium tracking-[-0.01em] m-0 mb-1 capitalize"
              style={{ fontSize: 28, color: 'var(--ink)' }}
            >
              {NAV_SECTIONS.find(s => s.id === section)?.label}
            </h2>
            <p className="text-sm m-0 mb-7" style={{ color: 'var(--ink-3)' }}>
              Settings for this section.
            </p>
            <div
              className="flex items-center justify-center px-[18px] py-10 rounded-[12px]"
              style={{ background: 'var(--surface-2)' }}
            >
              <div className="text-center" style={{ color: 'var(--ink-3)' }}>
                <Icon name={NAV_SECTIONS.find(s => s.id === section)?.icon || 'settings'} size={28} />
                <div className="mt-2 text-[13px]">Settings for this section live here.</div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
