'use client'

// ======================================================================
// 🔐 AUTH CONTEXT - CESIZen
// ======================================================================

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { AuthService } from '@/lib/services'
import { config } from '@/lib/config'
import type { User, AuthState, LoginRequest, RegisterRequest } from '@/types'

// ======================================================================
// TYPES & INTERFACES
// ======================================================================

interface AuthContextType extends AuthState {
  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }

// ======================================================================
// REDUCER
// ======================================================================

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      }

    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload,
      }

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

// ======================================================================
// CONTEXT
// ======================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ======================================================================
// PROVIDER COMPONENT
// ======================================================================

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ======================================================================
  // STORAGE UTILITIES
  // ======================================================================

  const getStoredToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(config.authTokenKey)
  }, [])

  const getStoredUser = useCallback((): User | null => {
    if (typeof window === 'undefined') return null

    const userJson = localStorage.getItem(config.authUserKey)
    if (!userJson) return null

    try {
      return JSON.parse(userJson)
    } catch (error) {
      console.error('Error parsing stored user:', error)
      return null
    }
  }, [])

  const storeAuth = useCallback((user: User, token: string): void => {
    if (typeof window === 'undefined') return

    localStorage.setItem(config.authTokenKey, token)
    localStorage.setItem(config.authUserKey, JSON.stringify(user))

    // Stocker le rôle dans un cookie pour le middleware
    document.cookie = `cesizen_user_role=${user.role}; path=/; SameSite=Lax`
  }, [])

  const clearStoredAuth = useCallback((): void => {
    if (typeof window === 'undefined') return

    localStorage.removeItem(config.authTokenKey)
    localStorage.removeItem(config.authUserKey)

    // Effacer le cookie du rôle
    document.cookie = 'cesizen_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }, [])

  // ======================================================================
  // ACTIONS
  // ======================================================================

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      try {
        dispatch({ type: 'AUTH_START' })

        const response = await AuthService.login(credentials)

        if (!response.success) {
          throw new Error('Échec de la connexion')
        }

        // Stocker les données d'auth
        storeAuth(response.user, response.accessToken)

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.user,
            token: response.accessToken,
          },
        })
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === 'object' && 'error' in error
            ? (error as { error?: { message?: string }; message?: string }).error?.message ||
              (error as { error?: { message?: string }; message?: string }).message ||
              'Erreur de connexion'
            : 'Erreur de connexion'
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
        throw error
      }
    },
    [storeAuth],
  )

  const register = useCallback(
    async (userData: RegisterRequest): Promise<void> => {
      try {
        dispatch({ type: 'AUTH_START' })

        const response = await AuthService.register(userData)

        if (!response.success) {
          throw new Error("Échec de l'inscription")
        }

        // Stocker les données d'auth
        storeAuth(response.user, response.accessToken)

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.user,
            token: response.accessToken,
          },
        })
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === 'object' && 'error' in error
            ? (error as { error?: { message?: string }; message?: string }).error?.message ||
              (error as { error?: { message?: string }; message?: string }).message ||
              "Erreur d'inscription"
            : "Erreur d'inscription"
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
        throw error
      }
    },
    [storeAuth],
  )

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Tentative de déconnexion côté serveur
      await AuthService.logout()
    } catch (error) {
      // Même si la déconnexion serveur échoue, on nettoie localement
      console.warn('Logout server failed, cleaning locally:', error)
    } finally {
      // Nettoyage local
      clearStoredAuth()
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }, [clearStoredAuth])

  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const storedToken = getStoredToken()
      const storedUser = getStoredUser()

      if (!storedToken || !storedUser) {
        dispatch({ type: 'AUTH_LOGOUT' })
        return
      }

      // Vérifier la validité du token
      const tokenCheck = await AuthService.verifyToken()

      if (!tokenCheck.valid) {
        // Essayer de refresh le token
        try {
          const refreshResponse = await AuthService.refreshToken()
          if (refreshResponse.success) {
            storeAuth(tokenCheck.user || storedUser, refreshResponse.accessToken)
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: tokenCheck.user || storedUser,
                token: refreshResponse.accessToken,
              },
            })
            return
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
        }

        // Si tout échoue, déconnecter
        clearStoredAuth()
        dispatch({ type: 'AUTH_LOGOUT' })
        return
      }

      // Token valide
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: tokenCheck.user || storedUser,
          token: storedToken,
        },
      })
    } catch (error) {
      console.error('Auth refresh failed:', error)
      clearStoredAuth()
      dispatch({ type: 'AUTH_LOGOUT' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [getStoredToken, getStoredUser, storeAuth, clearStoredAuth])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  // ======================================================================
  // INITIALIZATION
  // ======================================================================

  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  // Auto refresh token périodique
  useEffect(() => {
    if (!state.isAuthenticated) return

    const refreshInterval = setInterval(
      () => {
        if (config.enableDebug) {
          console.log('Auto refresh token check...')
        }
        refreshAuth()
      },
      config.jwtExpiryBuffer * 1000 - 60000,
    ) // 1 minute avant expiration

    return () => clearInterval(refreshInterval)
  }, [state.isAuthenticated, refreshAuth])

  // ======================================================================
  // CONTEXT VALUE
  // ======================================================================

  const contextValue: AuthContextType = {
    // State
    ...state,
    // Actions
    login,
    register,
    logout,
    refreshAuth,
    clearError,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// ======================================================================
// HOOK
// ======================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// ======================================================================
// UTILITY HOOKS
// ======================================================================

/**
 * Hook qui garantit que l'utilisateur est authentifié
 * Redirige vers login si non authentifié
 */
export function useRequireAuth(): AuthContextType {
  const auth = useAuth()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }, [auth.isLoading, auth.isAuthenticated])

  return auth
}

/**
 * Hook pour les pages publiques qui redirigent si déjà connecté
 */
export function usePublicRoute(redirectTo: string = '/home'): AuthContextType {
  const auth = useAuth()

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, redirectTo])

  return auth
}
