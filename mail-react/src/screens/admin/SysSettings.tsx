import { useState, useEffect } from 'react'
import { settingSet, settingQuery } from '../../request/setting'

interface Settings {
  register: number
  loginDomain: number
  addEmail: number
  manyEmail: number
  regKey: number
  siteTitle: string
  siteDesc: string
  r2Domain: string
  domains: string[]
}

const Spinner = () => (
  <div className="animate-spin border-2 border-t-transparent rounded-full w-6 h-6"
    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
)

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer flex items-center w-11 h-6 rounded-full transition-colors"
      style={{ background: on ? 'var(--accent)' : 'var(--line)' }}>
      <div className="w-4 h-4 rounded-full bg-white shadow transition-transform mx-1"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }} />
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-6 space-y-4" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
      <h2 className="font-serif text-lg font-semibold" style={{ color: 'var(--ink)' }}>{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--ink-3)' }}>{desc}</p>}
      </div>
      {children}
    </div>
  )
}

export default function SysSettings() {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<Settings>({
    register: 0, loginDomain: 1, addEmail: 0, manyEmail: 0,
    regKey: 0, siteTitle: '', siteDesc: '', r2Domain: '', domains: [],
  })
  const [newDomain, setNewDomain] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    settingQuery()
      .then(d => {
        const data = d as unknown as any
        setSettings(prev => ({ ...prev, ...data }))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const save = async (key: string, value: any) => {
    setSaving(key)
    try {
      await settingSet({ key, value } as unknown as any)
      setSettings(prev => ({ ...prev, [key]: value }))
    } catch (e) { console.error(e) }
    finally { setSaving(null) }
  }

  const saveText = async (key: string) => {
    await save(key, (settings as any)[key])
  }

  const addDomain = async () => {
    if (!newDomain.trim()) return
    const updated = [...settings.domains, newDomain.trim()]
    setNewDomain('')
    await save('domains', updated)
  }

  const removeDomain = async (d: string) => {
    const updated = settings.domains.filter(x => x !== d)
    await save('domains', updated)
  }

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64"><Spinner /></div>
  }

  return (
    <div style={{ color: 'var(--ink)' }} className="p-6 space-y-6">
      <h1 className="font-serif text-2xl font-bold">System Settings</h1>

      {/* Website Settings */}
      <Card title="Website Settings">
        <Row label="Registration" desc="Allow new user registration">
          <Toggle on={settings.register === 0} onClick={() => save('register', settings.register === 0 ? 1 : 0)} />
        </Row>
        <div style={{ borderTop: '1px solid var(--line)' }} />
        <Row label="Login Domain Restriction" desc="Restrict login to allowed domains">
          <Toggle on={settings.loginDomain === 1} onClick={() => save('loginDomain', settings.loginDomain === 1 ? 0 : 1)} />
        </Row>
        <div style={{ borderTop: '1px solid var(--line)' }} />
        <Row label="Add Email" desc="Allow users to add email addresses">
          <Toggle on={settings.addEmail === 0} onClick={() => save('addEmail', settings.addEmail === 0 ? 1 : 0)} />
        </Row>
        <div style={{ borderTop: '1px solid var(--line)' }} />
        <Row label="Multiple Mailboxes" desc="Allow users to have multiple mailboxes">
          <Toggle on={settings.manyEmail === 0} onClick={() => save('manyEmail', settings.manyEmail === 0 ? 1 : 0)} />
        </Row>
        <div style={{ borderTop: '1px solid var(--line)' }} />
        <Row label="Invite Code" desc="Require invite code to register">
          <select value={settings.regKey} onChange={e => save('regKey', parseInt(e.target.value))}
            className="rounded px-2 py-1 text-sm border"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
            <option value={0}>Off</option>
            <option value={1}>Optional</option>
            <option value={2}>Required</option>
          </select>
        </Row>
      </Card>

      {/* Personalization */}
      <Card title="Personalization">
        <div className="space-y-1">
          <label className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>Site Title</label>
          <div className="flex gap-2">
            <input value={settings.siteTitle}
              onChange={e => setSettings(p => ({ ...p, siteTitle: e.target.value }))}
              className="flex-1 rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
            <button onClick={() => saveText('siteTitle')} disabled={saving === 'siteTitle'}
              className="rounded px-3 py-2 text-sm font-medium"
              style={{ background: 'var(--accent)', color: '#fff', opacity: saving === 'siteTitle' ? 0.6 : 1 }}>
              {saving === 'siteTitle' ? '...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>Site Description</label>
          <div className="flex gap-2">
            <input value={settings.siteDesc}
              onChange={e => setSettings(p => ({ ...p, siteDesc: e.target.value }))}
              className="flex-1 rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
            <button onClick={() => saveText('siteDesc')} disabled={saving === 'siteDesc'}
              className="rounded px-3 py-2 text-sm font-medium"
              style={{ background: 'var(--accent)', color: '#fff', opacity: saving === 'siteDesc' ? 0.6 : 1 }}>
              {saving === 'siteDesc' ? '...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>R2 Domain</label>
          <div className="flex gap-2">
            <input value={settings.r2Domain}
              onChange={e => setSettings(p => ({ ...p, r2Domain: e.target.value }))}
              placeholder="https://cdn.example.com"
              className="flex-1 rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
            <button onClick={() => saveText('r2Domain')} disabled={saving === 'r2Domain'}
              className="rounded px-3 py-2 text-sm font-medium"
              style={{ background: 'var(--accent)', color: '#fff', opacity: saving === 'r2Domain' ? 0.6 : 1 }}>
              {saving === 'r2Domain' ? '...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>Allowed Domains</label>
          <div className="flex flex-wrap gap-2">
            {settings.domains.map(d => (
              <span key={d} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                {d}
                <button onClick={() => removeDomain(d)} className="ml-1 font-bold hover:opacity-60">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newDomain} onChange={e => setNewDomain(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDomain()}
              placeholder="example.com"
              className="flex-1 rounded px-3 py-2 text-sm border"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }} />
            <button onClick={addDomain} className="rounded px-3 py-2 text-sm font-medium"
              style={{ background: 'var(--accent)', color: '#fff' }}>Add</button>
          </div>
        </div>
      </Card>
    </div>
  )
}
