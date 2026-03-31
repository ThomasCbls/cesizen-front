// ======================================================================
// 🌐 CLIENT API ROBUSTE - CESIZen
// ======================================================================

import { config } from './config'
import type {
  ApiResponse,
  ApiError,
  HttpMethod,
  RequestConfig,
  RefreshTokenResponse,
} from '@/types'

/**
 * Interface pour les intercepteurs de requête
 */
export interface RequestInterceptor {
  (config: RequestConfig): Promise<RequestConfig>
}

/**
 * Interface pour les intercepteurs de réponse
 */
export interface ResponseInterceptor {
  onFulfilled?: (response: Response) => Promise<Response>
  onRejected?: (error: ApiError) => Promise<ApiError>
}

/**
 * Client HTTP avancé avec intercepteurs et gestion d'erreurs
 */
class ApiClient {
  private baseURL: string
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private isRefreshing = false
  private refreshPromise: Promise<string | null> | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/$/, '') // Remove trailing slash
    this.setupDefaultInterceptors()
  }

  /**
   * Configure les intercepteurs par défaut
   */
  private setupDefaultInterceptors(): void {
    // Intercepteur de requête : injection du token
    this.addRequestInterceptor(async (config) => {
      const token = this.getStoredToken()

      if (token && config.requireAuth !== false) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
      }

      // Headers par défaut
      config.headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...config.headers,
      }

      return config
    })

    // Intercepteur de réponse : gestion des erreurs 401
    this.addResponseInterceptor({
      onRejected: async (error: ApiError) => {
        if (error.error.code === 401 && !this.isRefreshing) {
          try {
            const newToken = await this.refreshToken()
            if (newToken) {
              // Retry the original request with the new token
              return this.retryRequest(error, newToken)
            }
          } catch (refreshError) {
            this.handleAuthFailure()
          }
        }
        return Promise.reject(error)
      },
    })
  }

  /**
   * Ajoute un intercepteur de requête
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Ajoute un intercepteur de réponse
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
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
   * Supprime le token stocké
   */
  private removeStoredToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(config.authTokenKey)
    localStorage.removeItem(config.authUserKey)
  }

  /**
   * Gère l'échec d'authentification
   */
  private handleAuthFailure(): void {
    this.removeStoredToken()

    // Redirection vers la page de login
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  /**
   * Refresh le token d'accès
   */
  private async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performRefresh()

    try {
      const token = await this.refreshPromise
      return token
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  /**
   * Effectue le refresh du token
   */
  private async performRefresh(): Promise<string | null> {
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
      this.setStoredToken(data.accessToken)
      return data.accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  /**
   * Retry une requête avec un nouveau token
   */
  private async retryRequest(originalError: ApiError, newToken: string): Promise<never> {
    // Cette implémentation dépend du contexte de l'erreur originale
    // Pour l'instant, on rejette l'erreur et laisse le composant refaire la requête
    throw originalError
  }

  /**
   * Applique les intercepteurs de requête
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = { ...config }

    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig)
    }

    return processedConfig
  }

  /**
   * Applique les intercepteurs de réponse
   */
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let processedResponse = response

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onFulfilled) {
        processedResponse = await interceptor.onFulfilled(processedResponse)
      }
    }

    return processedResponse
  }

  /**
   * Gère les erreurs avec les intercepteurs
   */
  private async handleResponseError(error: ApiError): Promise<never> {
    let processedError = error

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onRejected) {
        try {
          processedError = await interceptor.onRejected(processedError)
        } catch (handledError) {
          throw handledError
        }
      }
    }

    throw processedError
  }

  /**
   * Exécute une requête HTTP
   */
  async request<T>(config: RequestConfig): Promise<T> {
    try {
      // Application des intercepteurs de requête
      const processedConfig = await this.applyRequestInterceptors(config)

      // Construction de l'URL
      const url = processedConfig.url.startsWith('http')
        ? processedConfig.url
        : `${this.baseURL}${processedConfig.url}`

      // Construction des paramètres de requête
      const requestInit: RequestInit = {
        method: processedConfig.method,
        headers: processedConfig.headers,
        credentials: 'include',
        signal: AbortSignal.timeout(
          config.method === 'GET'
            ? config.requestTimeout || config.authTimeout || 30000
            : config.requestTimeout || 30000,
        ),
      }

      // Ajout du body pour les requêtes POST/PUT/PATCH
      if (processedConfig.data && ['POST', 'PUT', 'PATCH'].includes(processedConfig.method)) {
        requestInit.body = JSON.stringify(processedConfig.data)
      }

      // Ajout des paramètres d'URL pour GET
      const urlWithParams = this.buildUrlWithParams(url, processedConfig.params)

      // Logging en mode debug
      if (config.enableDebug) {
        console.log(`[API Request] ${processedConfig.method} ${urlWithParams}`, {
          headers: processedConfig.headers,
          data: processedConfig.data,
        })
      }

      // Exécution de la requête
      const response = await fetch(urlWithParams, requestInit)

      // Application des intercepteurs de réponse
      const processedResponse = await this.applyResponseInterceptors(response)

      // Gestion des erreurs HTTP
      if (!processedResponse.ok) {
        await this.handleHttpError(processedResponse)
      }

      // Parse de la réponse JSON
      const data = await processedResponse.json()

      if (config.enableDebug) {
        console.log(`[API Response] ${processedConfig.method} ${urlWithParams}`, data)
      }

      return data
    } catch (error) {
      // Gestion des erreurs avec intercepteurs
      if (this.isApiError(error)) {
        await this.handleResponseError(error)
        throw error // Cette ligne ne sera jamais atteinte car handleResponseError throw
      }

      // Conversion des erreurs natives en ApiError
      const apiError: ApiError = this.createApiErrorFromNative(error)
      await this.handleResponseError(apiError)
      throw apiError // Cette ligne ne sera jamais atteinte car handleResponseError throw
    }
  }

  /**
   * Gère les erreurs HTTP
   */
  private async handleHttpError(response: Response): Promise<never> {
    let errorData

    try {
      errorData = await response.json()
    } catch {
      errorData = { message: 'Erreur inconnue du serveur' }
    }

    const apiError: ApiError = {
      success: false,
      error: {
        code: response.status,
        message: errorData.message || `Erreur HTTP ${response.status}`,
        details: errorData.details || errorData.error,
      },
      timestamp: new Date().toISOString(),
    }

    throw apiError
  }

  /**
   * Vérifie si une erreur est une ApiError
   */
  private isApiError(error: any): error is ApiError {
    return error && typeof error === 'object' && 'success' in error && error.success === false
  }

  /**
   * Crée une ApiError à partir d'une erreur native
   */
  private createApiErrorFromNative(error: any): ApiError {
    return {
      success: false,
      error: {
        code: 0,
        message: error.message || 'Erreur de réseau ou timeout',
        details: error.name || 'NetworkError',
      },
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Construit une URL avec des paramètres
   */
  private buildUrlWithParams(url: string, params?: Record<string, string | number>): string {
    if (!params) return url

    const urlObj = new URL(url)
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, String(value))
    })

    return urlObj.toString()
  }

  /**
   * Méthodes HTTP courtes
   */
  async get<T>(url: string, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      requireAuth: true,
    })
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      requireAuth: true,
    })
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      requireAuth: true,
    })
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      requireAuth: true,
    })
  }

  async delete<T>(url: string): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url,
      requireAuth: true,
    })
  }

  /**
   * Méthodes publiques (sans authentification)
   */
  async getPublic<T>(url: string, params?: Record<string, string | number>): Promise<T> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      requireAuth: false,
    })
  }

  async postPublic<T>(url: string, data?: unknown): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      requireAuth: false,
    })
  }
}

// Instance globale du client API
export const apiClient = new ApiClient(config.apiUrl)

// Export des méthodes pour faciliter l'utilisation
export const { get, post, put, patch, delete: del, getPublic, postPublic } = apiClient
