'use client'

// ======================================================================
// 📈 HISTORIQUE VIEW - Liste des diagnostics utilisateur
// ======================================================================

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material'
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  Eye,
  BarChart3,
  RefreshCcw,
  PlusCircle,
} from 'lucide-react'

import { DiagnosticService } from '@/lib/services'
import { LoadingSpinner } from '@/app/diagnostic/components'
import type { DiagnosticHistoryItem } from '@/types'

// Configuration des niveaux de stress
const levelConfig = {
  LOW: { label: 'Faible', color: 'success', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  MODERATE: {
    label: 'Modéré',
    color: 'warning',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  HIGH: {
    label: 'Élevé',
    color: 'warning',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  SEVERE: { label: 'Sévère', color: 'error', bgColor: 'bg-red-100', textColor: 'text-red-800' },
}

export default function HistoryView() {
  const router = useRouter()

  // État du composant
  const [diagnostics, setDiagnostics] = useState<DiagnosticHistoryItem[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // ======================================================================
  // CHARGEMENT DES DONNÉES
  // ======================================================================

  useEffect(() => {
    loadHistoryData()
  }, [])

  const loadHistoryData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Chargement en parallèle de l'historique et des stats
      const [historyResponse, statsData] = await Promise.all([
        DiagnosticService.getDiagnosticHistory({
          page: 1,
          limit: 20,
          sortBy: 'submittedAt',
          sortOrder: 'desc',
        }),
        DiagnosticService.getDiagnosticStats(),
      ])

      setDiagnostics(historyResponse.diagnostics)
      setStats(statsData)
      setHasMore(historyResponse.diagnostics.length < historyResponse.total)
    } catch (error: any) {
      console.error('Erreur chargement historique:', error)
      setError(error?.error?.message || "Impossible de charger l'historique. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadMoreDiagnostics = async () => {
    try {
      const nextPage = page + 1
      const response = await DiagnosticService.getDiagnosticHistory({
        page: nextPage,
        limit: 20,
        sortBy: 'submittedAt',
        sortOrder: 'desc',
      })

      setDiagnostics((prev) => [...prev, ...response.diagnostics])
      setPage(nextPage)
      setHasMore(diagnostics.length + response.diagnostics.length < response.total)
    } catch (error) {
      console.error('Erreur chargement page suivante:', error)
    }
  }

  // ======================================================================
  // ACTIONS
  // ======================================================================

  const goToHome = () => {
    router.push('/home')
  }

  const goToNewDiagnostic = () => {
    router.push('/diagnostic')
  }

  const viewDiagnosticDetail = (diagnosticId: string) => {
    router.push(`/history/${diagnosticId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ======================================================================
  // RENDU CONDITIONNEL
  // ======================================================================

  if (isLoading) {
    return (
      <Container maxWidth="lg" className="py-6">
        <LoadingSpinner message="Chargement de votre historique..." />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" className="py-6">
        <Alert severity="error" className="mb-6">
          {error}
        </Alert>
        <Button variant="contained" onClick={loadHistoryData}>
          Réessayer
        </Button>
      </Container>
    )
  }

  // ======================================================================
  // RENDU PRINCIPAL
  // ======================================================================

  return (
    <Container maxWidth="lg" className="py-6">
      {/* Header */}
      <Box className="mb-6">
        <Button
          startIcon={<ArrowLeft />}
          onClick={goToHome}
          className="mb-4 text-gray-600"
          variant="text"
        >
          Retour à l'accueil
        </Button>

        <Box className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Typography variant="h4" className="font-bold mb-2">
              Historique des Diagnostics
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Consultez l'évolution de votre niveau de stress
            </Typography>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button startIcon={<RefreshCcw />} onClick={loadHistoryData} variant="outlined">
              Actualiser
            </Button>
            <Button
              startIcon={<PlusCircle />}
              onClick={goToNewDiagnostic}
              variant="contained"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Nouveau Diagnostic
            </Button>
          </div>
        </Box>
      </Box>

      {/* Statistiques */}
      {stats && (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
          gap={3}
          className="mb-6"
        >
          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" className="font-bold text-blue-600">
                {stats.totalDiagnostics}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Diagnostics Réalisés
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" className="font-bold text-green-600">
                {stats.averageScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Score Moyen
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" className="font-bold text-purple-600">
                {Object.keys(stats.levelDistribution).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Niveaux Différents
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <Typography variant="h4" className="font-bold text-orange-600">
                {stats.lastDiagnosticDate
                  ? new Date(stats.lastDiagnosticDate).toLocaleDateString('fr-FR')
                  : 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Dernier Diagnostic
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Liste des diagnostics */}
      {diagnostics.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <Typography variant="h6" className="mb-2">
              Aucun diagnostic réalisé
            </Typography>
            <Typography variant="body1" color="textSecondary" className="mb-6">
              Commencez par réaliser votre premier diagnostic de stress.
            </Typography>
            <Button
              variant="contained"
              onClick={goToNewDiagnostic}
              startIcon={<PlusCircle />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Commencer un Diagnostic
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {diagnostics.map((diagnostic) => {
            const config = levelConfig[diagnostic.result.level]

            return (
              <Card
                key={diagnostic.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => viewDiagnosticDetail(diagnostic.id)}
              >
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    {/* Informations principales */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Typography variant="h6" className="font-semibold">
                          {diagnostic.questionnaireTitle}
                        </Typography>
                        <Chip
                          label={config.label}
                          size="small"
                          className={`${config.bgColor} ${config.textColor}`}
                        />
                      </div>

                      <div className="flex items-center space-x-4 text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <Typography variant="body2">
                            {formatDate(diagnostic.submittedAt)}
                          </Typography>
                        </div>

                        <div className="flex items-center space-x-1">
                          <BarChart3 className="h-4 w-4" />
                          <Typography variant="body2">
                            Score: {diagnostic.result.totalScore}/{diagnostic.result.maxScore}(
                            {diagnostic.result.percentage.toFixed(1)}%)
                          </Typography>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 mt-4 md:mt-0">
                      <Tooltip title="Voir le détail">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation()
                            viewDiagnosticDetail(diagnostic.id)
                          }}
                          className="text-blue-600"
                        >
                          <Eye className="h-5 w-5" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {/* Bouton charger plus */}
          {hasMore && (
            <Box className="text-center pt-4">
              <Button variant="outlined" onClick={loadMoreDiagnostics} startIcon={<TrendingUp />}>
                Charger plus de diagnostics
              </Button>
            </Box>
          )}
        </div>
      )}
    </Container>
  )
}
