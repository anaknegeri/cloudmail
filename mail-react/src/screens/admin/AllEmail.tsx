import { useState, useEffect } from 'react'
import { allEmailList, allEmailDelete } from '../../request/all-email'

interface Email {
  id: number | string
  fromName: string
  fromEmail: string
  toEmail: string
  subject: string
  date: string
  type: string
}

const Spinner = () => (
  <div className="animate-spin border-2 border-t-transparent rounded-full w-6 h-6"
    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
)

export default function AllEmail() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchType, setSearchType] = useState('name')
  const [searchVal, setSearchVal] = useState('')
  const [status, setStatus] = useState('all')

  const fetchEmails = async (reset = false) => {
    setLoading(true)
    try {
      const num = reset ? 1 : page
      const params: any = { type: status, size: 30, num }
      if (searchVal) params[searchType] = searchVal
      const data = await allEmailList(params) as unknown as any[]
      if (reset) { setEmails(data); setPage(2) }
      else { setEmails(prev => [...prev, ...data]); setPage(p => p + 1) }
      setHasMore(data.length >= 30)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEmails(true) }, [])

  const handleDelete = async (id: number | string) => {
    if (!confirm('Delete this email?')) return
    try {
      await allEmailDelete(String(id) as any)
      setEmails(prev => prev.filter(e => e.id !== id))
    } catch (e) { console.error(e) }
  }

  const handleSearch = () => { setHasMore(true); fetchEmails(true) }

  return (
    <div style={{ color: 'var(--ink)' }} className="p-6 space-y-4">
      <h1 className="font-serif text-2xl font-bold">All Emails</h1>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-2 items-center p-4 rounded-lg"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
        <select value={searchType} onChange={e => setSearchType(e.target.value)}
          className="rounded px-2 py-1 text-sm border"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
          <option value="name">Name</option>
          <option value="subject">Subject</option>
          <option value="user">User</option>
          <option value="account">Account</option>
        </select>
        <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search..." className="rounded px-2 py-1 text-sm border flex-1 min-w-[160px]"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="rounded px-2 py-1 text-sm border"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
          <option value="all">All</option>
          <option value="receive">Receive</option>
          <option value="send">Send</option>
          <option value="delete">Delete</option>
        </select>
        <button onClick={handleSearch} className="rounded px-3 py-1 text-sm font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}>Search</button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-2)' }}>
                {['From Name', 'From Email', 'To', 'Subject', 'Date', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {emails.map(email => (
                <tr key={email.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td className="px-4 py-3">{email.fromName || '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--ink-2)' }}>{email.fromEmail}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--ink-2)' }}>{email.toEmail}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{email.subject}</td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--ink-3)' }}>
                    {email.date ? new Date(email.date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: 'var(--accent-soft)',
                        color: email.type === 'receive' ? 'var(--accent)' : email.type === 'send' ? '#16a34a' : 'var(--ink-3)'
                      }}>
                      {email.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(email.id)}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: '#fee2e2', color: '#dc2626' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="flex justify-center py-6"><Spinner /></div>}
        {!loading && emails.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--ink-3)' }}>No emails found</div>
        )}
        {!loading && hasMore && emails.length > 0 && (
          <div className="flex justify-center py-4">
            <button onClick={() => fetchEmails(false)} className="rounded px-4 py-2 text-sm"
              style={{ background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
