import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Priority, QueueStatus } from '../types'

export function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs))
}

export function formatTime(value: string | Date | null | undefined) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(date)
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function formatMinutes(minutes: number) {
  if (minutes <= 0) return 'Now'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${hours}h ${rest}m`
}

export function priorityTone(priority: Priority | string) {
  switch (priority) {
    case 'Emergency':
      return 'bg-red-500/10 text-red-600 ring-red-500/20'
    case 'Senior Citizen':
      return 'bg-amber-500/10 text-amber-700 ring-amber-500/20'
    default:
      return 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20'
  }
}

export function statusTone(status: QueueStatus | string) {
  switch (status) {
    case 'Called':
      return 'bg-blue-500/10 text-blue-700 ring-blue-500/20'
    case 'In Consultation':
      return 'bg-amber-500/10 text-amber-700 ring-amber-500/20'
    case 'Completed':
      return 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20'
    case 'Skipped':
      return 'bg-slate-500/10 text-slate-600 ring-slate-500/20'
    default:
      return 'bg-sky-500/10 text-sky-700 ring-sky-500/20'
  }
}
