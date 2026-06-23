import { CalendarClock, History as HistoryIcon } from 'lucide-react'
import { DashboardShell } from '../components/layout'
import { Card } from '../components/ui'
import { EmptyState } from '../components/empty-state'
import { formatDateTime } from '../lib/utils'
import { useAppStore } from '../store/useAppStore'

export function HistoryPage() {
  const history = useAppStore(state => state.history)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Queue timeline</p>
          <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">History and audit trail</h1>
        </div>
        {history.length === 0 ? (
          <EmptyState
            title="No activity yet"
            message="The audit trail will populate as patients are added, called, completed, or deleted."
          />
        ) : (
          <Card>
            <div className="relative space-y-4 before:absolute before:bottom-0 before:left-[23px] before:top-0 before:w-px before:bg-gradient-to-b before:from-primary/20 before:to-secondary/20">
              {history.map(item => (
                <div key={item.id} className="relative flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-5 pl-16 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
                  <div className="absolute left-4 top-5 rounded-2xl bg-primary/10 p-3 text-primary"><HistoryIcon className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold text-ink dark:text-white">{item.patient_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.action.replaceAll('_', ' ')} · {item.details}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400"><CalendarClock className="h-4 w-4" /> {formatDateTime(item.created_at)}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
}
