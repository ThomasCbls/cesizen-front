// ======================================================================
// 🏗️ ROOT LAYOUT - CESIZen
// ======================================================================

import './globals.css'
import { AuthProvider } from '@/contexts'
import { validateConfig } from '@/lib/config'
import type { Metadata } from 'next'

// Validation de la configuration au démarrage
if (typeof window === 'undefined') {
  // Côté serveur seulement
  try {
    validateConfig()
  } catch (error) {
    console.error('Configuration error:', error)
  }
}

export const metadata: Metadata = {
  title: 'CESIZen - Plateforme de Diagnostic de Stress',
  description: "Plateforme dédiée à l'évaluation et au suivi du stress professionnel",
  keywords: ['stress', 'diagnostic', 'bien-être', 'santé mentale'],
  authors: [{ name: 'CESIZen Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
