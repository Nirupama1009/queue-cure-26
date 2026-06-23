import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'
import { connectSocket } from '../lib/socket'
import type { ActionResponse, Analytics, BootstrapResponse, ControlResponse, Department, Doctor, HistoryItem, Patient, Settings, ThemeMode, WebSocketPayload } from '../types'

interface ToastItem {
  id: string
  title: string
  message: string
  tone?: 'success' | 'info' | 'warning' | 'danger'
}

interface AppState {
  isReady: boolean
  loading: boolean
  error: string | null
  queue: Patient[]
  analytics: Analytics | null
  history: HistoryItem[]
  departments: Department[]
  doctors: Doctor[]
  settings: Settings | null
  theme: ThemeMode
  search: string
  departmentFilter: string
  priorityFilter: string
  statusFilter: string
  toasts: ToastItem[]
  socket: WebSocket | null
  initialize: () => Promise<void>
  setTheme: (theme: ThemeMode) => Promise<void>
  setSearch: (search: string) => void
  setDepartmentFilter: (value: string) => void
  setPriorityFilter: (value: string) => void
  setStatusFilter: (value: string) => void
  registerPatient: (payload: Record<string, unknown>) => Promise<void>
  callNext: () => Promise<void>
  completePatient: (patientId: number) => Promise<void>
  deletePatient: (patientId: number) => Promise<void>
  updateSettings: (payload: Partial<Settings>) => Promise<void>
  resetQueue: () => Promise<void>
  pauseQueue: () => Promise<void>
  resumeQueue: () => Promise<void>
  exportQueue: () => Promise<void>
  backupDatabase: () => Promise<void>
  restoreDatabase: (file: File) => Promise<void>
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  dismissToast: (id: string) => void
  hydrate: (bootstrap: BootstrapResponse) => void
  attachSocket: () => void
}

function mergeStateFromPayload(state: AppState, payload: WebSocketPayload) {
  const nextQueue = payload.payload.queue ?? state.queue
  const nextAnalytics = payload.payload.analytics ?? state.analytics
  return {
    queue: nextQueue,
    analytics: nextAnalytics,
    history: payload.payload.history ?? state.history,
    departments: state.departments,
    doctors: state.doctors,
    settings: state.settings,
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isReady: false,
      loading: true,
      error: null,
      queue: [],
      analytics: null,
      history: [],
      departments: [],
      doctors: [],
      settings: null,
      theme: 'light',
      search: '',
      departmentFilter: 'All',
      priorityFilter: 'All',
      statusFilter: 'All',
      toasts: [],
      socket: null,
      async initialize() {
        set({ loading: true, error: null })
        try {
          const { data } = await api.get<BootstrapResponse>('/bootstrap')
          set({
            isReady: true,
            loading: false,
            queue: data.queue,
            analytics: data.analytics,
            history: data.history,
            departments: data.departments,
            doctors: data.doctors,
            settings: data.settings,
            theme: data.settings.theme,
          })
          document.documentElement.classList.toggle('dark', data.settings.theme === 'dark')
          get().attachSocket()
        } catch (error) {
          set({ loading: false, error: error instanceof Error ? error.message : 'Failed to load Queue Cure' })
        }
      },
      async setTheme(theme) {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
        if (get().settings) {
          await get().updateSettings({ ...get().settings!, theme })
        }
      },
      setSearch(search) {
        set({ search })
      },
      setDepartmentFilter(value) {
        set({ departmentFilter: value })
      },
      setPriorityFilter(value) {
        set({ priorityFilter: value })
      },
      setStatusFilter(value) {
        set({ statusFilter: value })
      },
      async registerPatient(payload) {
        const { data } = await api.post<ActionResponse>('/patients', payload)
        set(state => ({
          queue: data.queue ?? state.queue,
          analytics: data.analytics ?? state.analytics,
          toasts: [...state.toasts, { id: crypto.randomUUID(), title: 'Patient registered', message: data.message, tone: 'success' }],
        }))
        get().attachSocket()
      },
      async callNext() {
        const { data } = await api.post<ActionResponse>('/call-next')
        set(state => ({
          queue: data.queue ?? state.queue,
          analytics: data.analytics ?? state.analytics,
          toasts: [...state.toasts, { id: crypto.randomUUID(), title: 'Next token called', message: data.message, tone: 'info' }],
        }))
      },
      async completePatient(patientId) {
        const { data } = await api.post<ActionResponse>('/complete', null, { params: { patient_id: patientId } })
        set(state => ({
          queue: data.queue ?? state.queue,
          analytics: data.analytics ?? state.analytics,
          toasts: [...state.toasts, { id: crypto.randomUUID(), title: 'Patient completed', message: data.message, tone: 'success' }],
        }))
      },
      async deletePatient(patientId) {
        const { data } = await api.delete<ActionResponse>(`/patient/${patientId}`)
        set(state => ({
          queue: data.queue ?? state.queue,
          analytics: data.analytics ?? state.analytics,
          toasts: [...state.toasts, { id: crypto.randomUUID(), title: 'Patient removed', message: data.message, tone: 'warning' }],
        }))
      },
      async updateSettings(payload) {
        const nextSettings = {
          ...(get().settings ?? { average_consultation_minutes: 8, theme: 'light', hospital_name: "Queue Cure '26", departments: [] }),
          ...payload,
        }
        const { data } = await api.put<Settings>('/settings', nextSettings)
        set({ settings: data, theme: data.theme })
        document.documentElement.classList.toggle('dark', data.theme === 'dark')
      },
      async resetQueue() {
        await api.post('/queue/reset')
        await get().initialize()
        get().addToast({ title: 'Queue reset', message: 'All queue entries have been cleared.', tone: 'warning' })
      },
      async pauseQueue() {
        const { data } = await api.post<ControlResponse>('/queue/pause')
        get().addToast({ title: 'Queue paused', message: data.message, tone: 'warning' })
      },
      async resumeQueue() {
        const { data } = await api.post<ControlResponse>('/queue/resume')
        get().addToast({ title: 'Queue resumed', message: data.message, tone: 'success' })
      },
      async exportQueue() {
        const response = await api.get<Blob>('/export/queue.csv', { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }))
        const link = document.createElement('a')
        link.href = url
        link.download = 'queue_cure_queue.csv'
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        get().addToast({ title: 'Export ready', message: 'Queue data downloaded as CSV.', tone: 'success' })
      },
      async backupDatabase() {
        const response = await api.get<Blob>('/backup/database', { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.download = 'queue_cure_backup.db'
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        get().addToast({ title: 'Backup downloaded', message: 'SQLite backup saved locally.', tone: 'info' })
      },
      async restoreDatabase(file) {
        const formData = new FormData()
        formData.append('file', file)
        const { data } = await api.post<ControlResponse>('/restore/database', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        get().addToast({ title: 'Database restored', message: data.message, tone: 'success' })
        await get().initialize()
      },
      addToast(toast) {
        const id = crypto.randomUUID()
        set(state => ({ toasts: [...state.toasts, { ...toast, id }] }))
        window.setTimeout(() => get().dismissToast(id), 3500)
      },
      dismissToast(id) {
        set(state => ({ toasts: state.toasts.filter(item => item.id !== id) }))
      },
      hydrate(bootstrap) {
        set({
          queue: bootstrap.queue,
          analytics: bootstrap.analytics,
          history: bootstrap.history,
          departments: bootstrap.departments,
          doctors: bootstrap.doctors,
          settings: bootstrap.settings,
          theme: bootstrap.settings.theme,
          isReady: true,
          loading: false,
        })
      },
      attachSocket() {
        const existing = get().socket
        if (existing && existing.readyState === WebSocket.OPEN) return
        const socket = connectSocket(payload => {
          set(state => mergeStateFromPayload(state, payload))
          if (payload.type !== 'queue_updated') {
            get().addToast({ title: 'Live sync', message: payload.type.replaceAll('_', ' '), tone: 'info' })
          }
        })
        set({ socket })
      },
    }),
    {
      name: 'queue-cure-ui',
      partialize: state => ({ theme: state.theme }),
    },
  ),
)
