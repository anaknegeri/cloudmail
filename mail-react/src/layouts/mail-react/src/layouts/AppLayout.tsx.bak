import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { accountList } from '../request/account'
import { useAccountStore } from '../store/account'
import { useMailStore } from '../store/mail'
import type { Theme } from '../types'
import Sidebar from '../components/Sidebar'
import Compose from '../screens/Compose'
import SearchOverlay from '../screens/SearchOverlay'
import ViewportSwitcher from '../components/ViewportSwitcher'

// ─── Layout (sidebar + Outlet) ────────────────────────────────────────────────
export default function AppLayout() {
  const navigate      = useNavigate()
  const [theme, setTheme]           = useState<Theme>('light')
  const [accounts, setAccounts]     = useState<{ accountId: number; email: string; allReceive: number }[]>([])

  const { currentAccountId, currentAccount, setAccount } = useAccountStore()
  const composeOpen = useMailStore(s => s.composeOpen)
  const setComposeOpen = useMailStore(s => s.setComposeOpen)
  const replyEmail = useMailStore(s => s.replyEmail)
  const setReplyEmail = useMailStore(s => s.setReplyEmail)
  const searchOpen = useMailStore(s => s.searchOpen)
  const setSearchOpen = useMailStore(s => s.setSearchOpen)
  const selectedEmail = useMailStore(s => s.selectedEmail)
  const setSelectedEmail = useMailStore(s => s.setSelectedEmail)

  // Load accounts on mount
  useEffect(() => {
    accountList().then(res => {
      const list = Array.isArray(res) ? res : []
      setAccounts(list)
      if (list.length > 0 && !currentAccountId) {
        setAccount(list[0].accountId, list[0] as any)
      }
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Theme → html attr
  useEffect(() => {
    let resolved = theme
    if (theme === 'auto') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', resolved)
  }, [theme])

  // Keyboard shortcuts (global modal toggles)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(!searchOpen)
      } else if (
        e.key === 'c' && !composeOpen && !searchOpen &&
        (document.activeElement as HTMLElement)?.tagName !== 'INPUT' &&
        (document.activeElement as HTMLElement)?.tagName !== 'TEXTAREA'
      ) {
        setComposeOpen(true)
      } else if (e.key === 'Escape') {
        if (composeOpen)  setComposeOpen(false)
        if (searchOpen)   setSearchOpen(false)
        if (selectedEmail) setSelectedEmail(null)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [composeOpen, searchOpen, selectedEmail, setComposeOpen, setSearchOpen, setSelectedEmail])

  // 401 → redirect to login (handled by parent via logout prop)
  useEffect(() => {
    const h = () => { navigate('/login') }
    window.addEventListener('auth:unauthorized', h)
    return () => window.removeEventListener('auth:unauthorized', h)
  }, [navigate])

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
          accounts={accounts}
          onSwitchAccount={(id) => {
            const acc = accounts.find(a => a.accountId === id)
            if (acc) setAccount(id, acc as any)
          }}
        />

        {/* Routes render here via <Outlet /> */}
        <Outlet />
      </div>

      {/* Modals — always rendered so state is preserved across routes */}
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
          onSelect={() => setSearchOpen(false)}
        />
      )}

      {/* Mobile viewport switcher */}
      <ViewportSwitcher
        composeOpen={composeOpen}
        searchOpen={searchOpen}
        onCompose={setComposeOpen}
        onSearch={setSearchOpen}
      />
    </>
  )
}
