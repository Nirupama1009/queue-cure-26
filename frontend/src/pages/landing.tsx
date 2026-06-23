import { ArrowRight, Building2, Hospital, PlayCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HospitalIllustration } from '../components/illustration'
import { Badge, Button, Card } from '../components/ui'

const features = [
  ['Real queue engine', 'Priority ordering with emergency, senior citizen, and FIFO handling.'],
  ['Live sync', 'Every update reaches reception, mobile, and TV screens instantly.'],
  ['Smart wait AI', 'Wait-time prediction considers doctor speed and department load.'],
  ['Hackathon ready', 'Premium visuals, analytics, dark mode, and production structure.'],
]

const stats = [
  ['42%', 'Lower perceived waiting'],
  ['3.2x', 'Faster triage visibility'],
  ['98%', 'Sync confidence'],
  ['24/7', 'Digital signage support'],
]

const testimonials = [
  ['City Care Hospital', 'The queue visibility feels like a premium SaaS product.'],
  ['MedAxis Clinic', 'The real-time dashboard makes reception operations instant.'],
  ['Pulse Health', 'The TV display and QR access are exactly what we needed.'],
]

const logos = ['City Care', 'Pulse Health', 'MedAxis', 'Nova Clinic', 'Apex Hospital']

export function LandingPage() {
  return (
    <div className="min-h-screen bg-hero-gradient text-ink dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-[24px] border border-white/70 bg-white/80 px-5 py-4 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Queue Cure '26</p>
              <h1 className="text-lg font-bold">Smart Clinic Queue Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="glass">Login</Button></Link>
            <a href="#demo"><Button>Live Demo <ArrowRight className="h-4 w-4" /></Button></a>
          </div>
        </header>

        <section className="grid items-center gap-10 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <Badge className="border-primary/20 bg-primary/10 text-primary">Hackathon-grade clinic operations</Badge>
            <motion.h2 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6 max-w-3xl text-5xl font-black tracking-tight text-ink dark:text-white md:text-7xl">
              One queue system for reception, patients, and digital signage.
            </motion.h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Queue Cure '26 turns a crowded clinic into a calm, synchronized, premium healthcare experience with live queue logic, analytics, WebSockets, and intelligent wait-time prediction.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/app/dashboard"><Button className="px-6 py-4 text-base">Open dashboard <PlayCircle className="h-5 w-5" /></Button></Link>
              <Link to="/app/live"><Button variant="glass" className="px-6 py-4 text-base">View live queue</Button></Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(([value, label]) => (
                <Card key={label} className="bg-white/70">
                  <p className="text-3xl font-black text-primary">{value}</p>
                  <p className="mt-2 text-sm text-slate-500">{label}</p>
                </Card>
              ))}
            </div>
          </div>
          <Card className="overflow-hidden border-white/80 bg-white/70 p-4 shadow-glow">
            <HospitalIllustration />
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map(([title, description], index) => (
            <motion.div key={title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
              <Card className="h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-ink dark:text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="mt-12 rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Trusted look and feel</p>
              <h3 className="mt-2 text-2xl font-bold">Hospital branding that feels funded.</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {logos.map(name => <Badge key={name} className="border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">{name}</Badge>)}
            </div>
          </div>
        </section>

        <section id="demo" className="grid gap-4 py-12 lg:grid-cols-3">
          {testimonials.map(([name, quote]) => (
            <Card key={name}>
              <div className="flex items-center gap-2 text-primary"><ShieldCheck className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-[0.28em]">{name}</span></div>
              <p className="mt-4 text-lg font-medium leading-8 text-ink dark:text-white">“{quote}”</p>
            </Card>
          ))}
        </section>

        <footer className="border-t border-white/60 py-8 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>Queue Cure '26. Premium clinic queue operations for a modern healthcare stack.</p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-primary">Login</Link>
              <Link to="/app/dashboard" className="hover:text-primary">Dashboard</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
