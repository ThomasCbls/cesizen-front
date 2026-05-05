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
   * Connexion utilisateur
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    return await apiClient.postPublic<LoginResponse>('/auth/login', credentials)
  }

  /**
   * Inscription utilisateur
   */
  static async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return await apiClient.postPublic<RegisterResponse>('/utilisateurs', userData)
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
    return await apiClient.get<User>('/auth/profile')
  }

  /**
   * Vérifie la validité du token actuel
   */
  static async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const user = await this.getProfile()
      return { valid: true, user }
    } catch (error) {
      return { valid: false }
    }
  }
}
