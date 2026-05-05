// 🏗️ ROOT LAYOUT - CESIZen

import { AuthProvider } from '@/contexts'
import { validateConfig } from '@/lib/config'
import type { Metadata, Viewport } from 'next'
import './globals.css'

// Validation de la configuration au démarrage
if (typeof window === 'undefined') {
  // Côté serveur seulement
  try {
    validateConfig()
  } catch (error) {
    console.error('Configuration error:', error)
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'CESIZen - Plateforme de Diagnostic de Stress',
  description: "Plateforme dédiée à l'évaluation et au suivi du stress professionnel",
  keywords: ['stress', 'diagnostic', 'bien-être', 'santé mentale'],
  authors: [{ name: 'CESIZen Team' }],
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen" style={{ backgroundColor: '#f0f4f8' }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
