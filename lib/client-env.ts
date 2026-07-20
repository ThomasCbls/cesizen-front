// 🌍 VARIABLES D'ENVIRONNEMENT - Côté Client
// Pour accéder aux variables côté client, utilisez ce fichier

// Ces variables sont injectées par Next.js à build time
// Elles remplacent les ${...} literals dans le code compilé
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
export const AUTH_TOKEN_KEY = process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'cesizen_access_token'
export const AUTH_USER_KEY = process.env.NEXT_PUBLIC_AUTH_USER_KEY || 'cesizen_user'
export const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'
export const ENABLE_DEBUG = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true'
