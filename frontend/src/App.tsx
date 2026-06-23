import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ErrorBoundary } from './components/error-boundary'
import { LoadingScreen, ToastCenter } from './components/ui'
import { DashboardPage } from './pages/dashboard'
import { LandingPage } from './pages/landing'
import { LoginPage } from './pages/login'
import { NotFoundPage } from './pages/not-found'
import { AnalyticsPage } from './pages/analytics'
import { HistoryPage } from './pages/history'
import { LiveQueuePage } from './pages/live'
import { ReceptionRegistrationPage } from './pages/register'
import { SettingsPage } from './pages/settings'
import { TvDisplayPage } from './pages/tv'
import { useAppStore } from './store/useAppStore'

function AppRoutes() {
  const location = useLocation()
  const initialize = useAppStore(state => state.initialize)
  const loading = useAppStore(state => state.loading)
  const toasts = useAppStore(state => state.toasts)
  const dismissToast = useAppStore(state => state.dismissToast)
  const theme = useAppStore(state => state.theme)

  useEffect(() => {
    void initialize()
  }, [initialize])

  useEffect(() => {
    const titles: Record<string, string> = {
      '/': "Queue Cure '26 | Smart Clinic Queue Management",
      '/login': "Queue Cure '26 | Login",
      '/app/dashboard': "Queue Cure '26 | Reception Dashboard",
      '/app/register': "Queue Cure '26 | Patient Registration",
      '/app/live': "Queue Cure '26 | Live Queue",
      '/app/tv': "Queue Cure '26 | TV Display",
      '/app/analytics': "Queue Cure '26 | Analytics",
      '/app/settings': "Queue Cure '26 | Settings",
      '/app/history': "Queue Cure '26 | History",
    }
    document.title = titles[location.pathname] ?? "Queue Cure '26"
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#020617' : '#2563EB')
  }, [location.pathname, theme])

  if (loading && location.pathname.startsWith('/app')) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app/dashboard" element={<DashboardPage />} />
        <Route path="/app/register" element={<ReceptionRegistrationPage />} />
        <Route path="/app/live" element={<LiveQueuePage />} />
        <Route path="/app/tv" element={<TvDisplayPage />} />
        <Route path="/app/analytics" element={<AnalyticsPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        <Route path="/app/history" element={<HistoryPage />} />
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastCenter items={toasts} onDismiss={dismissToast} />
    </ErrorBoundary>
  )
}

export default function App() {
  return <AppRoutes />
}
