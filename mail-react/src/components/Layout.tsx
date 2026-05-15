import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAccountStore } from '../store/account'
import { useMailStore } from '../store/mail'
import { accountList } from '../request/account'
import Sidebar from './Sidebar'
import Compose from '../screens/Compose'
import SearchOverlay from '../screens/SearchOverlay'

export default function Layout() {
  const navigate = useNavigate()
  const { currentAccountId, setAccount } = useAccountStore()
  const composeOpen = useMailStore(s => s.composeOpen)
  const setComposeOpen = useMailStore(s => s.setComposeOpen)
  const searchOpen = useMailStore(s => s.searchOpen)
  const setSearchOpen = useMailStore(s => s.setSearchOpen)
  const replyEmail = useMailStore(s => s.replyEmail)
  const setReplyEmail = useMailStore(s => s.setReplyEmail)

  const [accounts, setAccounts] = useState<{ accountId: number; email: string; allReceive: number }[]>([])

  useEffect(() => {
    accountList().then(res => {
      const list = Array.isArray(res) ? res : []
      setAccounts(list)
      if (list.length > 0 && !currentAccountId) {
        setAccount(list[0].accountId, list[0] as any)
      }
    }).catch(() => {})
  }, [currentAccountId, setAccount])

  // Keyboard shortcuts
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
        if (composeOpen) setComposeOpen(false)
        if (searchOpen) setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [composeOpen, searchOpen, setComposeOpen, setSearchOpen])

  // 401 → logout
  useEffect(() => {
    const h = () => {
      localStorage.removeItem('token')
      navigate('/login')
    }
    window.addEventListener('auth:unauthorized', h)
    return () => window.removeEventListener('auth:unauthorized', h)
  }, [navigate])

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
        <Outlet />
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
          onSelect={() => setSearchOpen(false)}
        />
      )}
    </>
  )
}
