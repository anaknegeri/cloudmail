import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/user'
import { useSettingStore } from '../store/setting'
import { useAccountStore } from '../store/account'
import { useMailStore } from '../store/mail'
import { hasPerm } from '../lib/perm'
import Avatar from './Avatar'
import Icon from './Icon'

interface SidebarProps {
  onCompose: () => void
  accounts: { accountId: number; email: string; allReceive: number }[]
  onSwitchAccount: (accountId: number) => void
}

const MAIN_NAV: { id: string; label: string; icon: string; to: string }[] = [
  { id: 'inbox', label: 'Inbox',   icon: 'inbox',     to: '/' },
  { id: 'sent',  label: 'Sent',   icon: 'send',      to: '/sent' },
  { id: 'draft', label: 'Drafts', icon: 'file-text', to: '/draft' },
  { id: 'star',  label: 'Starred',icon: 'star',       to: '/star' },
]

const MANAGE_NAV: { id: string; label: string; icon: string; to: string; perm: string }[] = [
  { id: 'all-email',   label: 'All Mail',        icon: 'mail',        to: '/admin/all-email',   perm: 'all-email:query' },
  { id: 'user',       label: 'All Users',       icon: 'users',       to: '/admin/users',       perm: 'user:query' },
  { id: 'role',       label: 'Permissions',    icon: 'lock',        to: '/admin/roles',       perm: 'role:query' },
  { id: 'analysis',   label: 'Analytics',       icon: 'bar-chart-2', to: '/admin/analysis',   perm: 'analysis:query' },
  { id: 'reg-key',    label: 'Invite Codes',    icon: 'key',         to: '/admin/reg-keys',    perm: 'reg-key:query' },
  { id: 'sys-setting',label: 'System Settings', icon: 'settings',   to: '/admin/settings',    perm: 'setting:query' },
]

// Labels section (placeholder — actual labels from API later)
const LABELS_NAV: { id: string; label: string; color: string; to: string }[] = [
  { id: 'label-work',     label: 'Work',     color: '#5E8FB8', to: '/label/work' },
  { id: 'label-personal', label: 'Personal', color: '#E8B89A', to: '/label/personal' },
  { id: 'label-travel',   label: 'Travel',   color: '#A8C0A4', to: '/label/travel' },
  { id: 'label-finance',  label: 'Finance',  color: '#B8A8C8', to: '/label/finance' },
]

const navItemStyle = (active: boolean): React.CSSProperties => ({
  background: active ? 'var(--surface)' : undefined,
  color: active ? 'var(--ink)' : 'var(--ink-2)',
})

const iconColor = (active: boolean): React.CSSProperties => ({
  color: active ? 'var(--accent)' : 'var(--ink-3)',
})

export default function Sidebar({ onCompose, accounts, onSwitchAccount }: SidebarProps) {
  const user = useUserStore(s => s.user)
  const perms = useUserStore(s => s.perms)
  const settings = useSettingStore(s => s.settings)
  const currentAccount = useAccountStore(s => s.currentAccount)
  const { setComposeOpen } = useMailStore()
  const navigate = useNavigate()

  const [showAccounts, setShowAccounts] = useState(false)
  const hasManage = MANAGE_NAV.some(item => hasPerm(item.perm, perms))

  return (
    <aside className="flex flex-col bg-transparent py-2 px-1 gap-1 overflow-y-auto" style={{ minWidth: 0 }}>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3" style={{ paddingBottom: 18 }}>
        <div
          className="brand-mark w-8 h-8 rounded-[10px] grid place-items-center relative flex-shrink-0 shadow-1"
          style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--lavender) 100%)' }}
        />
        <div className="font-serif text-[22px] font-medium tracking-tight leading-none">
          {settings?.title || 'Cloud'}
          <em className="not-italic" style={{ color: 'var(--accent)' }}>mail</em>
        </div>
      </div>

      {/* Compose */}
      <button
        onClick={onCompose}
        className="flex items-center gap-2.5 py-3 px-4 mx-1 mb-3.5 rounded-[16px] font-semibold text-sm shadow-1 transition-all hover:-translate-y-px hover:shadow-2 active:translate-y-0"
        style={{ background: 'var(--ink)', color: 'var(--surface)' }}
      >
        <span className="w-[22px] h-[22px] rounded-[7px] grid place-items-center flex-shrink-0" style={{ background: 'var(--accent)', color: 'white' }}>
          <Icon name="edit" size={13} stroke={2.2} />
        </span>
        Compose
      </button>

      {/* Main Nav */}
      <div className="px-4 pt-1 pb-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--ink-3)' }}>
        Mail
      </div>
      {MAIN_NAV.map(item => (
        <NavLink
          key={item.id}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 py-2 px-3 mx-1 rounded-[10px] text-sm font-medium transition-all text-left no-underline ${isActive ? 'shadow-1' : 'hover:bg-s3'}`
          }
          style={({ isActive }) => ({ ...navItemStyle(isActive), ...(isActive ? {} : {}) })}
        >
          {({ isActive }) => (
            <>
              <span className="w-[18px] h-[18px] grid place-items-center flex-shrink-0" style={iconColor(isActive)}>
                <Icon name={item.icon} size={17} />
              </span>
              <span className="flex-1">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}

      {/* Labels */}
      <div className="px-4 pt-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--ink-3)' }}>
        Labels
      </div>
      {LABELS_NAV.map(item => (
        <NavLink
          key={item.id}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 py-2 px-3 mx-1 rounded-[10px] text-sm font-medium transition-all text-left no-underline ${isActive ? 'shadow-1' : 'hover:bg-s3'}`
          }
          style={({ isActive }) => navItemStyle(isActive)}
        >
          {({ isActive }) => (
            <>
              <span className="w-[18px] h-[18px] grid place-items-center flex-shrink-0" style={iconColor(isActive)}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
              </span>
              <span className="flex-1">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}

      {/* Settings */}
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center gap-3 py-2 px-3 mx-1 rounded-[10px] text-sm font-medium transition-all text-left no-underline ${isActive ? 'shadow-1' : 'hover:bg-s3'}`
        }
        style={({ isActive }) => navItemStyle(isActive)}
      >
        {({ isActive }) => (
          <>
            <span className="w-[18px] h-[18px] grid place-items-center flex-shrink-0" style={iconColor(isActive)}>
              <Icon name="settings" size={17} />
            </span>
            <span className="flex-1">Settings</span>
          </>
        )}
      </NavLink>

      {/* Account switcher */}
      {accounts.length > 1 && (
        <div className="relative mx-1">
          <button
            onClick={() => setShowAccounts(s => !s)}
            className="w-full flex items-center gap-2.5 py-2 px-3 rounded-[10px] text-sm font-medium hover:bg-s3 transition-colors text-left"
            style={{ color: 'var(--ink-2)' }}
          >
            <span className="w-[18px] h-[18px] grid place-items-center flex-shrink-0" style={{ color: 'var(--ink-3)' }}>
              <Icon name="mail" size={16} />
            </span>
            <span className="flex-1 truncate text-xs">{currentAccount?.email || 'Switch account'}</span>
            <Icon name="chevron-down" size={12} />
          </button>
          {showAccounts && (
            <div className="absolute bottom-full left-0 right-0 mb-1 rounded-[12px] shadow-pop overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--line)', zIndex: 100 }}>
              {accounts.map(acc => (
                <button
                  key={acc.accountId}
                  onClick={() => { onSwitchAccount(acc.accountId); setShowAccounts(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-s3 transition-colors text-left"
                  style={{ color: acc.accountId === currentAccount?.accountId ? 'var(--accent)' : 'var(--ink-2)', fontWeight: acc.accountId === currentAccount?.accountId ? 600 : 400 }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: acc.accountId === currentAccount?.accountId ? 'var(--accent)' : 'var(--line)' }} />
                  {acc.email}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manage (admin only) */}
      {hasManage && (
        <>
          <div className="px-4 pt-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: 'var(--ink-3)' }}>
            Manage
          </div>
          {MANAGE_NAV.filter(item => hasPerm(item.perm, perms)).map(item => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-3 mx-1 rounded-[10px] text-sm font-medium transition-all text-left no-underline ${isActive ? 'shadow-1' : 'hover:bg-s3'}`
              }
              style={({ isActive }) => navItemStyle(isActive)}
            >
              {({ isActive }) => (
                <>
                  <span className="w-[18px] h-[18px] grid place-items-center flex-shrink-0" style={iconColor(isActive)}>
                    <Icon name={item.icon} size={17} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </>
      )}

      <div className="flex-1" />

      {/* User chip */}
      <button className="mt-auto flex items-center gap-2.5 p-[8px_12px] rounded-[12px] hover:bg-s3 transition-colors text-left">
        <Avatar name={user?.name || 'User'} size={32} radius={10} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[13px]">{user?.name || 'User'}</div>
          <div className="text-xs truncate" style={{ color: 'var(--ink-3)' }}>
            {user?.email || ''}
          </div>
        </div>
        <Icon name="chevron-down" size={14} />
      </button>
    </aside>
  )
}