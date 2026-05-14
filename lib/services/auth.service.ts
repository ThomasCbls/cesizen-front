// 🔐 SERVICE AUTHENTIFICATION - CESIZen

import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/types'
import { apiClient } from '../api-client-v2'

/**
 * Service d'authentification avec le backend NestJS
 */
export class AuthService {
  /**
   * Normalise le rôle d'un utilisateur en majuscules
   * (le backend peut renvoyer 'admin' ou 'ADMIN' selon la config)
   */
  static normalizeUser(user: User): User {
    return {
      ...user,
      role: user.role ? (user.role.toUpperCase() as User['role']) : user.role,
    }
  }

  /**
   * Connexion utilisateur
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.postPublic<LoginResponse>('/auth/login', credentials)
    return { ...response, user: this.normalizeUser(response.user) }
  }

  /**
   * Inscription utilisateur
   */
  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.postPublic<RegisterResponse>('/auth/register', userData)
    return { ...response, user: this.normalizeUser(response.user) }
  }

  /**
   * Déconnexion utilisateur
   */
  static async logout(): Promise<{ success: boolean }> {
    return await apiClient.post<{ success: boolean }>('/auth/logout')
  }

  /**
   * Refresh du token d'accès
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    return await apiClient.postPublic<RefreshTokenResponse>('/auth/refresh')
  }

  /**
   * Récupère le profil utilisateur actuel
   */
  static async getProfile(): Promise<User> {
    const user = await apiClient.get<User>('/auth/profile')
    return this.normalizeUser(user)
  }

  /**
   * Vérifie la validité du token actuel
   */
  static async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const user = await this.getProfile()
      return { valid: true, user }
    } catch {
      return { valid: false }
    }
  }
}
