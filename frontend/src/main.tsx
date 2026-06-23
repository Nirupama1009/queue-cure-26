import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

function hydrateTheme() {
  try {
    const rawState = window.localStorage.getItem('queue-cure-ui')
    if (!rawState) return
    const parsed = JSON.parse(rawState) as { state?: { theme?: 'light' | 'dark' } }
    document.documentElement.classList.toggle('dark', parsed.state?.theme === 'dark')
  } catch {
    document.documentElement.classList.remove('dark')
  }
}

hydrateTheme()
document.title = "Queue Cure '26"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
