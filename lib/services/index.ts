// ======================================================================
// 🎯 SERVICES API - Export centralisé CESIZen
// ======================================================================

// Export des services
export * from './auth.service'
export * from './questionnaire.service'
export * from './diagnostic.service'
export * from './admin.service'

// Export du client API pour usage avancé
export {
  apiClient,
  get,
  post,
  put,
  patch,
  del as delete,
  getPublic,
  postPublic,
} from '../api-client-v2'

// Export des utilitaires de configuration
export { config, validateConfig } from '../config'
