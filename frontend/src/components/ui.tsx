import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, ChevronRight, Loader2, MoonStar, SunMedium, X } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/utils'

export function Button({ className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass' }) {
  const variants = {
    primary: 'bg-primary text-white shadow-glow hover:brightness-110',
    secondary: 'bg-secondary text-white shadow-soft hover:brightness-105',
    ghost: 'bg-transparent text-ink hover:bg-slate-100 dark:text-white dark:hover:bg-white/10',
    danger: 'bg-danger text-white hover:brightness-105',
    glass: 'backdrop-blur-xl bg-white/60 text-ink border border-white/50 shadow-soft dark:bg-slate-900/60 dark:text-white dark:border-white/10',
  } as const
  return (
    <button className={cn('inline-flex items-center justify-center gap-2 rounded-[20px] px-4 py-3 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60', variants[variant], className)} {...props} />
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('rounded-[20px] border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70', className)}>{children}</div>
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset', className)}>{children}</span>
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white', props.className)} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white', props.className)} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('w-full rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white', props.className)} />
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={cn('relative inline-flex h-12 w-20 items-center rounded-full border border-white/40 p-1 transition', checked ? 'bg-ink/90' : 'bg-slate-200 dark:bg-white/10')}>
      <motion.span layout className={cn('flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-lg transition', checked ? 'translate-x-8' : 'translate-x-0')}>
        {checked ? <MoonStar className="h-5 w-5" /> : <SunMedium className="h-5 w-5" />}
      </motion.span>
    </button>
  )
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md" onClick={onClose}>
          <motion.div initial={{ y: 24, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.96 }} className="w-full max-w-3xl rounded-[28px] border border-white/40 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-slate-950" onClick={event => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Queue Cure '26</p>
                <h3 className="mt-2 text-2xl font-bold text-ink dark:text-white">{title}</h3>
              </div>
              <button onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ToastCenter({ items, onDismiss }: { items: Array<{ id: string; title: string; message: string; tone?: 'success' | 'info' | 'warning' | 'danger' }>; onDismiss: (id: string) => void }) {
  const toneIcon = {
    success: CheckCircle2,
    info: ChevronRight,
    warning: AlertTriangle,
    danger: AlertTriangle,
  } as const
  return (
    <div className="fixed right-4 top-4 z-[60] space-y-3">
      <AnimatePresence>
        {items.map(item => {
          const Icon = toneIcon[item.tone ?? 'info']
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: -12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.96 }} className="w-[min(380px,calc(100vw-2rem))] rounded-[20px] border border-white/40 bg-white/90 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{item.message}</p>
                </div>
                <button className="text-slate-400 transition hover:text-ink dark:hover:text-white" onClick={() => onDismiss(item.id)}><X className="h-4 w-4" /></button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient text-ink dark:bg-slate-950 dark:text-white">
      <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 text-center shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Queue Cure '26</h1>
        <p className="mt-2 text-sm text-slate-500">Synchronizing live queue, analytics, and device state.</p>
      </div>
    </div>
  )
}
