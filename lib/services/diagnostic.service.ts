// 🧠 SERVICE DIAGNOSTIC STRESS - CESIZen

import type {
  DiagnosticDetailResponse,
  DiagnosticHistoryResponse,
  DiagnosticSubmissionRequest,
  DiagnosticSubmissionResponse,
  PaginationParams,
} from '@/types'
import { apiClient } from '../api-client-v2'

/**
 * Service de gestion des diagnostics de stress
 */
export class DiagnosticService {
  /**
   * Soumet un nouveau diagnostic de stress
   */
  static async submitDiagnostic(
    questionnaireId: string,
    submission: DiagnosticSubmissionRequest,
  ): Promise<DiagnosticSubmissionResponse> {
    return await apiClient.post<DiagnosticSubmissionResponse>(
      `/stress-diagnostics/questionnaires/${questionnaireId}/submissions`,
      submission,
    )
  }

  /**
   * Récupère l'historique des diagnostics de l'utilisateur
   */
  static async getDiagnosticHistory(params?: PaginationParams): Promise<DiagnosticHistoryResponse> {
    return await apiClient.get<DiagnosticHistoryResponse>('/stress-diagnostics/history', params)
  }

  /**
   * Récupère le détail d'un diagnostic spécifique
   */
  static async getDiagnosticDetail(diagnosticId: string): Promise<DiagnosticDetailResponse> {
    return await apiClient.get<DiagnosticDetailResponse>(
      `/stress-diagnostics/history/${diagnosticId}`,
    )
  }

  /**
   * Récupère le dernier diagnostic réalisé
   */
  static async getLatestDiagnostic(): Promise<DiagnosticDetailResponse | null> {
    try {
      const history = await this.getDiagnosticHistory({
        limit: 1,
      })

      if (history.diagnostics.length === 0) {
        return null
      }

      return await this.getDiagnosticDetail(history.diagnostics[0].id)
    } catch (error) {
      console.error('Erreur lors de la récupération du dernier diagnostic:', error)
      return null
    }
  }

  /**
   * Calcule des statistiques sur l'historique des diagnostics
   */
  static async getDiagnosticStats(): Promise<{
    totalDiagnostics: number
    averageScore: number
    levelDistribution: Record<string, number>
    lastDiagnosticDate?: string
  }> {
    try {
      const history = await this.getDiagnosticHistory({ limit: 100 })

      if (history.diagnostics.length === 0) {
        return {
          totalDiagnostics: 0,
          averageScore: 0,
          levelDistribution: {},
        }
      }

      const totalScore = history.diagnostics.reduce(
        (sum, diagnostic) => sum + diagnostic.result.totalScore,
        0,
      )

      const levelDistribution = history.diagnostics.reduce(
        (dist, diagnostic) => {
          const level = diagnostic.result.level
          dist[level] = (dist[level] || 0) + 1
          return dist
        },
        {} as Record<string, number>,
      )

      return {
        totalDiagnostics: history.diagnostics.length,
        averageScore: totalScore / history.diagnostics.length,
        levelDistribution,
        lastDiagnosticDate: history.diagnostics[0]?.submittedAt,
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      return {
        totalDiagnostics: 0,
        averageScore: 0,
        levelDistribution: {},
      }
    }
  }
}
