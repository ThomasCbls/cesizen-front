import { apiClient } from '@/lib/api-client-v2'
import { QuestionnaireService } from '@/lib/services/questionnaire.service'
import type { Questionnaire, QuestionnaireDetailResponse, QuestionnaireListResponse } from '@/types'

jest.mock('@/lib/api-client-v2', () => ({
  apiClient: {
    getPublic: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

const makeQuestionnaire = (overrides: Partial<Questionnaire> = {}): Questionnaire => ({
  id: 'q-1',
  title: 'Questionnaire de stress',
  description: 'Évaluation du niveau de stress',
  category: 'STRESS',
  isActive: true,
  questions: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

describe('QuestionnaireService', () => {
  afterEach(() => jest.clearAllMocks())

  // ─── getQuestionnaires ────────────────────────────────────────────────────

  describe('getQuestionnaires', () => {
    it('appelle le bon endpoint et retourne la liste', async () => {
      const response: QuestionnaireListResponse = {
        questionnaires: [makeQuestionnaire()],
        total: 1,
      }
      mockApiClient.getPublic.mockResolvedValue(response)

      const result = await QuestionnaireService.getQuestionnaires()

      expect(mockApiClient.getPublic).toHaveBeenCalledWith('/questionnaires', undefined)
      expect(result.questionnaires).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('transmet les params de pagination', async () => {
      const response: QuestionnaireListResponse = { questionnaires: [], total: 0 }
      mockApiClient.getPublic.mockResolvedValue(response)

      await QuestionnaireService.getQuestionnaires({ limit: 5, page: 2 })

      expect(mockApiClient.getPublic).toHaveBeenCalledWith('/questionnaires', { limit: 5, page: 2 })
    })
  })

  // ─── getQuestionnaireById ─────────────────────────────────────────────────

  describe('getQuestionnaireById', () => {
    it("appelle le bon endpoint avec l'ID fourni", async () => {
      const detail: QuestionnaireDetailResponse = { questionnaire: makeQuestionnaire() }
      mockApiClient.getPublic.mockResolvedValue(detail)

      const result = await QuestionnaireService.getQuestionnaireById('q-42')

      expect(mockApiClient.getPublic).toHaveBeenCalledWith('/questionnaires/q-42')
      expect(result.questionnaire.id).toBe('q-1')
    })
  })

  // ─── getStressQuestionnaires ──────────────────────────────────────────────

  describe('getStressQuestionnaires', () => {
    it('appelle le endpoint avec la catégorie STRESS', async () => {
      const response: QuestionnaireListResponse = {
        questionnaires: [makeQuestionnaire()],
        total: 1,
      }
      mockApiClient.getPublic.mockResolvedValue(response)

      await QuestionnaireService.getStressQuestionnaires()

      expect(mockApiClient.getPublic).toHaveBeenCalledWith('/questionnaires', {
        category: 'STRESS',
      })
    })
  })

  // ─── getMainStressQuestionnaire ───────────────────────────────────────────

  describe('getMainStressQuestionnaire', () => {
    it('retourne le questionnaire complet du premier résultat', async () => {
      const listResponse: QuestionnaireListResponse = {
        questionnaires: [makeQuestionnaire({ id: 'q-main' })],
        total: 1,
      }
      const detailResponse: QuestionnaireDetailResponse = {
        questionnaire: makeQuestionnaire({ id: 'q-main', title: 'Questionnaire Principal' }),
      }
      mockApiClient.getPublic
        .mockResolvedValueOnce(listResponse)
        .mockResolvedValueOnce(detailResponse)

      const result = await QuestionnaireService.getMainStressQuestionnaire()

      expect(result.title).toBe('Questionnaire Principal')
    })

    it('lève une erreur si aucun questionnaire de stress disponible', async () => {
      const emptyList: QuestionnaireListResponse = { questionnaires: [], total: 0 }
      mockApiClient.getPublic.mockResolvedValue(emptyList)

      await expect(QuestionnaireService.getMainStressQuestionnaire()).rejects.toThrow(
        'Aucun questionnaire de stress disponible',
      )
    })
  })
})
