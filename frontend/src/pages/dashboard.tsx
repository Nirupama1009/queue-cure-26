import { ArrowRight, BellRing, ClipboardList, HeartPulse, Layers3, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnalyticsCharts } from '../components/charts'
import { DashboardShell } from '../components/layout'
import { Badge, Button, Card, Input, Modal, Select } from '../components/ui'
import { PatientRegistrationForm } from '../components/patient-registration-form'
import { formatDateTime, formatMinutes, priorityTone, statusTone } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'
import type { Patient } from '../types'

const cards: Array<[string, string, React.ComponentType<any>]> = [
  ['Patients Waiting', 'queue_length', HeartPulse],
  ['Patients Served', 'patients_served_today', ClipboardList],
  ['Emergency Cases', 'emergency_count', BellRing],
  ['Average Wait', 'average_wait_minutes', Layers3],
]

function DashboardMetrics({ analytics }: { analytics: ReturnType<typeof useAppStore.getState>['analytics'] }) {
  if (!analytics) return null
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, key, Icon]) => (
        <Card key={label} className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{label}</p>
              <p className="mt-3 text-4xl font-black text-ink dark:text-white">{key === 'average_wait_minutes' ? `${analytics.average_wait_minutes}m` : String(analytics[key as keyof typeof analytics])}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Icon className="h-6 w-6" /></div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min(analytics.confidence_average, 100)}%` }} />
          </div>
          <p className="mt-3 text-xs text-slate-500">Confidence {analytics.confidence_average}%</p>
        </Card>
      ))}
    </div>
  )
}

function QueueTable({ queue }: { queue: Patient[] }) {
  const callNext = useAppStore(state => state.callNext)
  const completePatient = useAppStore(state => state.completePatient)
  const deletePatient = useAppStore(state => state.deletePatient)
  const setSearch = useAppStore(state => state.setSearch)
  const setDepartmentFilter = useAppStore(state => state.setDepartmentFilter)
  const setPriorityFilter = useAppStore(state => state.setPriorityFilter)
  const setStatusFilter = useAppStore(state => state.setStatusFilter)
  const search = useAppStore(state => state.search)
  const departmentFilter = useAppStore(state => state.departmentFilter)
  const priorityFilter = useAppStore(state => state.priorityFilter)
  const statusFilter = useAppStore(state => state.statusFilter)
  const departments = useAppStore(state => state.departments)

  const filtered = useMemo(() => queue.filter(patient => {
    const matchesSearch = `${patient.name} ${patient.token} ${patient.department} ${patient.doctor}`.toLowerCase().includes(search.toLowerCase())
    const matchesDepartment = departmentFilter === 'All' || patient.department === departmentFilter
    const matchesPriority = priorityFilter === 'All' || patient.priority === priorityFilter
    const matchesStatus = statusFilter === 'All' || patient.status === statusFilter
    return matchesSearch && matchesDepartment && matchesPriority && matchesStatus
  }), [queue, search, departmentFilter, priorityFilter, statusFilter])

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Live queue table</p>
          <h3 className="mt-2 text-2xl font-bold text-ink dark:text-white">Today&apos;s patient flow</h3>
        </div>
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-11" placeholder="Search token, name, department..." value={search} onChange={event => setSearch(event.target.value)} />
          </div>
          <Select className="lg:w-48" value={departmentFilter} onChange={event => setDepartmentFilter(event.target.value)}>
            <option>All</option>
            {departments.map(department => <option key={department.id}>{department.name}</option>)}
          </Select>
          <Select className="lg:w-40" value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)}>
            <option>All</option>
            <option>Emergency</option>
            <option>Senior Citizen</option>
            <option>Normal</option>
          </Select>
          <Select className="lg:w-40" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
            <option>All</option>
            <option>Waiting</option>
            <option>Called</option>
            <option>In Consultation</option>
            <option>Completed</option>
            <option>Skipped</option>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.22em] text-slate-500">
              <th className="py-4 pr-4">Token</th>
              <th className="py-4 pr-4">Patient</th>
              <th className="py-4 pr-4">Department</th>
              <th className="py-4 pr-4">Priority</th>
              <th className="py-4 pr-4">Status</th>
              <th className="py-4 pr-4">Estimated Wait</th>
              <th className="py-4 pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map(patient => (
              <tr key={patient.id} className="transition hover:bg-slate-50/80 dark:hover:bg-white/5">
                <td className="py-4 pr-4 font-mono text-sm font-bold text-primary">{patient.token}</td>
                <td className="py-4 pr-4">
                  <div className="font-semibold text-ink dark:text-white">{patient.name}</div>
                  <div className="text-xs text-slate-500">Age {patient.age} · {patient.gender} · {patient.doctor}</div>
                </td>
                <td className="py-4 pr-4">{patient.department}</td>
                <td className="py-4 pr-4"><Badge className={priorityTone(patient.priority)}>{patient.priority}</Badge></td>
                <td className="py-4 pr-4"><Badge className={statusTone(patient.status)}>{patient.status}</Badge></td>
                <td className="py-4 pr-4">
                  <div className="text-sm font-semibold text-ink dark:text-white">{formatMinutes(patient.estimated_wait_minutes)}</div>
                  <div className="text-xs text-slate-500">Confidence {patient.confidence}%</div>
                </td>
                <td className="py-4 pr-4">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="glass" onClick={() => void callNext()}>Call</Button>
                    <Button variant="secondary" onClick={() => void completePatient(patient.id)}>Complete</Button>
                    <Button variant="ghost" onClick={() => void deletePatient(patient.id)}>Skip</Button>
                    <Button variant="danger" onClick={() => void deletePatient(patient.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-500">No patients match the current filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function DashboardPage() {
  const analytics = useAppStore(state => state.analytics)
  const queue = useAppStore(state => state.queue)
  const history = useAppStore(state => state.history)
  const callNext = useAppStore(state => state.callNext)
  const setSearch = useAppStore(state => state.setSearch)
  const [registrationOpen, setRegistrationOpen] = useState(false)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Overview</p>
            <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Reception control center</h1>
            <p className="mt-2 text-slate-500">Monitor the queue, call patients, and manage live clinic flow without refreshes.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="glass" onClick={() => setRegistrationOpen(true)}><Plus className="h-4 w-4" /> Register patient</Button>
            <Button onClick={() => void callNext()}>Call next token <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>

        {analytics ? <DashboardMetrics analytics={analytics} /> : null}
        {analytics ? <AnalyticsCharts analytics={analytics} /> : null}

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <QueueTable queue={queue} />
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Recent activity</p>
                <h3 className="mt-2 text-2xl font-bold text-ink dark:text-white">Queue timeline</h3>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {history.slice(0, 6).map(item => (
                <div key={item.id} className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink dark:text-white">{item.patient_name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.action.replaceAll('_', ' ')}</p>
                    </div>
                    <span className="text-xs text-slate-400">{formatDateTime(item.created_at)}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{item.details}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[18px] bg-gradient-to-br from-primary/10 to-secondary/10 p-5">
              <p className="text-sm font-semibold text-primary">Current search</p>
              <Input className="mt-3" placeholder="Search queue..." onChange={event => setSearch(event.target.value)} />
              <Link to="/app/history" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">View full history <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </Card>
        </div>
      </div>
      <Modal open={registrationOpen} title="Register a new patient" onClose={() => setRegistrationOpen(false)}>
        <PatientRegistrationForm submitLabel="Generate token and add to queue" onSuccess={() => setRegistrationOpen(false)} />
      </Modal>
    </DashboardShell>
  )
}
