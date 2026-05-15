import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { initApp } from './lib/init'
import { useSettingStore } from './store/setting'
import { useAccountStore } from './store/account'
import { accountList } from './request/account'
import type { ApiEmail } from './types/api'

// Screens
import Login from './screens/Login'
import InboxList from './screens/InboxList'
import Reader from './screens/Reader'
import Compose from './screens/Compose'
import SearchOverlay from './screens/SearchOverlay'
import Settings from './screens/Settings'

// Admin screens
import AllEmail from './screens/admin/AllEmail'
import Users from './screens/admin/Users'
import Roles from './screens/admin/Roles'
import RegKeys from './screens/admin/RegKeys'
import Analysis from './screens/admin/Analysis'
import SysSettings from './screens/admin/SysSettings'

// Components
import Sidebar from './components/Sidebar'
import ViewportSwitcher from './components/ViewportSwitcher'

import type { Theme } from './types'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast() {
  const [msg, setMsg] = useState<{ message: string; type: string } | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      setMsg(detail)
      setTimeout(() => setMsg(null), 4000)
    }
    window.addEventListener('app:toast', handler)
    return () => window.removeEventListener('app:toast', handler)
  }, [])

  if (!msg) return null
  return (
    <div
      style={{
        position: 'fixed', top: 16, right: 16, zIndex: 9999,
        padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500,
        background: msg.type === 'success' ? '#f0fdf4' : msg.type === 'warning' ? '#fffbeb' : '#fef2f2',
        color:      msg.type === 'success' ? '#166534' : msg.type === 'warning' ? '#92400e' : '#991b1b',
        border:     msg.type === 'success' ? '1px solid #bbf7d0' : msg.type === 'warning' ? '1px solid #fde68a' : '1px solid #fecaca',
        boxShadow: '0 4px 16px rgba(0,0,0,.12)',
      }}
    >
      {msg.message}
    </div>
  )
}

// ─── AppShell ─────────────────────────────────────────────────────────────────
type View = 'inbox' | 'sent' | 'draft' | 'star' | 'settings' | string

function emailTypeForView(v: View): number {
  if (v === 'sent') return 2
  if (v === 'draft') return 3
  return 1
}

function AppShell({ onLogout, loggedIn }: { onLogout: () => void; loggedIn: boolean }) {
  const navigate = useNavigate()
  const [theme, setTheme]               = useState<Theme>('light')
  const [view, setView_]                 = useState<View>('inbox')
  const setView = (v: View) => setView_(v)
  const [selectedEmail, setSelectedEmail] = useState<ApiEmail | null>(null)
  const [composeOpen, setComposeOpen]   = useState(false)
  const [replyEmail, setReplyEmail]     = useState<ApiEmail | null>(null)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [emailFilter, setEmailFilter]   = useState<'all' | 'unread' | 'starred'>('all')

  const { currentAccountId, currentAccount, setAccount } = useAccountStore()
  const [accounts, setAccounts] = useState<{ accountId: number; email: string; allReceive: number }[]>([])

  useEffect(() => {
    accountList().then(res => {
      const list = (res as unknown as { accountId: number; email: string; allReceive: number }[])
      setAccounts(list)
      if (list.length > 0 && !currentAccountId) {
        setAccount(list[0].accountId, list[0] as any)
      }
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn])

  // Theme → html attr
  useEffect(() => {
    let resolved = theme
    if (theme === 'auto') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', resolved)
  }, [theme])

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(s => !s)
      } else if (
        e.key === 'c' && !composeOpen && !searchOpen &&
        (document.activeElement as HTMLElement)?.tagName !== 'INPUT' &&
        (document.activeElement as HTMLElement)?.tagName !== 'TEXTAREA'
      ) {
        setComposeOpen(true)
      } else if (e.key === 'Escape') {
        if (composeOpen) setComposeOpen(false)
        if (searchOpen)  setSearchOpen(false)
        if (selectedEmail) setSelectedEmail(null)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [composeOpen, searchOpen, selectedEmail])

  // 401 → logout
  useEffect(() => {
    const h = () => { onLogout(); navigate('/login') }
    window.addEventListener('auth:unauthorized', h)
    return () => window.removeEventListener('auth:unauthorized', h)
  }, [navigate, onLogout])

  // Reset selected email when view changes
  useEffect(() => { setSelectedEmail(null) }, [view])

  const isMailView = ['inbox', 'sent', 'draft', 'star'].includes(view)

  // Suppress unused var warning — currentAccount used by account store internally
  void currentAccount

  return (
    <>
      <div
        className="grid h-screen w-screen p-3 gap-3"
        style={{ gridTemplateColumns: '248px 1fr', background: 'var(--bg)' }}
      >
        <Sidebar
          onCompose={() => setComposeOpen(true)}
          onView={v => setView(v as View)}
          currentView={view as any}
          accounts={accounts}
          onSwitchAccount={(id) => {
            const acc = accounts.find(a => a.accountId === id)
            if (acc) setAccount(id, acc as any)
          }}
        />

        <div className="grid gap-3 min-w-0 overflow-hidden" style={{ gridTemplateColumns: selectedEmail && isMailView ? '400px 1fr' : '1fr' }}>
          {isMailView && (
            <InboxList
              selectedId={selectedEmail?.emailId ?? null}
              filter={emailFilter}
              setFilter={setEmailFilter}
              onSelect={email => setSelectedEmail(email)}
              onOpenSearch={() => setSearchOpen(true)}
              emailType={emailTypeForView(view)}
            />
          )}

          {isMailView && selectedEmail && (
            <Reader
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
              onDeleted={() => setSelectedEmail(null)}
              onReply={(email) => { setReplyEmail(email); setComposeOpen(true) }}
            />
          )}

          {!isMailView && view === 'settings' && (
            <Settings theme={theme} onThemeChange={setTheme} />
          )}

          {view === 'all-email' && <AllEmail />}
          {view === 'user' && <Users />}
          {view === 'role' && <Roles />}
          {view === 'reg-key' && <RegKeys />}
          {view === 'analysis' && <Analysis />}
          {view === 'sys-setting' && <SysSettings />}
        </div>
      </div>

      {composeOpen && (
        <Compose
          onClose={() => { setComposeOpen(false); setReplyEmail(null) }}
          replyTo={replyEmail ? {
            emailId: replyEmail.emailId,
            subject: replyEmail.subject,
            sendEmail: replyEmail.sendEmail,
            sendName: replyEmail.sendName,
          } : undefined}
        />
      )}
      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
          onSelect={() => { setSearchOpen(false) }}
        />
      )}

      <ViewportSwitcher
        view={view as any}
        composeOpen={composeOpen}
        searchOpen={searchOpen}
        onView={v => setView(v)}
        onCompose={setComposeOpen}
        onSearch={setSearchOpen}
      />
    </>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [initDone, setInitDone] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const settings = useSettingStore(s => s.settings)

  useEffect(() => {
    initApp().then(({ isLoggedIn }) => {
      setLoggedIn(isLoggedIn)
      setInitDone(true)
    })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  if (!initDone) {
    return (
      <div className="h-screen grid place-items-center" style={{ background: 'var(--bg)' }}>
        <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>
          {settings?.title ?? 'Loading…'}
        </div>
      </div>
    )
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setLoggedIn(false)
  }

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route
          path="/login"
          element={loggedIn ? <Navigate to="/" replace /> : <Login onEnter={() => setLoggedIn(true)} />}
        />
        <Route
          path="/*"
          element={loggedIn ? <AppShell onLogout={handleLogout} loggedIn={loggedIn} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
