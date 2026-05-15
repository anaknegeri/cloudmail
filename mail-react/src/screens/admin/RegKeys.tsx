import { useState, useEffect } from 'react'
import { regKeyList, regKeyAdd, regKeyDelete, regKeyClearNotUse } from '../../request/reg-key'
import { roleSelectUse } from '../../request/role'

interface RegKey {
  id: number
  code: string
  count: number
  usedCount: number
  roleName: string
  expireTime: string
}

interface Role { id: number; name: string }

const Spinner = () => (
  <div className="animate-spin border-2 border-t-transparent rounded-full w-6 h-6"
    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
)

const randomCode = () => Math.random().toString(36).substring(2, 10).toUpperCase()

export default function RegKeys() {
  const [keys, setKeys] = useState<RegKey[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [form, setForm] = useState({ code: '', roleId: 0, expireTime: '', count: '1' })
  const [copied, setCopied] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [keysData, rolesData] = await Promise.all([
        regKeyList({}) as unknown as Promise<any[]>,
        roleSelectUse() as unknown as Promise<any[]>,
      ])
      setKeys(keysData)
      setRoles(rolesData)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  const handleAdd = async () => {
    try {
      await regKeyAdd({ ...form, count: parseInt(form.count) })
      setShowModal(false)
      setForm({ code: '', roleId: 0, expireTime: '', count: '1' })
      fetchAll()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this key?')) return
    try { await regKeyDelete(String(id)); fetchAll() } catch (e) { console.error(e) }
    setOpenMenu(null)
  }

  const handleClearUnused = async () => {
    if (!confirm('Clear all unused keys?')) return
    try { await regKeyClearNotUse(); fetchAll() } catch (e) { console.error(e) }
  }

  return (
    <div style={{ color: 'var(--ink)' }} className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-serif text-2xl font-bold">Invite Codes</h1>
        <div className="flex gap-2">
          <button onClick={handleClearUnused} className="rounded px-3 py-1.5 text-sm"
            style={{ border: '1px solid var(--line)', color: 'var(--ink-2)' }}>Clear Unused</button>
          <button onClick={() => setShowModal(true)} className="rounded px-3 py-1.5 text-sm font-medium"
            style={{ background: 'var(--accent)', color: '#fff' }}>+ Add Code</button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-2)' }}>
                {['Code', 'Remaining', 'Role', 'Expires', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td className="px-4 py-3">
                    <button onClick={() => copyCode(k.code)}
                      className="font-mono text-xs px-2 py-1 rounded transition-colors"
                      style={{ background: 'var(--surface-2)', color: copied === k.code ? 'var(--accent)' : 'var(--ink)', border: '1px solid var(--line)' }}>
                      {copied === k.code ? 'Copied!' : k.code}
                    </button>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--ink-2)' }}>
                    {k.count - (k.usedCount || 0)} / {k.count}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--ink-2)' }}>{k.roleName || '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--ink-3)' }}>
                    {k.expireTime ? new Date(k.expireTime).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button onClick={() => setOpenMenu(openMenu === k.id ? null : k.id)}
                      className="text-xs px-2 py-1 rounded border"
                      style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>⋯</button>
                    {openMenu === k.id && (
                      <div className="absolute right-4 z-10 mt-1 rounded-lg shadow-lg text-sm overflow-hidden"
                        style={{ background: 'var(--surface)', border: '1px solid var(--line)', minWidth: 120 }}>
                        <button onClick={() => { copyCode(k.code); setOpenMenu(null) }}
                          className="block w-full text-left px-3 py-2 hover:opacity-70">Copy</button>
                        <button onClick={() => handleDelete(k.id)}
                          className="block w-full text-left px-3 py-2 hover:opacity-70" style={{ color: '#dc2626' }}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="flex justify-center py-6"><Spinner /></div>}
        {!loading && keys.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--ink-3)' }}>No invite codes</div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-xl p-6 w-full max-w-md space-y-4" style={{ background: 'var(--surface)' }}>
            <h2 className="font-serif text-lg font-bold">Add Invite Code</h2>
            <div className="flex gap-2">
              <input placeholder="Code" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                className="flex-1 rounded px-3 py-2 text-sm border font-mono"
                style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
              <button onClick={() => setForm(p => ({ ...p, code: randomCode() }))}
                className="rounded px-3 py-2 text-sm border"
                style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>Random</button>
            </div>
            <select value={form.roleId} onChange={e => setForm(p => ({ ...p, roleId: Number(e.target.value) }))}
              className="w-full rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
              <option value="">Select role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <input type="date" value={form.expireTime} onChange={e => setForm(p => ({ ...p, expireTime: e.target.value }))}
              className="w-full rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
            <input type="number" min={1} placeholder="Max uses" value={form.count}
              onChange={e => setForm(p => ({ ...p, count: e.target.value }))}
              className="w-full rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="rounded px-4 py-2 text-sm"
                style={{ border: '1px solid var(--line)', color: 'var(--ink-2)' }}>Cancel</button>
              <button onClick={handleAdd} className="rounded px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--accent)', color: '#fff' }}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
