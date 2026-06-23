import { Download, RotateCcw, SaveAll } from 'lucide-react'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { DashboardShell } from '../components/layout'
import { Badge, Button, Card, Input, Select } from '../components/ui'
import { useAppStore } from '../store/useAppStore'

const schema = z.object({
  average_consultation_minutes: z.coerce.number().min(1).max(180),
  theme: z.enum(['light', 'dark']),
  hospital_name: z.string().min(2),
})

type SettingsForm = z.infer<typeof schema>

export function SettingsPage() {
  const settings = useAppStore(state => state.settings)
  const updateSettings = useAppStore(state => state.updateSettings)
  const resetQueue = useAppStore(state => state.resetQueue)
  const pauseQueue = useAppStore(state => state.pauseQueue)
  const resumeQueue = useAppStore(state => state.resumeQueue)
  const exportQueue = useAppStore(state => state.exportQueue)
  const backupDatabase = useAppStore(state => state.backupDatabase)
  const restoreDatabase = useAppStore(state => state.restoreDatabase)
  const addToast = useAppStore(state => state.addToast)
  const restoreInputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit } = useForm<SettingsForm>({
    resolver: zodResolver(schema),
    defaultValues: settings ?? { average_consultation_minutes: 8, theme: 'light', hospital_name: "Queue Cure '26" },
  })

  return (
    <DashboardShell>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Admin settings</p>
          <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Clinic configuration</h1>
          <p className="mt-3 text-slate-500">Tune consultation time, theme, and operational settings from one screen.</p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit(async values => void updateSettings(values))}>
            <label className="space-y-2 text-sm font-medium">Average Consultation Time <Input type="number" {...register('average_consultation_minutes')} /></label>
            <label className="space-y-2 text-sm font-medium">Clinic Name <Input {...register('hospital_name')} /></label>
            <label className="space-y-2 text-sm font-medium">Theme <Select {...register('theme')}><option value="light">Light</option><option value="dark">Dark</option></Select></label>
            <Button type="submit" className="w-full"><SaveAll className="h-4 w-4" /> Save changes</Button>
          </form>
        </Card>
        <div className="space-y-6">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Operational tools</p>
            <h2 className="mt-2 text-2xl font-bold text-ink dark:text-white">Queue control</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button variant="glass" className="justify-start" onClick={() => void backupDatabase()}><Download className="h-4 w-4" /> Backup database</Button>
              <Button variant="glass" className="justify-start" onClick={() => restoreInputRef.current?.click()}><RotateCcw className="h-4 w-4" /> Restore database</Button>
              <Button variant="glass" className="justify-start" onClick={() => void exportQueue()}>Export queue CSV</Button>
              <Button variant="glass" className="justify-start" onClick={() => void pauseQueue()}>Pause queue</Button>
              <Button variant="secondary" className="justify-start" onClick={() => void resumeQueue()}>Resume queue</Button>
              <Button variant="danger" className="justify-start sm:col-span-2" onClick={() => void resetQueue()}>Reset queue</Button>
            </div>
            <input
              ref={restoreInputRef}
              type="file"
              accept=".db,.sqlite,.sqlite3"
              className="hidden"
              onChange={async event => {
                const file = event.target.files?.[0]
                if (!file) return
                await restoreDatabase(file)
                event.target.value = ''
              }}
            />
          </Card>
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Departments</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {settings?.departments.map(department => <Badge key={department.id} className="bg-primary/10 text-primary">{department.name}</Badge>)}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
