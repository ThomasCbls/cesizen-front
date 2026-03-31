// ======================================================================
// 🎯 TYPES INDEX - Export centralisé des types CESIZen
// ======================================================================

// API Types
export * from './api'

// Ré-export des types utilisés fréquemment
export type {
  User,
  LoginRequest,
  LoginResponse,
  Questionnaire,
  DiagnosticResult,
  DiagnosticSubmissionRequest,
  DiagnosticHistoryItem,
  AuthState,
  LoadingState,
  ApiResponse,
  ApiError,
} from './api'
