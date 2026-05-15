import { useState, useEffect } from 'react'
import { analysisEcharts } from '../../request/analysis'

interface StatData {
  receive: number
  receiveDelete: number
  send: number
  sendDelete: number
  mailbox: number
  mailboxDelete: number
  user: number
  userDelete: number
}

interface DayData {
  date: string
  receive: number
  send: number
}

const Spinner = () => (
  <div className="animate-spin border-2 border-t-transparent rounded-full w-6 h-6"
    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
)

function StatCard({ label, total, active, deleted }: { label: string; total: number; active: number; deleted: number }) {
  return (
    <div className="rounded-lg p-5 space-y-2" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
      <p className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>{label}</p>
      <p className="text-3xl font-serif font-bold" style={{ color: 'var(--ink)' }}>{total.toLocaleString()}</p>
      <div className="text-xs space-y-0.5">
        <p style={{ color: '#16a34a' }}>Active: {active.toLocaleString()}</p>
        <p style={{ color: '#9ca3af' }}>Deleted: {deleted.toLocaleString()}</p>
      </div>
    </div>
  )
}

function BarChart({ days }: { days: DayData[] }) {
  if (!days.length) return null
  const maxVal = Math.max(...days.flatMap(d => [d.receive, d.send]), 1)
  const chartH = 120
  const barW = Math.max(8, Math.floor(480 / days.length / 2) - 2)
  const gap = 4
  const groupW = barW * 2 + gap
  const svgW = days.length * (groupW + 8)

  return (
    <div className="overflow-x-auto">
      <svg width={svgW} height={chartH + 30} className="block">
        {days.map((d, i) => {
          const x = i * (groupW + 8) + 4
          const rh = Math.round((d.receive / maxVal) * chartH)
          const sh = Math.round((d.send / maxVal) * chartH)
          return (
            <g key={d.date}>
              <rect x={x} y={chartH - rh} width={barW} height={rh} rx={2}
                fill="var(--accent)" opacity={0.8} />
              <rect x={x + barW + gap} y={chartH - sh} width={barW} height={sh} rx={2}
                fill="#16a34a" opacity={0.7} />
              <text x={x + barW} y={chartH + 16} textAnchor="middle" fontSize={9}
                fill="var(--ink-3)">
                {d.date.slice(5)}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--ink-2)' }}>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: 'var(--accent)', opacity: 0.8 }} />
          Received
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#16a34a', opacity: 0.7 }} />
          Sent
        </span>
      </div>
    </div>
  )
}

export default function Analysis() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<StatData | null>(null)
  const [days, setDays] = useState<DayData[]>([])
  const [senders, setSenders] = useState<{name:string;total:number}[]>([])
  const [userDays, setUserDays] = useState<{date:string;total:number}[]>([])
  const [daySendTotal, setDaySendTotal] = useState(0)

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setLoading(true)
    analysisEcharts(tz)
      .then(raw => {
        const data = raw as unknown as any
        if (!data) return
        const n = data.numberCount ?? {}
        setStats({
          receive:       n.receiveTotal       ?? 0,
          receiveDelete: n.delReceiveTotal     ?? 0,
          send:          n.sendTotal           ?? 0,
          sendDelete:    n.delSendTotal        ?? 0,
          mailbox:       n.accountTotal        ?? 0,
          mailboxDelete: n.delAccountTotal     ?? 0,
          user:          n.userTotal           ?? 0,
          userDelete:    n.delUserTotal        ?? 0,
        })
        const receiveDays: {date:string;total:number}[] = data.emailDayCount?.receiveDayCount ?? []
        const sendDays:    {date:string;total:number}[] = data.emailDayCount?.sendDayCount    ?? []
        setDays(receiveDays.map((r, i) => ({
          date:    r.date,
          receive: r.total,
          send:    sendDays[i]?.total ?? 0,
        })))
        setSenders(data.receiveRatio?.nameRatio ?? [])
        setUserDays(data.userDayCount ?? [])
        setDaySendTotal(data.daySendTotal ?? 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div style={{ color: 'var(--ink)' }} className="p-6 space-y-6">
      <h1 className="font-serif text-2xl font-bold">Analytics</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats ? (
          <>
            <StatCard label="Total Received" total={stats.receive}
              active={stats.receive - stats.receiveDelete} deleted={stats.receiveDelete} />
            <StatCard label="Total Sent" total={stats.send}
              active={stats.send - stats.sendDelete} deleted={stats.sendDelete} />
            <StatCard label="Total Mailboxes" total={stats.mailbox}
              active={stats.mailbox - stats.mailboxDelete} deleted={stats.mailboxDelete} />
            <StatCard label="Total Users" total={stats.user}
              active={stats.user - stats.userDelete} deleted={stats.userDelete} />
          </>
        ) : (
          [['Total Received', 0, 0, 0], ['Total Sent', 0, 0, 0], ['Total Mailboxes', 0, 0, 0], ['Total Users', 0, 0, 0]]
            .map(([l, t, a, d]) => (
              <StatCard key={l as string} label={l as string} total={t as number} active={a as number} deleted={d as number} />
            ))
        )}
      </div>

      {/* Bar Chart - Email Activity */}
      {days.length > 0 && (
        <div className="rounded-lg p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
          <h2 className="font-serif text-base font-semibold mb-4" style={{ color: 'var(--ink)' }}>
            Email Activity by Day
          </h2>
          <BarChart days={days} />
        </div>
      )}

      {/* Bottom row: Senders + User Growth + Today Sent */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Email Sources */}
        {senders.length > 0 && (
          <div className="rounded-lg p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
            <h2 className="font-serif text-base font-semibold mb-3" style={{ color: 'var(--ink)' }}>Email Sources</h2>
            <div className="space-y-2">
              {senders.map((s, i) => {
                const total = senders.reduce((a, b) => a + b.total, 0) || 1
                const pct = Math.round((s.total / total) * 100)
                const colors = ['var(--accent)', '#13DEB9', '#FBBF24', '#FF7F50', '#C084FC']
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--ink-2)' }}>
                      <span className="truncate max-w-[160px]">{s.name || '—'}</span>
                      <span>{s.total} ({pct}%)</span>
                    </div>
                    <div className="rounded-full h-1.5" style={{ background: 'var(--line)' }}>
                      <div className="rounded-full h-1.5" style={{ width: `${pct}%`, background: colors[i % colors.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* User Growth */}
        {userDays.length > 0 && (
          <div className="rounded-lg p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
            <h2 className="font-serif text-base font-semibold mb-3" style={{ color: 'var(--ink)' }}>User Growth</h2>
            <div className="overflow-x-auto">
              <svg width={Math.max(200, userDays.length * 20)} height={80} className="block">
                {(() => {
                  const maxV = Math.max(...userDays.map(d => d.total), 1)
                  const w = Math.max(200, userDays.length * 20)
                  const pts = userDays.map((d, i) => {
                    const x = (i / (userDays.length - 1)) * w
                    const y = 70 - (d.total / maxV) * 60
                    return `${x},${y}`
                  }).join(' ')
                  return (
                    <>
                      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth={2} />
                      {userDays.map((d, i) => {
                        const x = (i / (userDays.length - 1)) * w
                        const y = 70 - (d.total / maxV) * 60
                        return <circle key={i} cx={x} cy={y} r={3} fill="var(--accent)" />
                      })}
                    </>
                  )
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* Sent Today */}
        <div className="rounded-lg p-5 flex flex-col items-center justify-center" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
          <h2 className="font-serif text-base font-semibold mb-2" style={{ color: 'var(--ink)' }}>Sent Today</h2>
          <p className="text-5xl font-serif font-bold" style={{ color: 'var(--accent)' }}>{daySendTotal}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--ink-3)' }}>emails sent today</p>
        </div>
      </div>

      {!stats && !loading && (
        <div className="text-center py-12" style={{ color: 'var(--ink-3)' }}>No data available</div>
      )}
    </div>
  )
}
