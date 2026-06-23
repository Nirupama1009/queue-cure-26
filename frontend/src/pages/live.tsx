import { Camera, Mic, MoveRight, QrCode, Sparkles } from 'lucide-react'
import QRCode from 'react-qr-code'
import { motion } from 'framer-motion'
import { DashboardShell } from '../components/layout'
import { Badge, Card } from '../components/ui'
import { EmptyState } from '../components/empty-state'
import { formatMinutes } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'

export function LiveQueuePage() {
  const queue = useAppStore(state => state.queue)
  const current = queue[0]
  const upcoming = queue.slice(1, 6)
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (!current) {
    return (
      <DashboardShell>
        <EmptyState
          title="Live queue is empty"
          message="This screen becomes the patient-facing display the moment a new registration arrives."
        />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-primary text-white">
          <div className="aurora-orb left-[-4rem] top-[-4rem] h-44 w-44 bg-secondary/40" />
          <div className="aurora-orb right-[-2rem] top-8 h-32 w-32 bg-sky-400/30" />
          <div className="flex items-center justify-between">
            <Badge className="border-white/10 bg-white/10 text-white">Voice-ready live screen</Badge>
            <span className="text-sm text-white/70">{time}</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-[28px] bg-white/10 p-8 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Current token</p>
            <h1 className="mt-4 text-7xl font-black tracking-tight text-white">{current?.token ?? 'Awaiting next patient'}</h1>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-white/60">Patient</p>
                <p className="mt-1 text-2xl font-bold">{current?.name ?? 'No active patient'}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Doctor</p>
                <p className="mt-1 text-2xl font-bold">{current?.doctor ?? 'Standing by'}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Estimated waiting time</p>
                <p className="mt-1 text-2xl font-bold">{formatMinutes(current?.estimated_wait_minutes ?? 0)}</p>
              </div>
              <div>
                <p className="text-sm text-white/60">Patients ahead</p>
                <p className="mt-1 text-2xl font-bold">{Math.max(queue.length - 1, 0)}</p>
              </div>
            </div>
            <div className="mt-8 h-4 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-secondary to-primary" style={{ width: `${Math.min((current?.confidence ?? 0), 100)}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-white/70">
              <span>Confidence {current?.confidence ?? 0}%</span>
              <span>Estimated wait recalculates on every queue change</span>
            </div>
          </motion.div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
            <Badge className="border-white/10 bg-white/10 text-white"><Mic className="mr-2 h-4 w-4" /> Voice announcement ready</Badge>
            <Badge className="border-white/10 bg-white/10 text-white"><Camera className="mr-2 h-4 w-4" /> QR mobile access</Badge>
            <Badge className="border-white/10 bg-white/10 text-white"><MoveRight className="mr-2 h-4 w-4" /> Digital signage mode</Badge>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Upcoming tokens</p>
                <h2 className="mt-2 text-2xl font-bold text-ink dark:text-white">Next five in queue</h2>
              </div>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="mt-5 space-y-3">
              {upcoming.map((patient, index) => (
                <div key={patient.id} className="flex items-center justify-between rounded-[18px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                  <div>
                    <p className="font-bold text-ink dark:text-white">{patient.token}</p>
                    <p className="text-sm text-slate-500">{patient.name} · {patient.department}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">{index + 1} ahead</div>
                </div>
              ))}
              {upcoming.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">Queue is clear. Ready for the next arrival.</p> : null}
            </div>
          </Card>
          <Card className="space-y-4">
            <div className="flex items-center gap-3"><QrCode className="h-5 w-5 text-primary" /><h3 className="text-lg font-bold">Scan to view on mobile</h3></div>
            <div className="rounded-[20px] bg-white p-4">
              <QRCode value={JSON.stringify({ token: current?.token, patient: current?.name, wait: current?.estimated_wait_minutes })} className="h-auto w-full" />
            </div>
            <div className="text-sm text-slate-500">Patients can scan this QR to check status, estimate, and room readiness on their phones.</div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
