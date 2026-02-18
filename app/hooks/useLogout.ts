'use client'

import { apiCall, endpoints } from '@/app/utils/endpoint'
import { useRouter } from 'next/navigation'

export const useLogout = () => {
  const router = useRouter()

  const logout = async () => {
    try {
      // Appel à l'API pour se déconnecter
      await apiCall(endpoints.auth.logout, 'POST')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      // Nettoyer le localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')

      // Recharger la page pour revenir à l'état initial
      window.location.href = '/'
    }
  }

  return { logout }
}
