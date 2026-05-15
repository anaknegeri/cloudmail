import { useState, useEffect, useRef } from 'react'
import { userList, userSetStatus, userDelete, userAdd, userSetPwd } from '../../request/user'
import { roleSelectUse } from '../../request/role'

interface User {
  accountId: number
  userId: number
  email: string
  name: string
  status: number
  createTime: string
  allReceive: number
  sort: number
  isDel: number
  latestEmailTime: string | null
  // extra fields from user/list (joined)
  receiveEmailCount?: number
  sendEmailCount?: number
  accountCount?: number
  type?: number
  username?: string
  avatar?: string
  sendAction?: { hasPerm: boolean; sendType?: string; sendCount?: number }
}

interface Role { id: number; name: string }

const Spinner = () => (
  <div className="animate-spin border-2 border-t-transparent rounded-full w-6 h-6"
    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
)

const statusLabel: Record<number, { label: string; bg: string; color: string }> = {
  0:  { label: 'Active',   bg: '#dcfce7', color: '#16a34a' },
  1:  { label: 'Banned',   bg: '#fee2e2', color: '#dc2626' },
  [-2]: { label: 'Deleted', bg: '#f3f4f6', color: '#6b7280' },
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [emailFilter, setEmailFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('-1')
  const [roles, setRoles] = useState<Role[]>([])
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ email: '', password: '', roleId: 0 })
  const [pwdModal, setPwdModal] = useState<{ id: number } | null>(null)
  const [newPwd, setNewPwd] = useState('')

  const fetchUsers = async (reset = false) => {
    setLoading(true)
    try {
      const num = reset ? 1 : page
      const params: any = { size: 30, num }
      if (emailFilter) params.email = emailFilter
      const s = parseInt(statusFilter)
      if (!isNaN(s) && s !== -1) params.status = s
      const res = await userList(params) as unknown as { list: User[]; total: number }
      const data = Array.isArray(res) ? res : (res?.list ?? [])
      if (reset) { setUsers(data); setPage(2) }
      else { setUsers(prev => [...prev, ...data]); setPage(p => p + 1) }
      setHasMore(data.length >= 30)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchUsers(true)
    roleSelectUse().then(d => setRoles(d as unknown as Role[])).catch(console.error)
  }, [])

  const handleStatus = async (id: number, s: number) => {
    try { await userSetStatus({ userId: id, status: s }); fetchUsers(true) } catch (e) { console.error(e) }
    setOpenMenu(null)
  }
  const handleDelete = async (id: number) => {
    if (!confirm('Delete user?')) return
    try { await userDelete(String(id)); fetchUsers(true) } catch (e) { console.error(e) }
    setOpenMenu(null)
  }
  const handleRestore = async (id: number) => {
    try { await userSetStatus({ userId: id, status: 0 }); fetchUsers(true) } catch (e) { console.error(e) }
    setOpenMenu(null)
  }
  const handleAdd = async () => {
    try { await userAdd(addForm); setShowAdd(false); setAddForm({ email: '', password: '', roleId: 0 }); fetchUsers(true) }
    catch (e) { console.error(e) }
  }
  const handleSetPwd = async () => {
    if (!pwdModal) return
    try { await userSetPwd({ userId: pwdModal.id, password: newPwd }); setPwdModal(null); setNewPwd('') }
    catch (e) { console.error(e) }
  }

  return (
    <div style={{ color: 'var(--ink)' }} className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">Users</h1>
        <button onClick={() => setShowAdd(true)} className="rounded px-3 py-1.5 text-sm font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}>+ Add User</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center p-4 rounded-lg"
        style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
        <input value={emailFilter} onChange={e => setEmailFilter(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchUsers(true)}
          placeholder="Search by email..." className="rounded px-2 py-1 text-sm border flex-1 min-w-[160px]"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded px-2 py-1 text-sm border"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
          <option value="-1">All</option>
          <option value="0">Active</option>
          <option value="1">Banned</option>
          <option value="-2">Deleted</option>
        </select>
        <button onClick={() => fetchUsers(true)} className="rounded px-3 py-1 text-sm font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}>Search</button>
        <button onClick={() => fetchUsers(true)} className="rounded px-3 py-1 text-sm"
          style={{ background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>Refresh</button>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-2)' }}>
                {['Name / Email', 'Received', 'Sent', 'Mailboxes', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const s = statusLabel[u.status] ?? { label: String(u.status), bg: '#f3f4f6', color: '#6b7280' }
                return (
                  <tr key={u.accountId} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs" style={{ color: 'var(--ink-3)' }}>{u.email}</div>
                    </td>
                    <td className="px-4 py-3 text-center" style={{ color: 'var(--ink-2)' }}>{u.receiveEmailCount ?? 0}</td>
                    <td className="px-4 py-3 text-center" style={{ color: 'var(--ink-2)' }}>{u.sendEmailCount ?? 0}</td>
                    <td className="px-4 py-3 text-center" style={{ color: 'var(--ink-2)' }}>{u.accountCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--ink-3)' }}>
                      {u.createTime ? new Date(u.createTime).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button onClick={() => setOpenMenu(openMenu === u.accountId ? null : u.accountId)}
                        className="text-xs px-2 py-1 rounded border"
                        style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>Actions ▾</button>
                      {openMenu === u.accountId && (
                        <div className="absolute right-4 z-10 mt-1 rounded-lg shadow-lg text-sm overflow-hidden"
                          style={{ background: 'var(--surface)', border: '1px solid var(--line)', minWidth: 140 }}>
                          <button onClick={() => { setPwdModal({ id: u.userId }); setOpenMenu(null) }}
                            className="block w-full text-left px-3 py-2 hover:opacity-70">Set Password</button>
                          {u.status === 0
                            ? <button onClick={() => handleStatus(u.userId, 1)} className="block w-full text-left px-3 py-2 hover:opacity-70" style={{ color: '#dc2626' }}>Ban</button>
                            : <button onClick={() => handleStatus(u.userId, 0)} className="block w-full text-left px-3 py-2 hover:opacity-70" style={{ color: '#16a34a' }}>Unban</button>}
                          {u.status === -2
                            ? <button onClick={() => handleRestore(u.userId)} className="block w-full text-left px-3 py-2 hover:opacity-70">Restore</button>
                            : <button onClick={() => handleDelete(u.userId)} className="block w-full text-left px-3 py-2 hover:opacity-70" style={{ color: '#dc2626' }}>Delete</button>}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {loading && <div className="flex justify-center py-6"><Spinner /></div>}
        {!loading && users.length === 0 && <div className="text-center py-12" style={{ color: 'var(--ink-3)' }}>No users found</div>}
        {!loading && hasMore && users.length > 0 && (
          <div className="flex justify-center py-4">
            <button onClick={() => fetchUsers(false)} className="rounded px-4 py-2 text-sm"
              style={{ background: 'var(--surface-2)', color: 'var(--ink-2)', border: '1px solid var(--line)' }}>Load More</button>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-xl p-6 w-full max-w-md space-y-4" style={{ background: 'var(--surface)' }}>
            <h2 className="font-serif text-lg font-bold">Add User</h2>
            {['email', 'password'].map(f => (
              <input key={f} type={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                value={(addForm as any)[f]} onChange={e => setAddForm(prev => ({ ...prev, [f]: e.target.value }))}
                className="w-full rounded px-3 py-2 text-sm border"
                style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
            ))}
            <select value={addForm.roleId} onChange={e => setAddForm(p => ({ ...p, roleId: Number(e.target.value) }))}
              className="w-full rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
              <option value="">Select role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="rounded px-4 py-2 text-sm"
                style={{ border: '1px solid var(--line)', color: 'var(--ink-2)' }}>Cancel</button>
              <button onClick={handleAdd} className="rounded px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--accent)', color: '#fff' }}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Set Password Modal */}
      {pwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-xl p-6 w-full max-w-sm space-y-4" style={{ background: 'var(--surface)' }}>
            <h2 className="font-serif text-lg font-bold">Set Password</h2>
            <input type="password" placeholder="New password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
              className="w-full rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setPwdModal(null); setNewPwd('') }} className="rounded px-4 py-2 text-sm"
                style={{ border: '1px solid var(--line)', color: 'var(--ink-2)' }}>Cancel</button>
              <button onClick={handleSetPwd} className="rounded px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--accent)', color: '#fff' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
