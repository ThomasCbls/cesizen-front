import { config } from '@/lib/config'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// API Endpoints
export const endpoints = {
  // Auth routes
  auth: {
    login: `${BASE_URL}/auth/login`,
    logout: `${BASE_URL}/auth/logout`,
    register: `${BASE_URL}/utilisateurs`,
    refresh: `${BASE_URL}/auth/refresh`,
    passwordPrompt: (action: string = 'change') =>
      `${BASE_URL}/auth/password-prompt?action=${action}`,
    changePassword: `${BASE_URL}/auth/change-password`,
  },

  // User routes
  users: {
    getById: (id: string) => `${BASE_URL}/utilisateurs/${id}`,
    create: `${BASE_URL}/utilisateurs`,
    update: (id: string) => `${BASE_URL}/utilisateurs/${id}`,
    delete: (id: string) => `${BASE_URL}/utilisateurs/${id}`,
  },
}

// Re-export config token key for use in apiCall
export { config }

// Helper function for API calls
export const apiCall = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  data?: any,
) => {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem(config.authTokenKey) : null
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      }
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data)
    }

    console.log(`[API Call] ${method} ${endpoint}`)
    const response = await fetch(endpoint, options)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }))
      console.error(`[API Error] ${response.status}:`, errorData)
      throw new Error(errorData.message || `Erreur ${response.status}`)
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null
    }

    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('[API Error]', error)
    throw error
  }
}
