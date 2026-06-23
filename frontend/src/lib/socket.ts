import type { WebSocketPayload } from '../types'

export function connectSocket(onMessage: (payload: WebSocketPayload) => void) {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const url = baseURL.replace(/^http/, 'ws') + '/ws'
  const socket = new WebSocket(url)

  socket.onmessage = event => {
    try {
      onMessage(JSON.parse(event.data) as WebSocketPayload)
    } catch {
      void 0
    }
  }

  return socket
}
