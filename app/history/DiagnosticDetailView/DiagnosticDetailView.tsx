'use client'

// ======================================================================
// 🔍 DIAGNOSTIC DETAIL VIEW - Détail d'un diagnostic spécifique
// ======================================================================

import React, { useState, useEffect, useCallback } from 'react'
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  ArrowLeft,
  Calendar,
  BarChart3,
  ChevronDown,
  Target,
  Lightbulb,
  CheckCircle,
} from 'lucide-react'

import { DiagnosticService } from '@/lib/services'
import { LoadingSpinner } from '@/app/diagnostic/components'
import type { DiagnosticDetailResponse } from '@/types'

// Configuration des niveaux
const levelConfig = {
  LOW: {
    label: 'Stress Faible',
    color: 'success',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  MODERATE: {
    label: 'Stress Modéré',
    color: 'warning',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  HIGH: {
    label: 'Stress Élevé',
    color: 'warning',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  SEVERE: {
    label: 'Stress Sévère',
    color: 'error',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
}

interface DiagnosticDetailViewProps {
  diagnosticId: string
}

export default function DiagnosticDetailView({ diagnosticId }: DiagnosticDetailViewProps) {
  const router = useRouter()

  // État du composant
  const [diagnostic, setDiagnostic] = useState<DiagnosticDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ======================================================================
  // CHARGEMENT DES DONNÉES
  // ======================================================================

  const loadDiagnosticDetail = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await DiagnosticService.getDiagnosticDetail(diagnosticId)
      setDiagnostic(response)
    } catch (error: unknown) {
      console.error('Erreur chargement détail diagnostic:', error)
      setError(
        error && typeof error === 'object' && 'error' in error
          ? (error as { error?: { message?: string } }).error?.message || 'Erreur de serveur'
          : 'Impossible de charger le détail du diagnostic. Veuillez réessayer.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [diagnosticId])

  useEffect(() => {
    loadDiagnosticDetail()
  }, [loadDiagnosticDetail])

  // ======================================================================
  // ACTIONS
  // ======================================================================

  const goToHistory = () => {
    router.push('/history')
  }

  const goToNewDiagnostic = () => {
    router.push('/diagnostic')
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
        <LoadingSpinner message="Chargement du diagnostic..." />
      </Container>
    )
  }

  if (error || !diagnostic) {
    return (
      <Container maxWidth="lg" className="py-6">
        <Alert severity="error" className="mb-6">
          {error || 'Diagnostic introuvable'}
        </Alert>
        <Button variant="contained" onClick={goToHistory}>
          Retour à l&apos;historique
        </Button>
      </Container>
    )
  }

  const config = levelConfig[diagnostic.diagnostic.result.level]

  // ======================================================================
  // RENDU PRINCIPAL
  // ======================================================================

  return (
    <Container maxWidth="lg" className="py-6">
      {/* Header */}
      <Box className="mb-6">
        <Button
          startIcon={<ArrowLeft />}
          onClick={goToHistory}
          className="mb-4 text-gray-600"
          variant="text"
        >
          Retour à l'historique
        </Button>

        <Typography variant="h4" className="font-bold mb-2">
          Détail du Diagnostic
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {diagnostic.diagnostic.questionnaireTitle}
        </Typography>
      </Box>

      {/* Informations générales */}
      <Card className="mb-6">
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Score */}
            <div className="text-center">
              <Typography variant="h3" className="font-bold text-blue-600 mb-2">
                {diagnostic.diagnostic.result.totalScore}/{diagnostic.diagnostic.result.maxScore}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Score ({diagnostic.diagnostic.result.percentage.toFixed(1)}%)
              </Typography>
            </div>

            {/* Niveau */}
            <div className="text-center">
              <Chip
                label={config.label}
                className={`${config.bgColor} ${config.textColor} mb-2 px-4 py-1 text-sm font-medium`}
              />
              <Typography variant="body1" color="textSecondary">
                Niveau de Stress
              </Typography>
            </div>

            {/* Date */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <Typography variant="body1">
                  {formatDate(diagnostic.diagnostic.submittedAt)}
                </Typography>
              </div>
              <Typography variant="body1" color="textSecondary">
                Date de Réalisation
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interprétation */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-3">
            Interprétation du Résultat
          </Typography>
          <Alert
            severity={config.color as 'success' | 'info' | 'warning' | 'error'}
            className="mb-4"
          >
            {diagnostic.diagnostic.result.interpretation}
          </Alert>
        </CardContent>
      </Card>

      {/* Recommandations */}
      {diagnostic.diagnostic.result.recommendations &&
        diagnostic.diagnostic.result.recommendations.length > 0 && (
          <Card className="mb-6">
            <CardContent>
              <Box className="flex items-center space-x-2 mb-4">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <Typography variant="h6" className="font-semibold">
                  Recommandations Personnalisées
                </Typography>
              </Box>

              <List>
                {diagnostic.diagnostic.result.recommendations.map((recommendation, index) => (
                  <ListItem key={index} className="px-0">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                      <ListItemText primary={recommendation} className="text-gray-700" />
                    </div>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

      {/* Détail des réponses */}
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" className="font-semibold mb-4">
            Détail des Réponses
          </Typography>

          {diagnostic.questionnaire.questions
            .sort((a, b) => a.order - b.order)
            .map((question, index) => {
              const answer = diagnostic.answers.find((a) => a.questionId === question.id)
              const selectedOption = question.options.find((opt) => opt.id === answer?.optionId)

              return (
                <Accordion key={question.id}>
                  <AccordionSummary expandIcon={<ChevronDown />}>
                    <Box className="flex items-center space-x-3 w-full">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <Typography className="flex-1">
                        Question {index + 1}: {question.text.substring(0, 80)}...
                      </Typography>
                      <Chip size="small" label={`${answer?.score || 0} pts`} variant="outlined" />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div className="space-y-3">
                      <Typography variant="body1" className="font-medium">
                        {question.text}
                      </Typography>

                      <Divider />

                      <div>
                        <Typography variant="body2" color="textSecondary" className="mb-2">
                          Réponse sélectionnée:
                        </Typography>
                        {selectedOption ? (
                          <Alert severity="info">
                            <strong>{selectedOption.text}</strong>({selectedOption.score} points)
                          </Alert>
                        ) : (
                          <Alert severity="warning">Aucune réponse trouvée</Alert>
                        )}
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>
              )
            })}
        </CardContent>
      </Card>

      {/* Actions */}
      <Box className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outlined"
          onClick={goToHistory}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          Retour à l'Historique
        </Button>
        <Button
          variant="contained"
          onClick={goToNewDiagnostic}
          startIcon={<BarChart3 />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Nouveau Diagnostic
        </Button>
      </Box>
    </Container>
  )
}
