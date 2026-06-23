import { DashboardShell } from '../components/layout'
import { AnalyticsCharts } from '../components/charts'
import { Badge, Card } from '../components/ui'
import { EmptyState } from '../components/empty-state'
import { useAppStore } from '../store/useAppStore'

export function AnalyticsPage() {
  const analytics = useAppStore(state => state.analytics)

  if (!analytics) {
    return (
      <DashboardShell>
        <EmptyState
          title="Analytics are still loading"
          message="The dashboard will populate once the live bootstrap completes and queue events start flowing."
        />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Analytics dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Realtime queue intelligence</h1>
          </div>
          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">Live updates on</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-white/80 dark:from-primary/20 dark:to-white/5"><p className="text-xs uppercase tracking-[0.28em] text-primary">Patients served today</p><p className="mt-4 text-4xl font-black">{analytics.patients_served_today}</p></Card>
          <Card className="bg-gradient-to-br from-secondary/10 to-white/80 dark:from-secondary/20 dark:to-white/5"><p className="text-xs uppercase tracking-[0.28em] text-primary">Average wait</p><p className="mt-4 text-4xl font-black">{analytics.average_wait_minutes}m</p></Card>
          <Card><p className="text-xs uppercase tracking-[0.28em] text-primary">Longest wait</p><p className="mt-4 text-4xl font-black">{analytics.longest_wait_minutes}m</p></Card>
          <Card><p className="text-xs uppercase tracking-[0.28em] text-primary">Busiest department</p><p className="mt-4 text-2xl font-black">{analytics.busiest_department}</p></Card>
        </div>
        <AnalyticsCharts analytics={analytics} />
      </div>
    </DashboardShell>
  )
}
