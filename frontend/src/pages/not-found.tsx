import { ArrowLeft, Hospital } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Card } from '../components/ui'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-gradient p-6 text-ink dark:bg-slate-950 dark:text-white">
      <Card className="max-w-lg overflow-hidden text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary/10 text-primary">
          <Hospital className="h-14 w-14" />
        </div>
        <h1 className="mt-5 text-4xl font-black">404</h1>
        <p className="mt-3 text-slate-500">That clinic route does not exist. Return to the main dashboard or landing page.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/"><Button variant="glass"><ArrowLeft className="h-4 w-4" /> Home</Button></Link>
          <Link to="/app/dashboard"><Button>Dashboard</Button></Link>
        </div>
      </Card>
    </div>
  )
}
