import { useState, useEffect } from 'react'
import { analysisEcharts } from '../../request/analysis'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface StatData {
  receive: number
  receiveDelete: number
  receiveNormal: number
  send: number
  sendDelete: number
  sendNormal: number
  mailbox: number
  mailboxDelete: number
  mailboxNormal: number
  user: number
  userDelete: number
  userNormal: number
}

const COLORS = ['#3B82F6', '#13DEB9', '#FBBF24', '#FF7F50', '#C084FC', '#F472B6']

// Chart color palette - konsisten untuk semua chart
const chartColors = {
  primary: '#3B82F6',   // blue - untuk data utama (received, main metric)
  secondary: '#13DEB9', // teal - untuk data sekunder (sent, comparison)
  accent: '#FBBF24',    // yellow - untuk highlight
  palette: COLORS       // untuk pie/multi-series
}

// Recharts theme - konsisten dengan design system
const chartTheme = {
  grid: { stroke: 'var(--line)', strokeDasharray: '3 3' },
  axis: { 
    tick: { fill: 'var(--ink-3)', fontSize: 11 },
    axisLine: { stroke: 'var(--line)' }
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: '8px',
      color: 'var(--ink)',
      fontSize: '12px',
      padding: '8px 12px'
    },
    cursor: { fill: 'var(--surface-2)', opacity: 0.3 }
  },
  legend: {
    wrapperStyle: { fontSize: '12px', color: 'var(--ink-2)', paddingTop: '12px' },
    iconType: 'circle' as const
  }
}

const Spinner = () => (
  <div className="animate-spin border-2 border-t-transparent rounded-full w-6 h-6"
    style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
)

function StatCard({ label, total, active, deleted }: { label: string; total: number; active: number; deleted: number }) {
  return (
    <div className="rounded-xl p-5 space-y-2" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
      <p className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>{label}</p>
      <p className="text-3xl font-serif font-bold" style={{ color: 'var(--ink)' }}>{total.toLocaleString()}</p>
      <div className="text-xs space-y-0.5">
        <p style={{ color: '#16a34a' }}>Active: {active.toLocaleString()}</p>
        <p style={{ color: '#9ca3af' }}>Deleted: {deleted.toLocaleString()}</p>
      </div>
    </div>
  )
}

export default function Analysis() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<StatData | null>(null)
  const [emailDays, setEmailDays] = useState<{ date: string; receive: number; send: number }[]>([])
  const [userDays, setUserDays] = useState<{ date: string; total: number }[]>([])
  const [senders, setSenders] = useState<{ name: string; value: number }[]>([])
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
          receive:       n.receiveTotal        ?? 0,
          receiveNormal: n.normalReceiveTotal   ?? 0,
          receiveDelete: n.delReceiveTotal      ?? 0,
          send:          n.sendTotal            ?? 0,
          sendNormal:    n.normalSendTotal      ?? 0,
          sendDelete:    n.delSendTotal         ?? 0,
          mailbox:       n.accountTotal         ?? 0,
          mailboxNormal: n.normalAccountTotal   ?? 0,
          mailboxDelete: n.delAccountTotal      ?? 0,
          user:          n.userTotal            ?? 0,
          userNormal:    n.normalUserTotal      ?? 0,
          userDelete:    n.delUserTotal         ?? 0,
        })
        const receiveDays: { date: string; total: number }[] = data.emailDayCount?.receiveDayCount ?? []
        const sendDays:    { date: string; total: number }[] = data.emailDayCount?.sendDayCount    ?? []
        setEmailDays(receiveDays.map((r, i) => ({
          date:    r.date.slice(5), // MM-DD
          receive: r.total,
          send:    sendDays[i]?.total ?? 0,
        })))
        setUserDays((data.userDayCount ?? []).map((d: any) => ({
          date:  d.date.slice(5),
          total: d.total,
        })))
        setSenders((data.receiveRatio?.nameRatio ?? []).map((s: any) => ({
          name:  s.name || 'Unknown',
          value: s.total,
        })))
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
            <StatCard label="Total Received" total={stats.receive} active={stats.receiveNormal} deleted={stats.receiveDelete} />
            <StatCard label="Total Sent"     total={stats.send}    active={stats.sendNormal}    deleted={stats.sendDelete} />
            <StatCard label="Total Mailboxes" total={stats.mailbox} active={stats.mailboxNormal} deleted={stats.mailboxDelete} />
            <StatCard label="Total Users"    total={stats.user}    active={stats.userNormal}    deleted={stats.userDelete} />
          </>
        ) : (
          ['Total Received','Total Sent','Total Mailboxes','Total Users'].map(l => (
            <StatCard key={l} label={l} total={0} active={0} deleted={0} />
          ))
        )}
      </div>

      {/* Email Activity Bar Chart */}
      {emailDays.length > 0 && (
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
          <h2 className="font-serif text-base font-semibold mb-4" style={{ color: 'var(--ink)' }}>Email Activity by Day</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={emailDays} barCategoryGap="30%" barGap={4}>
              <CartesianGrid {...chartTheme.grid} />
              <XAxis dataKey="date" {...chartTheme.axis.tick} axisLine={chartTheme.axis.axisLine} />
              <YAxis {...chartTheme.axis.tick} axisLine={chartTheme.axis.axisLine} allowDecimals={false} />
              <Tooltip {...chartTheme.tooltip} cursor={chartTheme.tooltip.cursor} />
              <Legend {...chartTheme.legend} />
              <Bar dataKey="receive" name="Received" fill={chartColors.primary} radius={[4,4,0,0]} />
              <Bar dataKey="send"    name="Sent"     fill={chartColors.secondary} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Email Sources Pie */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
          <h2 className="font-serif text-base font-semibold mb-3" style={{ color: 'var(--ink)' }}>Email Sources</h2>
          {senders.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={senders} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={2} label={false}>
                  {senders.map((_, i) => (
                    <Cell key={i} fill={chartColors.palette[i % chartColors.palette.length]} />
                  ))}
                </Pie>
                <Tooltip {...chartTheme.tooltip} />
                <Legend {...chartTheme.legend} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm" style={{ color: 'var(--ink-3)' }}>No data</div>
          )}
        </div>

        {/* User Growth Line */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
          <h2 className="font-serif text-base font-semibold mb-3" style={{ color: 'var(--ink)' }}>User Growth</h2>
          {userDays.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={userDays}>
                <CartesianGrid {...chartTheme.grid} />
                <XAxis dataKey="date" {...chartTheme.axis.tick} axisLine={chartTheme.axis.axisLine} />
                <YAxis {...chartTheme.axis.tick} axisLine={chartTheme.axis.axisLine} allowDecimals={false} />
                <Tooltip {...chartTheme.tooltip} cursor={chartTheme.tooltip.cursor} />
                <Line type="monotone" dataKey="total" name="New Users"
                  stroke={chartColors.primary} strokeWidth={2.5} dot={{ r: 4, fill: chartColors.primary }} 
                  activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm" style={{ color: 'var(--ink-3)' }}>No data</div>
          )}
        </div>

        {/* Sent Today */}
        <div className="rounded-xl p-5 flex flex-col items-center justify-center"
          style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-1)' }}>
          <h2 className="font-serif text-base font-semibold mb-3" style={{ color: 'var(--ink)' }}>Sent Today</h2>
          <p className="text-6xl font-serif font-bold" style={{ color: chartColors.primary }}>{daySendTotal}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--ink-3)' }}>emails sent today</p>
        </div>
      </div>

      {!stats && !loading && (
        <div className="text-center py-12" style={{ color: 'var(--ink-3)' }}>No data available</div>
      )}
    </div>
  )
}
