import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Analytics } from '../types'
import { Card } from './ui'

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-white/60 bg-white/95 p-3 text-sm shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95">
      <p className="font-semibold text-ink dark:text-white">{label}</p>
      <p className="mt-1 text-slate-500 dark:text-slate-300">{payload[0]?.name ?? 'Value'}: {payload[0]?.value}</p>
    </div>
  )
}

export function AnalyticsCharts({ analytics }: { analytics: Analytics }) {
  const barData = analytics.department_breakdown
  const lineData = analytics.wait_trend
  const pieData = [
    { name: 'Emergency', value: analytics.emergency_count, fill: '#EF4444' },
    { name: 'Senior', value: analytics.senior_count, fill: '#F59E0B' },
    { name: 'Normal', value: analytics.normal_count, fill: '#22C55E' },
  ]

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink dark:text-white">Queue Performance</h3>
            <p className="text-sm text-slate-500">Department load and wait trend</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <defs>
                <linearGradient id="waitLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="value" stroke="url(#waitLine)" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-bold text-ink dark:text-white">Priority Mix</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={95} innerRadius={52} paddingAngle={5}>
                {pieData.map(entry => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="xl:col-span-3">
        <h3 className="text-lg font-bold text-ink dark:text-white">Department Distribution</h3>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="url(#barFill)" />
              <defs>
                <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#22C55E" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
