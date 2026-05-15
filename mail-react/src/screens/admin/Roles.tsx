import { useState, useEffect } from 'react'
import { roleRoleList, roleAdd, roleSet, roleDelete, roleSetDef, rolePermTree } from '../../request/role'

interface Role {
  id: number
  name: string
  description: string
  isDefault: number
}

interface PermNode {
  id: number
  name: string
  code: string
  children?: PermNode[]
}

const Spinner = () => (
  <div className="animate-spin border-2 border-t-transparent rounded-full w-6 h-6"
    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
)

function PermTree({ nodes, selected, onToggle }: { nodes: PermNode[]; selected: string[]; onToggle: (code: string) => void }) {
  return (
    <div className="space-y-2">
      {nodes.map(n => (
        <div key={n.id}>
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" checked={selected.includes(n.code)} onChange={() => onToggle(n.code)}
              className="rounded" />
            <span style={{ color: 'var(--ink)' }}>{n.name}</span>
            <span className="text-xs" style={{ color: 'var(--ink-3)' }}>{n.code}</span>
          </label>
          {n.children?.length ? (
            <div className="ml-5 mt-1 space-y-1">
              <PermTree nodes={n.children} selected={selected} onToggle={onToggle} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [permTree, setPermTree] = useState<PermNode[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [selectedPerms, setSelectedPerms] = useState<string[]>([])

  const fetchRoles = async () => {
    setLoading(true)
    try {
      const data = await roleRoleList() as unknown as Role[]
      setRoles(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchRoles()
    rolePermTree().then(d => setPermTree(d as unknown as PermNode[])).catch(console.error)
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', description: '' })
    setSelectedPerms([])
    setShowModal(true)
  }

  const openEdit = (r: Role) => {
    setEditing(r)
    setForm({ name: r.name, description: r.description })
    setSelectedPerms([])
    setShowModal(true)
  }

  const handleTogglePerm = (code: string) => {
    setSelectedPerms(prev => prev.includes(code) ? prev.filter(p => p !== code) : [...prev, code])
  }

  const handleSave = async () => {
    try {
      if (editing) {
        await roleSet({ roleId: editing.id, ...form, perms: selectedPerms })
      } else {
        await roleAdd({ ...form, perms: selectedPerms })
      }
      setShowModal(false)
      fetchRoles()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this role?')) return
    try { await roleDelete(id); fetchRoles() } catch (e) { console.error(e) }
  }

  const handleSetDefault = async (id: number) => {
    try { await roleSetDef(id); fetchRoles() } catch (e) { console.error(e) }
  }

  return (
    <div style={{ color: 'var(--ink)' }} className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">Roles</h1>
        <button onClick={openAdd} className="rounded px-3 py-1.5 text-sm font-medium"
          style={{ background: 'var(--accent)', color: '#fff' }}>+ Add Role</button>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--ink-2)' }}>
                {['Name', 'Description', 'Default', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--ink-2)' }}>{r.description || '—'}</td>
                  <td className="px-4 py-3">
                    {r.isDefault === 1 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>Default</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="text-xs px-2 py-1 rounded border"
                        style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>Edit</button>
                      {r.isDefault !== 1 && (
                        <button onClick={() => handleSetDefault(r.id)} className="text-xs px-2 py-1 rounded border"
                          style={{ borderColor: 'var(--line)', color: 'var(--accent)' }}>Set Default</button>
                      )}
                      <button onClick={() => handleDelete(r.id)} className="text-xs px-2 py-1 rounded"
                        style={{ background: '#fee2e2', color: '#dc2626' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div className="flex justify-center py-6"><Spinner /></div>}
        {!loading && roles.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--ink-3)' }}>No roles found</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--surface)' }}>
            <h2 className="font-serif text-lg font-bold">{editing ? 'Edit Role' : 'Add Role'}</h2>
            <input placeholder="Role name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
            <input placeholder="Description" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
            {permTree.length > 0 && (
              <div className="p-3 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--ink-2)' }}>Permissions</p>
                <PermTree nodes={permTree} selected={selectedPerms} onToggle={handleTogglePerm} />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="rounded px-4 py-2 text-sm"
                style={{ border: '1px solid var(--line)', color: 'var(--ink-2)' }}>Cancel</button>
              <button onClick={handleSave} className="rounded px-4 py-2 text-sm font-medium"
                style={{ background: 'var(--accent)', color: '#fff' }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
