const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Helper to get auth header
const authHeader = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Generic fetch wrapper
const request = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || 'Request failed')
  }

  // 204 No Content
  if (res.status === 204) return null

  return res.json()
}

// ── Auth ──────────────────────────────────────────
export const authApi = {
  register: (username: string, email: string, password: string) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request('/api/auth/logout', { method: 'POST' }),
}

// ── Signals ───────────────────────────────────────
export const signalsApi = {
  getAll: (filters?: {
    mode?: string
    category?: string
    band?: string
    freq_min?: string
    freq_max?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.mode) params.set('mode', filters.mode)
    if (filters?.category) params.set('category', filters.category)
    if (filters?.band) params.set('band', filters.band)
    if (filters?.freq_min) params.set('freq_min', filters.freq_min)
    if (filters?.freq_max) params.set('freq_max', filters.freq_max)
    const query = params.toString()
    return request(`/api/signals${query ? `?${query}` : ''}`)
  },

  getOne: (id: string) => request(`/api/signals/${id}`),
}

// ── Favorites ─────────────────────────────────────
export const favoritesApi = {
  getAll: () => request('/api/favorites'),

  add: (signalId: string, notes?: string) =>
    request('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ signal_id: signalId, notes: notes || '' }),
    }),

  remove: (id: string) =>
    request(`/api/favorites/${id}`, { method: 'DELETE' }),

  updateNotes: (id: string, notes: string) =>
    request(`/api/favorites/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),
}

// ── User Signals ──────────────────────────────────
export const userSignalsApi = {
  getAll: () => request('/api/user-signals'),

  create: (signal: {
    frequency: number
    mode: string
    description: string
    category?: string
    band?: string
  }) =>
    request('/api/user-signals', {
      method: 'POST',
      body: JSON.stringify(signal),
    }),

  update: (id: string, signal: {
    frequency: number
    mode: string
    description: string
    category?: string
    band?: string
  }) =>
    request(`/api/user-signals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(signal),
    }),

  remove: (id: string) =>
    request(`/api/user-signals/${id}`, { method: 'DELETE' }),
}

// ── External ──────────────────────────────────────
export const externalApi = {
  getBandConditions: () => request('/api/band-conditions'),
  getRepeaters: (lat?: string, lng?: string) => {
    const params = new URLSearchParams()
    if (lat) params.set('lat', lat)
    if (lng) params.set('lng', lng)
    const query = params.toString()
    return request(`/api/repeaters${query ? `?${query}` : ''}`)
  },
}