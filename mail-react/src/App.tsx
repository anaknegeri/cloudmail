import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { initApp } from './lib/init'
import { useSettingStore } from './store/setting'

// Layout
import Layout from './components/Layout'

// Auth
import Login from './screens/Login'

// Mail screens
import Inbox from './screens/Inbox'
import Sent from './screens/Sent'
import Drafts from './screens/Drafts'
import Starred from './screens/Starred'
import Settings from './screens/Settings'

// Admin screens
import AllEmail from './screens/admin/AllEmail'
import Users from './screens/admin/Users'
import Roles from './screens/admin/Roles'
import RegKeys from './screens/admin/RegKeys'
import Analysis from './screens/admin/Analysis'
import SysSettings from './screens/admin/SysSettings'

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

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, loggedIn }: { children: React.ReactNode; loggedIn: boolean }) {
  return loggedIn ? <>{children}</> : <Navigate to="/login" replace />
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const settings = useSettingStore(s => s.settings)
  const [loggedIn, setLoggedIn] = useState(false)
  const [initDone, setInitDone] = useState(false)
  const [theme] = useState<Theme>('light')

  useEffect(() => {
    initApp().then(({ isLoggedIn }) => {
      setLoggedIn(isLoggedIn)
      setInitDone(true)
    })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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
          path="/"
          element={
            <ProtectedRoute loggedIn={loggedIn}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Inbox />} />
          <Route path="sent" element={<Sent />} />
          <Route path="draft" element={<Drafts />} />
          <Route path="star" element={<Starred />} />
          <Route path="settings" element={<Settings theme={theme} onThemeChange={() => {}} />} />
          
          {/* Admin routes */}
          <Route path="admin/all-email" element={<AllEmail />} />
          <Route path="admin/users" element={<Users />} />
          <Route path="admin/roles" element={<Roles />} />
          <Route path="admin/analysis" element={<Analysis />} />
          <Route path="admin/reg-keys" element={<RegKeys />} />
          <Route path="admin/settings" element={<SysSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
