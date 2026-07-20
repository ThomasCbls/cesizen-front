// 🌐 CLIENT API SIMPLE - CESIZen
// Utilitaire léger basé sur fetch() pour les cas d'usage simples.
// Pour les besoins avancés (intercepteurs, refresh token, typage),
// utilisez le client complet : @/lib/api-client-v2 ou @/lib/services

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * Effectue une requête HTTP vers l'API backend.
 * Inclut automatiquement les cookies (credentials: 'include')
 * et le header Content-Type: application/json.
 *
 * @example
 * // Login
 * const res = await apiFetch('/auth/login', {
 *   method: 'POST',
 *   body: JSON.stringify({ email: 'user@example.com', mot_de_passe: 'password123' }),
 * })
 * const data = await res.json()
 *
 * @example
 * // Récupérer les questionnaires
 * const res = await apiFetch('/questionnaires')
 * const questionnaires = await res.json()
 */
export async function apiFetch(endpoint: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  })
  return res
}

export { API_URL }
