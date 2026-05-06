export interface User {
  id: string
  email: string
  prenom: string
  nom: string
  role?: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface RegisterRequest {
  prenom: string
  nom: string
  email: string
  mot_de_passe: string
}

export interface RegisterResponse {
  access_token: string
  user: User
}

export interface RefreshTokenResponse {
  access_token: string
}

export interface QuestionOption {
  id: string
  text: string
  score: number
}

export interface Question {
  id: string
  text: string
  order: number
  options: QuestionOption[]
}

export interface Questionnaire {
  id: string
  title: string
  description: string
  category: 'STRESS' | 'ANXIETY' | 'BURNOUT'
  isActive: boolean
  questions: Question[]
  createdAt: string
  updatedAt: string
}

export interface QuestionnaireListResponse {
  questionnaires: Omit<Questionnaire, 'questions'>[]
  total: number
}

export interface QuestionnaireDetailResponse {
  questionnaire: Questionnaire
}

export interface DiagnosticSubmissionAnswer {
  questionId: string
  optionId: string
  score: number
}

export interface DiagnosticSubmissionRequest {
  answers: DiagnosticSubmissionAnswer[]
}

export interface DiagnosticResult {
  totalScore: number
  maxScore: number
  percentage: number
  level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE'
  interpretation: string
  recommendations: string[]
}

export interface DiagnosticSubmissionResponse {
  success: boolean
  diagnosticId: string
  result: DiagnosticResult
  submittedAt: string
}

export interface DiagnosticHistoryItem {
  id: string
  questionnaireId: string
  questionnaireTitle: string
  result: DiagnosticResult
  submittedAt: string
}

export interface DiagnosticHistoryResponse {
  diagnostics: DiagnosticHistoryItem[]
  total: number
  page: number
  limit: number
}

export interface DiagnosticDetailResponse extends DiagnosticHistoryItem {
  answers: DiagnosticSubmissionAnswer[]
  questionnaire: Questionnaire
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: {
    code: number
    message: string
    details?: string
  }
  timestamp: string
}

export interface PaginationParams {
  [key: string]: string | number | undefined
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestConfig {
  method: HttpMethod
  url: string
  data?: unknown
  params?: Record<string, string | number | undefined>
  headers?: Record<string, string>
  requireAuth?: boolean
  requestTimeout?: number
  authTimeout?: number
  enableDebug?: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

export interface DiagnosticState {
  currentQuestionnaire: Questionnaire | null
  answers: DiagnosticSubmissionAnswer[]
  result: DiagnosticResult | null
  history: DiagnosticHistoryItem[]
  isLoading: boolean
  error: string | null
}

export interface FormFieldError {
  field: string
  message: string
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
  success: boolean
}

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface AlertMessage {
  type: AlertType
  message: string
  duration?: number
}
