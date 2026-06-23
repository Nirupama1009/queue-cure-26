import { Clock3, Speaker } from 'lucide-react'
import { motion } from 'framer-motion'
import QRCode from 'react-qr-code'
import { EmptyState } from '../components/empty-state'
import { useAppStore } from '../store/useAppStore'
import { formatMinutes } from '../lib/utils'

export function TvDisplayPage() {
  const queue = useAppStore(state => state.queue)
  const current = queue[0]
  const upcoming = queue.slice(1, 6)
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (!current) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <EmptyState
          title="TV display waiting for the first token"
          message="Once a patient arrives, the screen will switch into the animated calling layout automatically."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="grid min-h-[calc(100vh-3rem)] gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-primary p-8 shadow-soft">
          <div className="aurora-orb left-8 top-8 h-40 w-40 bg-secondary/30" />
          <div className="aurora-orb right-10 top-16 h-32 w-32 bg-sky-400/30" />
          <div className="flex items-center justify-between text-white/70">
            <div className="flex items-center gap-2"><Speaker className="h-5 w-5" /> Live TV Display</div>
            <div className="flex items-center gap-2"><Clock3 className="h-5 w-5" /> {now}</div>
          </div>
          <div className="mt-16">
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">Now calling</p>
            <div className="mt-4 text-[clamp(5rem,14vw,11rem)] font-black leading-none">{current?.token ?? 'WAITING'}</div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-white/50">Patient</p>
                <p className="mt-2 text-4xl font-bold">{current?.name ?? 'No active call'}</p>
              </div>
              <div>
                <p className="text-sm text-white/50">Doctor</p>
                <p className="mt-2 text-4xl font-bold">{current?.doctor ?? 'Standing by'}</p>
              </div>
              <div>
                <p className="text-sm text-white/50">Estimated waiting time</p>
                <p className="mt-2 text-4xl font-bold">{formatMinutes(current?.estimated_wait_minutes ?? 0)}</p>
              </div>
              <div>
                <p className="text-sm text-white/50">Patients ahead</p>
                <p className="mt-2 text-4xl font-bold">{Math.max(queue.length - 1, 0)}</p>
              </div>
            </div>
          </div>
          <div className="mt-12 rounded-[26px] bg-white/10 p-4">
            <div className="mb-3 flex items-center justify-between text-sm text-white/70">
              <span>Queue progress</span>
              <span>{current?.confidence ?? 0}% confidence</span>
            </div>
            <div className="h-5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-secondary to-white" style={{ width: `${Math.min(current?.confidence ?? 0, 100)}%` }} />
            </div>
          </div>
        </section>
        <aside className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-secondary">Upcoming tokens</p>
            <div className="mt-4 space-y-3">
              {upcoming.map(patient => (
                <div key={patient.id} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-white">{patient.token}</p>
                    <p className="text-xs text-white/50">{patient.department}</p>
                  </div>
                  <p className="mt-2 text-sm text-white/70">{patient.name} · {patient.doctor}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] bg-white p-5 text-ink">
            <div className="mb-4 flex items-center gap-2 text-primary"><QRCode value={JSON.stringify({ token: current?.token, name: current?.name, doctor: current?.doctor })} className="h-5 w-5" /><span className="font-semibold">QR queue access</span></div>
            <QRCode value={JSON.stringify({ token: current?.token, name: current?.name, doctor: current?.doctor })} className="h-auto w-full" />
          </div>
        </aside>
      </div>
    </div>
  )
}
