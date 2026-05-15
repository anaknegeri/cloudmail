import { useState } from 'react'
import type { Theme } from '../types'
import { useUserStore } from '../store/user'
import { useSettingStore } from '../store/setting'
import { accountSetName } from '../request/account'
import { resetPassword, userDelete } from '../request/my'
import Avatar from '../components/Avatar'
import Icon from '../components/Icon'

function toast(message: string, type = 'error') {
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, type } }))
}

interface SettingsProps {
  theme: Theme
  onThemeChange: (t: Theme) => void
}

export default function Settings({ theme, onThemeChange }: SettingsProps) {
  const user = useUserStore(s => s.user)
  const setUser = useUserStore(s => s.setUser)
  const clearUser = useUserStore(s => s.clearUser)
  const settings = useSettingStore(s => s.settings)
  const setLang = useSettingStore(s => s.setLang)
  const lang = useSettingStore(s => s.lang)

  // Name edit state
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)

  // Password change
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdForm, setPwdForm] = useState({ password: '', newPwd: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  async function handleSaveName() {
    if (!nameInput.trim()) { toast('Name cannot be empty'); return }
    if (nameInput === user?.name) { setEditingName(false); return }
    if (!user?.account?.accountId) { toast('No account selected'); return }
    setSavingName(true)
    try {
      await accountSetName(user.account.accountId, nameInput.trim())
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
      await resetPassword(pwdForm.password)
      toast('Password updated', 'success')
      setPwdOpen(false)
      setPwdForm({ password: '', newPwd: '' })
    } catch { /* interceptor */ }
    finally { setSavingPwd(false) }
  }

  async function handleDeleteAccount() {
    if (!confirm('This will permanently delete your account. Are you sure?')) return
    try {
      await userDelete()
      clearUser()
      localStorage.removeItem('token')
      window.location.replace('/login')
    } catch { /* interceptor */ }
  }

  function handleChangeLang(value: string) {
    setLang(value)
    toast(`Language set to ${value}`, 'success')
  }

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
        {/* Account - always shown */}
        <button
          className={[
            'flex items-center gap-3 py-2 px-3 rounded-[10px] text-sm font-medium transition-all text-left',
          ].join(' ')}
          style={{ background: 'var(--surface)', color: 'var(--ink)' }}
        >
          <span className="w-[18px] h-[18px] grid place-items-center flex-shrink-0" style={{ color: 'var(--accent)' }}>
            <Icon name="users" size={16} />
          </span>
          Account
        </button>
      </aside>

      {/* Content */}
      <main
        className="rounded-lg shadow-1 px-8 py-6 overflow-y-auto"
        style={{ background: 'var(--surface)' }}
      >
        {/* Profile */}
        <div className="mb-8">
          <div className="text-xs font-bold tracking-[0.08em] uppercase mb-4" style={{ color: 'var(--ink-3)' }}>
            Profile
          </div>
          <div
            className="flex items-center px-[18px] py-3.5 rounded-[12px] mb-1.5 gap-4"
            style={{ background: 'var(--surface-2)' }}
          >
            <div className="text-sm font-medium" style={{ minWidth: 100, color: 'var(--ink)' }}>
              Name
            </div>
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
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    {savingName ? 'Saving…' : 'Save'}
                  </button>
                </div>
              ) : (
                <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{user?.name || '—'}</span>
              )}
            </div>
            {!editingName && (
              <button
                onClick={() => { setNameInput(user?.name || ''); setEditingName(true) }}
                className="text-xs px-3 py-1.5 rounded-[8px] hover:opacity-80 transition-opacity"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Edit
              </button>
            )}
          </div>

          {/* Email Account - read only */}
          <div
            className="flex items-center px-[18px] py-3.5 rounded-[12px] mb-1.5 gap-4"
            style={{ background: 'var(--surface-2)' }}
          >
            <div className="text-sm font-medium" style={{ minWidth: 100, color: 'var(--ink)' }}>
              Email
            </div>
            <div className="flex-1 text-sm" style={{ color: 'var(--ink-2)' }}>
              {user?.email || '—'}
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="mb-8">
          <div className="text-xs font-bold tracking-[0.08em] uppercase mb-4" style={{ color: 'var(--ink-3)' }}>
            Password
          </div>
          {!pwdOpen ? (
            <div
              className="flex items-center px-[18px] py-3.5 rounded-[12px] mb-1.5 gap-4"
              style={{ background: 'var(--surface-2)' }}
            >
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Change Password</div>
              </div>
              <button
                onClick={() => setPwdOpen(true)}
                className="px-3 py-1.5 rounded-[8px] text-xs font-semibold"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Change
              </button>
            </div>
          ) : (
            <div
              className="px-[18px] py-4 rounded-[12px] flex flex-col gap-3"
              style={{ background: 'var(--surface-2)' }}
            >
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
              />
              <div className="flex gap-2">
                <button
                  onClick={handleChangePwd}
                  disabled={savingPwd}
                  className="px-3 py-1.5 rounded-[8px] text-xs font-semibold disabled:opacity-60"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {savingPwd ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setPwdOpen(false); setPwdForm({ password: '', newPwd: '' }) }}
                  className="px-3 py-1.5 rounded-[8px] text-xs font-medium"
                  style={{ color: 'var(--ink-2)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Language */}
        <div className="mb-8">
          <div className="text-xs font-bold tracking-[0.08em] uppercase mb-4" style={{ color: 'var(--ink-3)' }}>
            Language
          </div>
          <div
            className="flex items-center px-[18px] py-3.5 rounded-[12px] mb-1.5 gap-4"
            style={{ background: 'var(--surface-2)' }}
          >
            <div className="text-sm font-medium" style={{ minWidth: 100, color: 'var(--ink)' }}>
              Language
            </div>
            <select
              className="px-3 py-2 rounded-[8px] border text-sm bg-transparent outline-none"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)', background: 'transparent' }}
              value={lang}
              onChange={e => handleChangeLang(e.target.value)}
            >
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Delete Account */}
        <div className="mb-8">
          <div className="text-xs font-bold tracking-[0.08em] uppercase mb-4" style={{ color: 'var(--ink-3)' }}>
            Danger Zone
          </div>
          <div
            className="flex items-center px-[18px] py-3.5 rounded-[12px] mb-1.5 gap-4"
            style={{ background: 'var(--surface-2)' }}
          >
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Delete Account</div>
              <div className="text-[12.5px] mt-0.5" style={{ color: 'var(--ink-3)' }}>
                This will permanently delete your account. This action cannot be undone.
              </div>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-3 py-1.5 rounded-[8px] text-xs font-semibold"
              style={{ background: '#ef4444', color: 'white' }}
            >
              Delete Account
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}