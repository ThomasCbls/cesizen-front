'use client'

import { useAuth } from '@/contexts'
import { useEffect } from 'react'

export default function RootPage() {
  const { isAuthenticated, isLoading, user } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // Rediriger selon l'état d'authentification
    if (typeof window !== 'undefined') {
      if (isAuthenticated) {
        // Rediriger vers le tableau de bord approprié selon le rôle
        const destination = user?.role === 'ADMIN' ? '/admin/dashboard' : '/home'
        window.location.href = destination
      } else {
        // Rediriger vers la page de login
        window.location.href = '/login'
      }
    }
  }, [isAuthenticated, isLoading, user])

  // Afficher un loader pendant la vérification de l'authentification
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  )
}
