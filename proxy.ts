// 🛡️ MIDDLEWARE PROTECTION ROUTES - CESIZen

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Configuration des routes
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/questionnaires', // Routes publiques des questionnaires
]

const PROTECTED_ROUTES = [
  '/home',
  '/diagnostic',
  '/diagnostic/*',
  '/history',
  '/history/*',
  '/user-setting',
  '/profile',
]

const ADMIN_ROUTES = ['/admin', '/admin/*']

// Headers et clés de configuration
const AUTH_TOKEN_KEY = 'cesizen_access_token'
// const AUTH_USER_KEY = 'cesizen_user' // Variable not used yet

/**
 * Vérifie si une route est publique
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === '/') return pathname === '/'
    if (route.endsWith('*')) {
      const basePath = route.slice(0, -1)
      return pathname.startsWith(basePath)
    }
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}

/**
 * Vérifie si une route est protégée
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    if (route.endsWith('*')) {
      const basePath = route.slice(0, -2)
      return pathname.startsWith(basePath)
    }
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}

/**
 * Vérifie si une route est réservée aux administrateurs
 */
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((route) => {
    if (route.endsWith('*')) {
      const basePath = route.slice(0, -2)
      return pathname.startsWith(basePath)
    }
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}

/**
 * Extrait le token depuis les cookies ou headers
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Essai via les cookies (priorité)
  const tokenFromCookie = request.cookies.get(AUTH_TOKEN_KEY)?.value
  if (tokenFromCookie) return tokenFromCookie

  // Essai via Authorization header
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
function isAuthenticated(request: NextRequest): boolean {
  const token = getTokenFromRequest(request)

  if (!token) return false

  // Pour une vérification plus robuste, on pourrait ici:
  // - Décoder le JWT et vérifier l'expiration
  // - Faire un appel API pour valider le token
  // Pour l'instant, on considère que la présence du token suffit

  return true
}

/**
 * Vérifie si l'utilisateur est explicitement non-administrateur.
 * Retourne false uniquement si le cookie de rôle est présent et différent de 'ADMIN'.
 * Si le cookie est absent (session antérieure à sa mise en place), on laisse
 * passer l'utilisateur : AdminLayout côté client fera la vérification définitive
 * via GET /auth/profile.
 */
function isExplicitlyNotAdmin(request: NextRequest): boolean {
  const userRole = request.cookies.get('cesizen_user_role')?.value
  if (!userRole) return false // rôle inconnu → laisser passer
  return userRole !== 'ADMIN'
}

/**
 * Applique le contrôle d'accès
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorer les ressources statiques
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // fichiers avec extension
  ) {
    return NextResponse.next()
  }

  const authenticated = isAuthenticated(request)

  // Si route publique - pas de contrôle nécessaire
  if (isPublicRoute(pathname)) {
    // Optionnel: rediriger les utilisateurs connectés loin des pages login/register
    if (authenticated && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return NextResponse.next()
  }

  // Si route protégée et utilisateur non authentifié
  if (isProtectedRoute(pathname) && !authenticated) {
    const loginUrl = new URL('/login', request.url)
    // Conserver l'URL de destination pour redirection après login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Si route admin et utilisateur non authentifié ou non admin
  if (isAdminRoute(pathname)) {
    if (!authenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (isExplicitlyNotAdmin(request)) {
      // Rediriger vers la page d'accueil si l'utilisateur est explicitement non-admin
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  // Middleware pour les pages par défaut
  // Si utilisateur authentifié accède à '/', rediriger vers /home
  if (pathname === '/' && authenticated) {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Si utilisateur non authentifié accède à '/', autoriser (page d'accueil publique)
  if (pathname === '/' && !authenticated) {
    return NextResponse.next()
  }

  // Toutes les autres routes passent
  return NextResponse.next()
}

/**
 * Configuration du matcher
 * Définit les chemins sur lesquels le middleware s'applique
 */
export const config = {
  matcher: [
    /*
     * Matcher toutes les routes sauf:
     * - API routes (/api/...)
     * - Next.js internal routes (/_next/...)
     * - Fichiers statiques (avec points dans le nom)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
