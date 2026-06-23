import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button, Card } from './ui'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-hero-gradient p-6">
          <Card className="max-w-xl text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-danger" />
            <h1 className="mt-4 text-3xl font-bold">Something went wrong</h1>
            <p className="mt-3 text-slate-500">The clinic UI hit an unexpected error. Reload the dashboard to recover.</p>
            <Button className="mt-6" onClick={() => window.location.reload()}>Reload app</Button>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
