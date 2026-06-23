import { AlertCircle, Inbox, ShieldCheck } from 'lucide-react'
import { Button, Card } from './ui'

export function EmptyState({ title, message, actionLabel, onAction }: { title: string; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <Inbox className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-2xl font-bold text-ink dark:text-white">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-300">{message}</p>
      {actionLabel ? <Button className="mt-6" onClick={onAction}>{actionLabel}</Button> : null}
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400"><ShieldCheck className="h-4 w-4" /> No placeholder data. Live clinic queue ready.</div>
    </Card>
  )
}
