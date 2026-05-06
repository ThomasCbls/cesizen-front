// 🎯 SERVICES API - Export centralisé CESIZen

// Export des services
export * from './admin.service'
export * from './auth.service'
export * from './diagnostic.service'
export * from './questionnaire.service'

// Export du client API pour usage avancé
export {
  apiClient,
  del as delete,
  get,
  getPublic,
  patch,
  post,
  postPublic,
  put,
} from '../api-client-v2'

// Export des utilitaires de configuration
export { config, validateConfig } from '../config'
