// 🌐 CLIENT API ROBUSTE - CESIZen

import type { ApiError, HttpMethod, RefreshTokenResponse } from '@/types'
import { config } from './config'

/**
 * Configuration de requête simplifiée
 */
interface SimpleRequestConfig {
  method: HttpMethod
  url: string
  data?: unknown
  params?: Record<string, string | number | undefined>
  requireAuth?: boolean
}

/**
 * Client HTTP simplifié avec gestion d'erreurs et intercepteurs
 */
class ApiClient {
  private baseURL: string
  private isRefreshing = false

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, '')
  }

  /**
   * Récupère le token stocké
   */
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(config.authTokenKey)
  }

  /**
   * Stocke le token
   */
  private setStoredToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(config.authTokenKey, token)
  }

  /**
   * Supprime les données d'authentification
   */
  private removeStoredAuth(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(config.authTokenKey)
    localStorage.removeItem(config.authUserKey)
  }

  /**
   * Gère l'échec d'authentification
   */
  private handleAuthFailure(): void {
    this.removeStoredAuth()

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  /**
   * Refresh le token d'accès
   */
  private async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // Attendre que le refresh en cours se termine
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return this.getStoredToken()
    }

    this.isRefreshing = true

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Refresh failed')
      }

      const data: RefreshTokenResponse = await response.json()
      this.setStoredToken(data.access_token)
      return data.access_token
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.handleAuthFailure()
      return null
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * Construit une URL avec des paramètres
   */
  private buildUrlWithParams(
    url: string,
    params?: Record<string, string | number | undefined>,
  ): string {
    if (!params) return url

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value))
    })

    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${searchParams.toString()}`
  }

  /**
   * Crée une ApiError à partir d'une Response d'erreur
   */
  private async createApiError(response: Response): Promise<ApiError> {
    let errorData

    try {
      errorData = await response.json()
    } catch {
      errorData = { message: 'Erreur inconnue du serveur' }
    }

    return {
      success: false,
      error: {
        code: response.status,
        message: errorData.message || `Erreur HTTP ${response.status}`,
        details: errorData.details || errorData.error,
      },
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Exécute une requête HTTP
   */
  async request<T>(requestConfig: SimpleRequestConfig): Promise<T> {
    const { method, url, data, params, requireAuth = true } = requestConfig

    // Construction de l'URL complète
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    const urlWithParams = this.buildUrlWithParams(fullUrl, params)

    // Preparation des headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    // Ajout du token d'authentification
    if (requireAuth) {
      const token = this.getStoredToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    // Configuration de la requête
    const requestInit: RequestInit = {
      method,
      headers,
      credentials: 'include',
    }

    // Ajout du body pour les méthodes avec données
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestInit.body = JSON.stringify(data)
    }

    // Timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout)
    requestInit.signal = controller.signal

    try {
      // Logging en mode debug
      if (config.enableDebug) {
        console.log(`[API Request] ${method} ${urlWithParams}`, {
          headers,
          data,
        })
      }

      // Exécution de la requête
      const response = await fetch(urlWithParams, requestInit)
      clearTimeout(timeoutId)

      // Gestion des erreurs d'authentification
      if (response.status === 401 && requireAuth) {
        const newToken = await this.refreshToken()
        if (newToken) {
          // Retry avec le nouveau token
          headers.Authorization = `Bearer ${newToken}`
          const retryResponse = await fetch(urlWithParams, {
            ...requestInit,
            headers,
          })

          if (!retryResponse.ok) {
            throw await this.createApiError(retryResponse)
          }

          if (retryResponse.status === 204 || retryResponse.headers.get('content-length') === '0') {
            return null as T
          }

          const retryData = await retryResponse.json()
          if (config.enableDebug) {
            console.log(`[API Response - Retry] ${method} ${urlWithParams}`, retryData)
          }
          return retryData
        }
      }

      // Gestion des autres erreurs HTTP
      if (!response.ok) {
        throw await this.createApiError(response)
      }

      // Réponse vide (204 No Content, typique des DELETE)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as T
      }

      // Parse de la réponse JSON
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        return null as T
      }

      const responseData = await response.json()

      if (config.enableDebug) {
        console.log(`[API Response] ${method} ${urlWithParams}`, responseData)
      }

      return responseData
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutError: ApiError = {
          success: false,
          error: {
            code: 408,
            message: 'Timeout de la requête dépassé',
            details: 'RequestTimeout',
          },
          timestamp: new Date().toISOString(),
        }
        throw timeoutError
      }

      // Re-lancer les ApiError
      if (error && typeof error === 'object' && 'success' in error) {
        throw error
      }

      // Conversion des erreurs natives
      const networkError: ApiError = {
        success: false,
        error: {
          code: 0,
          message: (error as Error)?.message || 'Erreur de réseau',
          details: 'NetworkError',
        },
        timestamp: new Date().toISOString(),
      }
      throw networkError
    }
  }

  /**
   * Méthodes HTTP raccourcies avec authentification
   */
  async get<T>(url: string, params?: Record<string, string | number | undefined>): Promise<T> {
    return this.request<T>({ method: 'GET', url, params })
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', url, data })
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data })
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data })
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', url })
  }

  /**
   * Méthodes publiques (sans authentification)
   */
  async getPublic<T>(
    url: string,
    params?: Record<string, string | number | undefined>,
  ): Promise<T> {
    return this.request<T>({ method: 'GET', url, params, requireAuth: false })
  }

  async postPublic<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, requireAuth: false })
  }
}

// Instance globale du client API
export const apiClient = new ApiClient(config.apiUrl)

// Export des méthodes pour faciliter l'utilisation
export const { get, post, put, patch, delete: del, getPublic, postPublic } = apiClient
