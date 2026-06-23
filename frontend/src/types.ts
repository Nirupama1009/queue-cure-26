export type Priority = 'Emergency' | 'Senior Citizen' | 'Normal'
export type QueueStatus = 'Waiting' | 'Called' | 'In Consultation' | 'Completed' | 'Skipped'
export type ThemeMode = 'light' | 'dark'

export interface Department {
  id: number
  name: string
  color: string
  average_consultation_minutes: number
  is_active: boolean
}

export interface Doctor {
  id: number
  name: string
  specialty: string
  is_available: boolean
  average_speed_factor: number
  department_id: number | null
}

export interface Patient {
  id: number
  token: string
  name: string
  age: number
  gender: string
  phone: string
  department: string
  doctor: string
  symptoms: string
  priority: Priority | string
  emergency: boolean
  senior_citizen: boolean
  status: QueueStatus | string
  estimated_wait_minutes: number
  confidence: number
  created_at: string
  updated_at: string
  called_at: string | null
  completed_at: string | null
  consultation_minutes: number
  queue_order: number
}

export interface HistoryItem {
  id: number
  token: string
  patient_name: string
  action: string
  details: string
  created_at: string
}

export interface Analytics {
  patients_served_today: number
  average_wait_minutes: number
  longest_wait_minutes: number
  busiest_department: string
  queue_length: number
  emergency_count: number
  senior_count: number
  normal_count: number
  department_breakdown: Array<{ name: string; value: number }>
  wait_trend: Array<{ name: string; value: number }>
  doctor_performance: Array<{ name: string; served: number; speed: number }>
  confidence_average: number
}

export interface Settings {
  average_consultation_minutes: number
  theme: ThemeMode
  hospital_name: string
  departments: Department[]
}

export interface BootstrapResponse {
  settings: Settings
  queue: Patient[]
  analytics: Analytics
  departments: Department[]
  doctors: Doctor[]
  history: HistoryItem[]
}

export interface ActionResponse {
  ok: boolean
  message: string
  patient?: Patient | null
  queue?: Patient[] | null
  analytics?: Analytics | null
}

export interface ControlResponse {
  ok: boolean
  message: string
}

export interface WebSocketPayload {
  type: 'patient_added' | 'patient_called' | 'patient_completed' | 'patient_deleted' | 'queue_updated' | 'settings_updated' | 'analytics_updated'
  payload: {
    queue?: Patient[]
    analytics?: Analytics
    history?: HistoryItem[]
    [key: string]: unknown
  }
}
