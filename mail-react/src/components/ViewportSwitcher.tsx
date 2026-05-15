import type { View } from '../types'

interface ViewportSwitcherProps {
  view: View
  composeOpen: boolean
  searchOpen: boolean
  onView: (v: View) => void
  onCompose: (open: boolean) => void
  onSearch: (open: boolean) => void
}

export default function ViewportSwitcher({
  view,
  composeOpen,
  searchOpen,
  onView,
  onCompose,
  onSearch,
}: ViewportSwitcherProps) {
  const isInbox    = view === 'inbox'    && !composeOpen && !searchOpen
  const isCompose  = composeOpen
  const isSearch   = searchOpen
  const isSettings = view === 'settings' && !composeOpen && !searchOpen
  const isLogin    = view === 'login'

  const btnClass = (active: boolean) =>
    [
      'px-4 py-2 rounded-full text-[12.5px] font-semibold transition-all',
      active
        ? 'bg-ink text-[var(--surface)]'
        : 'text-ink-3 hover:text-ink',
    ].join(' ')

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-1 rounded-full p-1.5 z-40 border border-line shadow-3"
      style={{ background: 'var(--surface)' }}
    >
      <button
        className={btnClass(isInbox)}
        onClick={() => { onView('inbox'); onCompose(false); onSearch(false) }}
      >
        Inbox
      </button>
      <button
        className={btnClass(isCompose)}
        onClick={() => { onView('inbox'); onCompose(true); onSearch(false) }}
      >
        Compose
      </button>
      <button
        className={btnClass(isSearch)}
        onClick={() => { onView('inbox'); onSearch(true); onCompose(false) }}
      >
        Search
      </button>
      <button
        className={btnClass(isSettings)}
        onClick={() => { onView('settings'); onCompose(false); onSearch(false) }}
      >
        Settings
      </button>
      <button
        className={btnClass(isLogin)}
        onClick={() => { onView('login'); onCompose(false); onSearch(false) }}
      >
        Sign in
      </button>
    </div>
  )
}
