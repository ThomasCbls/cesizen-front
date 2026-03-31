// ======================================================================
// 🏠 PAGE D'ACCUEIL - CESIZen
// ======================================================================

'use client'

import { useAuth } from '@/contexts'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Container,
  Box,
  Alert,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Brain, TrendingUp, Users, Shield } from 'lucide-react'

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Rediriger vers /home si déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/home')
    }
  }, [isAuthenticated, isLoading, router])

  // Affichage de chargement
  if (isLoading) {
    return (
      <Container maxWidth="sm" className="min-h-screen flex items-center justify-center">
        <Box className="text-center">
          <Typography variant="h6">Chargement de CESIZen...</Typography>
        </Box>
      </Container>
    )
  }

  // Page d'accueil pour visiteurs non connectés
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <Container maxWidth="xl">
          <Box className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <Typography variant="h5" className="font-bold text-gray-800">
                CESIZen
              </Typography>
            </div>

            <div className="flex space-x-4">
              <Button
                variant="outlined"
                onClick={() => router.push('/login')}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Connexion
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push('/register')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Inscription
              </Button>
            </div>
          </Box>
        </Container>
      </header>

      {/* Hero Section */}
      <Container maxWidth="lg" className="py-16">
        <Box className="text-center mb-16">
          <Typography variant="h2" className="font-bold text-gray-800 mb-6">
            Évaluez et Maîtrisez
            <span className="text-blue-600"> Votre Stress</span>
          </Typography>
          <Typography variant="h6" className="text-gray-600 mb-8 max-w-2xl mx-auto">
            CESIZen vous accompagne dans l'évaluation de votre niveau de stress professionnel avec
            des diagnostics scientifiques et des recommandations personnalisées.
          </Typography>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/register')}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
            >
              Commencer le Diagnostic
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/questionnaires')}
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3"
            >
              Voir les Questionnaires
            </Button>
          </div>
        </Box>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <Typography variant="h6" className="text-xl font-semibold">
                Diagnostic Scientifique
              </Typography>
            </CardHeader>
            <CardContent>
              <Typography color="textSecondary">
                Questionnaires validés scientifiquement pour une évaluation précise de votre niveau
                de stress.
              </Typography>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <Typography variant="h6" className="text-xl font-semibold">
                Suivi Personnalisé
              </Typography>
            </CardHeader>
            <CardContent>
              <Typography color="textSecondary">
                Historique détaillé de vos évaluations et tendances pour suivre votre évolution dans
                le temps.
              </Typography>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <Typography variant="h6" className="text-xl font-semibold">
                Données Sécurisées
              </Typography>
            </CardHeader>
            <CardContent>
              <Typography color="textSecondary">
                Vos données de santé mentale sont protégées avec les plus hauts standards de
                sécurité.
              </Typography>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Box className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8">
          <Typography variant="h4" className="font-bold text-gray-800 mb-4">
            Prêt à Prendre le Contrôle de Votre Stress ?
          </Typography>
          <Typography variant="body1" className="text-gray-600 mb-6">
            Inscrivez-vous dès maintenant et commencez votre première évaluation.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/register')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
          >
            Commencer Maintenant
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <Container maxWidth="lg">
          <Box className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="h-6 w-6" />
              <Typography variant="h6" className="font-bold">
                CESIZen
              </Typography>
            </div>
            <Typography variant="body2" className="text-gray-400">
              © {new Date().getFullYear()} CESIZen. Tous droits réservés.
            </Typography>
          </Box>
        </Container>
      </footer>
    </div>
  )
}
