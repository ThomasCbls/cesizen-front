import { apiClient } from '@/lib/api-client-v2'
import { DiagnosticService } from '@/lib/services/diagnostic.service'
import type {
  DiagnosticDetailResponse,
  DiagnosticHistoryItem,
  DiagnosticHistoryResponse,
  DiagnosticResult,
  Questionnaire,
} from '@/types'

jest.mock('@/lib/api-client-v2', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

const makeResult = (overrides: Partial<DiagnosticResult> = {}): DiagnosticResult => ({
  totalScore: 250,
  maxScore: 500,
  percentage: 50,
  level: 'MODERATE',
  interpretation: 'Stress modéré',
  recommendations: [],
  ...overrides,
})

const makeQuestionnaire = (): Questionnaire => ({
  id: 'q-1',
  title: 'Questionnaire 1',
  description: 'Test',
  category: 'STRESS',
  isActive: true,
  questions: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
})

const makeDiagnosticSummary = (
  overrides: Partial<DiagnosticHistoryItem> = {},
): DiagnosticHistoryItem => ({
  id: 'diag-1',
  questionnaireId: 'q-1',
  questionnaireTitle: 'Questionnaire 1',
  submittedAt: '2025-06-01T10:00:00.000Z',
  result: makeResult(),
  ...overrides,
})

describe('DiagnosticService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  // ─── getDiagnosticHistory ─────────────────────────────────────────────────

  describe('getDiagnosticHistory', () => {
    it('appelle le bon endpoint et retourne les diagnostics', async () => {
      const response: DiagnosticHistoryResponse = {
        diagnostics: [makeDiagnosticSummary()],
        total: 1,
        page: 1,
        limit: 10,
      }
      mockApiClient.get.mockResolvedValue(response)

      const result = await DiagnosticService.getDiagnosticHistory()

      expect(mockApiClient.get).toHaveBeenCalledWith('/stress-diagnostics/history', undefined)
      expect(result.diagnostics).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  // ─── getDiagnosticDetail ──────────────────────────────────────────────────

  describe('getDiagnosticDetail', () => {
    it("appelle le bon endpoint avec l'id du diagnostic", async () => {
      const detail: DiagnosticDetailResponse = {
        id: 'diag-42',
        questionnaireId: 'q-1',
        questionnaireTitle: 'Questionnaire 1',
        submittedAt: '2025-06-01T10:00:00.000Z',
        result: makeResult({ totalScore: 180, level: 'LOW' }),
        questionnaire: makeQuestionnaire(),
        answers: [],
      }
      mockApiClient.get.mockResolvedValue(detail)

      const result = await DiagnosticService.getDiagnosticDetail('diag-42')

      expect(mockApiClient.get).toHaveBeenCalledWith('/stress-diagnostics/history/diag-42')
      expect(result.id).toBe('diag-42')
      expect(result.result.level).toBe('LOW')
    })
  })

  // ─── getLatestDiagnostic ──────────────────────────────────────────────────

  describe('getLatestDiagnostic', () => {
    it("retourne null si l'historique est vide", async () => {
      const emptyHistory: DiagnosticHistoryResponse = {
        diagnostics: [],
        total: 0,
        page: 1,
        limit: 1,
      }
      mockApiClient.get.mockResolvedValue(emptyHistory)

      const result = await DiagnosticService.getLatestDiagnostic()

      expect(result).toBeNull()
    })

    it("retourne le detail du premier diagnostic si l'historique n'est pas vide", async () => {
      const history: DiagnosticHistoryResponse = {
        diagnostics: [makeDiagnosticSummary({ id: 'diag-last' })],
        total: 1,
        page: 1,
        limit: 1,
      }
      const detail: DiagnosticDetailResponse = {
        id: 'diag-last',
        questionnaireId: 'q-1',
        questionnaireTitle: 'Questionnaire 1',
        submittedAt: '2025-06-01T10:00:00.000Z',
        result: makeResult({
          totalScore: 300,
          level: 'HIGH',
          interpretation: 'Stress élevé',
          recommendations: ['Consultez un professionnel'],
        }),
        questionnaire: makeQuestionnaire(),
        answers: [],
      }
      // Premier appel → history, deuxième → detail
      mockApiClient.get.mockResolvedValueOnce(history).mockResolvedValueOnce(detail)

      const result = await DiagnosticService.getLatestDiagnostic()

      expect(result).not.toBeNull()
      expect(result?.id).toBe('diag-last')
      expect(result?.result.level).toBe('HIGH')
    })

    it('retourne null si une erreur réseau survient', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      mockApiClient.get.mockRejectedValue(new Error('Network error'))

      const result = await DiagnosticService.getLatestDiagnostic()

      expect(result).toBeNull()
      jest.restoreAllMocks()
    })
  })

  // ─── getDiagnosticStats ───────────────────────────────────────────────────

  describe('getDiagnosticStats', () => {
    it('calcule correctement la moyenne et la distribution', async () => {
      const history: DiagnosticHistoryResponse = {
        diagnostics: [
          makeDiagnosticSummary({
            id: 'd1',
            result: makeResult({ totalScore: 200, level: 'MODERATE' }),
          }),
          makeDiagnosticSummary({
            id: 'd2',
            result: makeResult({ totalScore: 100, level: 'LOW' }),
          }),
          makeDiagnosticSummary({
            id: 'd3',
            result: makeResult({ totalScore: 300, level: 'MODERATE' }),
          }),
        ],
        total: 3,
        page: 1,
        limit: 100,
      }
      mockApiClient.get.mockResolvedValue(history)

      const stats = await DiagnosticService.getDiagnosticStats()

      expect(stats.totalDiagnostics).toBe(3)
      expect(stats.averageScore).toBeCloseTo(200)
      expect(stats.levelDistribution['MODERATE']).toBe(2)
      expect(stats.levelDistribution['LOW']).toBe(1)
    })

    it("retourne des zeros si l'historique est vide", async () => {
      const emptyHistory: DiagnosticHistoryResponse = {
        diagnostics: [],
        total: 0,
        page: 1,
        limit: 100,
      }
      mockApiClient.get.mockResolvedValue(emptyHistory)

      const stats = await DiagnosticService.getDiagnosticStats()

      expect(stats.totalDiagnostics).toBe(0)
      expect(stats.averageScore).toBe(0)
      expect(stats.levelDistribution).toEqual({})
    })

    it("retourne des zeros en cas d'erreur", async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      mockApiClient.get.mockRejectedValue(new Error('Erreur serveur'))

      const stats = await DiagnosticService.getDiagnosticStats()

      expect(stats.totalDiagnostics).toBe(0)
      expect(stats.averageScore).toBe(0)
      jest.restoreAllMocks()
    })
  })
})
