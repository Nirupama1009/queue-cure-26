import { Bell, Clock3, Menu, Search, Sparkles } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { cn, formatTime } from '../lib/utils'
import { Button, Card, Input, Toggle } from './ui'

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/register', label: 'Registration' },
  { to: '/app/live', label: 'Live Queue' },
  { to: '/app/tv', label: 'TV Display' },
  { to: '/app/analytics', label: 'Analytics' },
  { to: '/app/settings', label: 'Settings' },
  { to: '/app/history', label: 'History' },
]

export function DashboardShell({ children }: { children: ReactNode }) {
  const theme = useAppStore(state => state.theme)
  const setTheme = useAppStore(state => state.setTheme)
  const settings = useAppStore(state => state.settings)
  const search = useAppStore(state => state.search)
  const setSearch = useAppStore(state => state.setSearch)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-hero-gradient text-ink dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.14),transparent_24%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.1),transparent_28%)] dark:opacity-100" />
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-6 p-4 md:p-6">
        <aside className={cn('fixed inset-y-4 left-4 z-40 w-[280px] rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur-xl transition-transform dark:border-white/10 dark:bg-slate-950/90 md:sticky md:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0')}>
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white shadow-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">Queue Cure '26</p>
                <h1 className="text-lg font-bold">{settings?.hospital_name ?? "Queue Cure '26"}</h1>
              </div>
            </Link>
            <button className="rounded-full border border-slate-200 p-2 md:hidden" onClick={() => setSidebarOpen(false)}><Menu className="h-5 w-5" /></button>
          </div>
          <nav className="mt-8 space-y-2">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => cn('block rounded-[18px] px-4 py-3 text-sm font-semibold transition', isActive ? 'bg-primary text-white shadow-glow' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5')}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Card className="mt-8 bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Current Time</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="mt-1 text-sm text-slate-500">{formatTime(now)}</p>
              </div>
              <Clock3 className="h-8 w-8 text-primary" />
            </div>
          </Card>
          <Card className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Clinic status</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <p className="text-slate-500">Departments</p>
                <p className="mt-1 font-bold">{settings?.departments.length ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <p className="text-slate-500">Theme</p>
                <p className="mt-1 font-bold capitalize">{theme}</p>
              </div>
            </div>
          </Card>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <button className="rounded-full border border-slate-200 p-2 md:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Reception Dashboard</p>
                  <h2 className="text-2xl font-bold">Welcome back, team</h2>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
                <div className="relative max-w-xl flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search patient, token, department..." className="pl-11" />
                </div>
                <div className="flex items-center gap-3">
                  <Toggle checked={theme === 'dark'} onChange={value => void setTheme(value ? 'dark' : 'light')} />
                  <Button variant="glass" className="h-12 w-12 px-0"><Bell className="h-5 w-5" /></Button>
                  <Button variant="glass" className="px-4 py-3">Profile</Button>
                </div>
              </div>
            </div>
          </header>
          <main className="min-w-0 flex-1 pb-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
