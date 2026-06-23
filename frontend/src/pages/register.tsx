import { ArrowRight, Sparkles } from 'lucide-react'
import { DashboardShell } from '../components/layout'
import { Badge, Card } from '../components/ui'
import { PatientRegistrationForm } from '../components/patient-registration-form'

export function ReceptionRegistrationPage() {
  return (
    <DashboardShell>
      <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden bg-gradient-to-br from-primary/10 via-white/70 to-secondary/10 dark:via-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Patient registration</p>
          <h1 className="mt-3 text-4xl font-black text-ink dark:text-white">High-trust intake for a busy clinic front desk.</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Register patients, assign doctors, and let the queue engine calculate wait time and priority instantly.</p>
          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <Badge className="border-red-500/20 bg-red-500/10 text-red-600">Emergency first</Badge>
            <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-700">Senior citizen priority</Badge>
            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">FIFO within priority</Badge>
            <Badge className="border-primary/20 bg-primary/10 text-primary">Auto wait prediction</Badge>
          </div>
          <div className="mt-10 rounded-[26px] border border-white/70 bg-white/75 p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">What happens next</p>
            <div className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-300">
              <p className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-secondary" /> Token is generated automatically.</p>
              <p className="flex items-center gap-3"><ArrowRight className="h-4 w-4 text-primary" /> Wait time recalculates live across screens.</p>
              <p className="flex items-center gap-3"><ArrowRight className="h-4 w-4 text-secondary" /> History and analytics update without refresh.</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <PatientRegistrationForm />
        </Card>
      </div>
    </DashboardShell>
  )
}
