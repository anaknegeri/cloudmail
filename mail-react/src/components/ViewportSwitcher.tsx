import { useNavigate, useLocation } from 'react-router-dom'

interface ViewportSwitcherProps {
  composeOpen: boolean
  searchOpen: boolean
  onCompose: (open: boolean) => void
  onSearch: (open: boolean) => void
}

const routeBtn = (path: string, label: string, isActive: boolean, onClick: () => void) => (
  <button
    key={path}
    onClick={onClick}
    className={[
      'px-4 py-2 rounded-full text-[12.5px] font-semibold transition-all',
      isActive
        ? 'bg-ink text-[var(--surface)]'
        : 'text-ink-3 hover:text-ink',
    ].join(' ')}
  >
    {label}
  </button>
)

export default function ViewportSwitcher({
  composeOpen,
  searchOpen,
  onCompose,
  onSearch,
}: ViewportSwitcherProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isInbox    = pathname === '/' || pathname.startsWith('/inbox') || pathname.startsWith('/sent') || pathname.startsWith('/draft') || pathname.startsWith('/star')
  const isSettings = pathname.startsWith('/settings')
  const isLogin    = pathname.startsWith('/login')

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-1 rounded-full p-1.5 z-40 border border-line shadow-3"
      style={{ background: 'var(--surface)' }}
    >
      {routeBtn('/', 'Inbox',    isInbox && !composeOpen && !searchOpen,  () => { navigate('/');       onCompose(false); onSearch(false) })}
      {routeBtn('/', 'Compose',  composeOpen,                                () => { navigate('/');       onCompose(true);  onSearch(false) })}
      {routeBtn('/', 'Search',    searchOpen,                                 () => { navigate('/');       onSearch(true);  onCompose(false) })}
      {routeBtn('/settings', 'Settings', isSettings,                        () => { navigate('/settings'); onCompose(false); onSearch(false) })}
      {routeBtn('/login', 'Sign in',     isLogin,                             () => { navigate('/login');    onCompose(false); onSearch(false) })}
    </div>
  )
}