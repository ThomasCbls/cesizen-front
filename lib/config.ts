// ======================================================================
// 🔧 CONFIGURATION ENVIRONNEMENT - CESIZen
// ======================================================================

/**
 * Configuration centralisée des variables d'environnement
 * avec validation et typage strict
 */

interface EnvConfig {
  // API Configuration
  apiUrl: string

  // Authentication
  authTokenKey: string
  authUserKey: string
  jwtExpiryBuffer: number

  // Timeouts
  requestTimeout: number
  authTimeout: number

  // Pagination
  defaultPageSize: number
  maxPageSize: number

  // Features
  enableDebug: boolean
  enableConsoleLogs: boolean

  // Environment
  environment: 'development' | 'production' | 'staging'
}

/**
 * Valide et parse une variable d'environnement
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

/**
 * Parse une variable d'environnement en nombre
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key]

  if (!value) return defaultValue

  const parsed = parseInt(value, 10)

  if (isNaN(parsed)) {
    throw new Error(`Invalid number for environment variable ${key}: ${value}`)
  }

  return parsed
}

/**
 * Parse une variable d'environnement en booléen
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]

  if (!value) return defaultValue

  return value.toLowerCase() === 'true'
}

/**
 * Configuration globale de l'application
 */
export const config: EnvConfig = {
  // API Configuration
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3001'),

  // Authentication
  authTokenKey: getEnvVar('NEXT_PUBLIC_AUTH_TOKEN_KEY', 'cesizen_access_token'),
  authUserKey: getEnvVar('NEXT_PUBLIC_AUTH_USER_KEY', 'cesizen_user'),
  jwtExpiryBuffer: getEnvNumber('NEXT_PUBLIC_JWT_EXPIRY_BUFFER', 300),

  // Timeouts (en millisecondes)
  requestTimeout: getEnvNumber('NEXT_PUBLIC_REQUEST_TIMEOUT', 10000),
  authTimeout: getEnvNumber('NEXT_PUBLIC_AUTH_TIMEOUT', 30000),

  // Pagination
  defaultPageSize: getEnvNumber('NEXT_PUBLIC_DEFAULT_PAGE_SIZE', 10),
  maxPageSize: getEnvNumber('NEXT_PUBLIC_MAX_PAGE_SIZE', 50),

  // Features flags
  enableDebug: getEnvBoolean('NEXT_PUBLIC_ENABLE_DEBUG', false),
  enableConsoleLogs: getEnvBoolean('NEXT_PUBLIC_ENABLE_CONSOLE_LOGS', false),

  // Environment
  environment: getEnvVar('NEXT_PUBLIC_ENVIRONMENT', 'production') as EnvConfig['environment'],
}

/**
 * Valide la configuration au démarrage de l'application
 */
export function validateConfig(): void {
  const requiredVars = ['NEXT_PUBLIC_API_URL']

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`)
    }
  }

  // Validation de l'URL API
  try {
    new URL(config.apiUrl)
  } catch {
    throw new Error(`Invalid API URL: ${config.apiUrl}`)
  }

  // Log de la configuration en mode debug
  if (config.enableDebug) {
    console.log('🔧 Configuration loaded:', {
      environment: config.environment,
      apiUrl: config.apiUrl,
      timeouts: {
        request: config.requestTimeout,
        auth: config.authTimeout,
      },
      pagination: {
        defaultPageSize: config.defaultPageSize,
        maxPageSize: config.maxPageSize,
      },
    })
  }
}

// Validation automatique en mode client
if (typeof window !== 'undefined') {
  validateConfig()
}
