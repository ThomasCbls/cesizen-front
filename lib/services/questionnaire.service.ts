// 📋 SERVICE QUESTIONNAIRES - CESIZen

import type {
  PaginationParams,
  Questionnaire,
  QuestionnaireDetailResponse,
  QuestionnaireListResponse,
} from '@/types'
import { apiClient } from '../api-client-v2'

/**
 * Service de gestion des questionnaires
 */
export class QuestionnaireService {
  /**
   * Récupère la liste des questionnaires publics
   */
  static async getQuestionnaires(params?: PaginationParams): Promise<QuestionnaireListResponse> {
    return await apiClient.getPublic<QuestionnaireListResponse>('/questionnaires', params)
  }

  /**
   * Récupère un questionnaire par son ID
   */
  static async getQuestionnaireById(id: string): Promise<QuestionnaireDetailResponse> {
    return await apiClient.getPublic<QuestionnaireDetailResponse>(`/questionnaires/${id}`)
  }

  /**
   * Récupère les questionnaires de stress disponibles
   */
  static async getStressQuestionnaires(
    params?: PaginationParams,
  ): Promise<QuestionnaireListResponse> {
    return await apiClient.getPublic<QuestionnaireListResponse>('/questionnaires', {
      ...params,
      category: 'STRESS',
    })
  }

  /**
   * Récupère le questionnaire de stress principal (pour diagnostic)
   */
  static async getMainStressQuestionnaire(): Promise<Questionnaire> {
    const response = await this.getStressQuestionnaires({ limit: 1 })

    if (response.questionnaires.length === 0) {
      throw new Error('Aucun questionnaire de stress disponible')
    }

    // Récupère les détails complets du premier questionnaire
    const detailResponse = await this.getQuestionnaireById(response.questionnaires[0].id)

    return detailResponse.questionnaire
  }
}
