import { ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HospitalIllustration } from '../components/illustration'
import { Badge, Button, Card, Input, Toggle } from '../components/ui'
import { useAppStore } from '../store/useAppStore'

export function LoginPage() {
  const navigate = useNavigate()
  const theme = useAppStore(state => state.theme)
  const setTheme = useAppStore(state => state.setTheme)
  const [remember, setRemember] = useState(true)

  return (
    <div className="min-h-screen bg-hero-gradient p-4 text-ink dark:bg-slate-950 dark:text-white md:p-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.16),transparent_26%)]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white shadow-lg"><Sparkles className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Queue Cure '26</p>
                <h1 className="text-lg font-bold">Secure receptionist access</h1>
              </div>
            </div>
            <Toggle checked={theme === 'dark'} onChange={value => void setTheme(value ? 'dark' : 'light')} />
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 max-w-xl">
            <Badge className="border-primary/20 bg-primary/10 text-primary">Trusted by modern clinics</Badge>
            <h2 className="mt-6 text-5xl font-black tracking-tight">A calm interface for high-pressure reception desks.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">Manage live queues, call next tokens, and monitor wait analytics without losing the premium feel.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Card className="bg-white/80 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.24em] text-primary">Uptime</p>
                <p className="mt-2 text-2xl font-black">99.9%</p>
              </Card>
              <Card className="bg-white/80 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.24em] text-primary">Sync</p>
                <p className="mt-2 text-2xl font-black">Realtime</p>
              </Card>
              <Card className="bg-white/80 p-4 dark:bg-white/5">
                <p className="text-xs uppercase tracking-[0.24em] text-primary">Mode</p>
                <p className="mt-2 text-2xl font-black">Premium</p>
              </Card>
            </div>
          </motion.div>
          <div className="mt-10 overflow-hidden rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-soft dark:border-white/10 dark:bg-white/5">
            <HospitalIllustration />
          </div>
        </div>

        <Card className="flex items-center justify-center p-6 md:p-10">
          <form
            className="w-full max-w-md space-y-5"
            onSubmit={event => {
              event.preventDefault()
              navigate('/app/dashboard')
            }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Reception login</p>
              <h2 className="mt-2 text-3xl font-bold">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Demo login is intentionally frictionless for hackathon review flows.</p>
            </div>
            <label className="block space-y-2 text-sm font-medium">
              <span>Email</span>
              <Input type="email" placeholder="reception@queuecure.health" />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Password</span>
              <Input type="password" placeholder="••••••••" />
            </label>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember me</label>
              <a href="#" className="font-semibold text-primary">Forgot password?</a>
            </div>
            <Button type="submit" className="w-full py-4 text-base">Enter dashboard</Button>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="bg-white/80 p-4 text-left dark:bg-white/5">
                <div className="flex items-center gap-2 text-primary"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.24em]">Secure</span></div>
                <p className="mt-2 text-sm text-slate-500">Validated receptionist access with a clean handoff into the queue dashboard.</p>
              </Card>
              <Card className="bg-white/80 p-4 text-left dark:bg-white/5">
                <div className="flex items-center gap-2 text-secondary"><Sparkles className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-[0.24em]">Fast</span></div>
                <p className="mt-2 text-sm text-slate-500">Login is optimized for live demo speed and mobile-friendly review flows.</p>
              </Card>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
