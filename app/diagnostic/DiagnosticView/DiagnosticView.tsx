'use client'

// ======================================================================
// 🧠 DIAGNOSTIC VIEW - Composant principal du diagnostic de stress
// ======================================================================

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
} from '@mui/material'
import { ArrowLeft, TrendingUp } from 'lucide-react'

import { QuestionnaireService, DiagnosticService } from '@/lib/services'
import type { Questionnaire, DiagnosticSubmissionAnswer } from '@/types'
import type { DiagnosticResult as DiagnosticResultType } from '@/types'

import QuestionnaireForm from '../components/QuestionnaireForm'
import DiagnosticResult from '../components/DiagnosticResult'
import LoadingSpinner from '../components/LoadingSpinner'

// États du diagnostic
type DiagnosticStep = 'loading' | 'questionnaire' | 'submitting' | 'result' | 'error'

const STEPS = ['Questionnaire', 'Soumission', 'Résultat']

export default function DiagnosticView() {
  const router = useRouter()

  // État du composant
  const [currentStep, setCurrentStep] = useState<DiagnosticStep>('loading')
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [answers, setAnswers] = useState<DiagnosticSubmissionAnswer[]>([])
  const [result, setResult] = useState<DiagnosticResultType | null>(null)
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  // ======================================================================
  // CHARGEMENT INITIAL
  // ======================================================================

  useEffect(() => {
    loadQuestionnaire()
  }, [])

  const loadQuestionnaire = async () => {
    try {
      setCurrentStep('loading')
      setError(null)

      const questionnaireData = await QuestionnaireService.getMainStressQuestionnaire()
      setQuestionnaire(questionnaireData)
      setCurrentStep('questionnaire')
    } catch (error: unknown) {
      console.error('Erreur chargement questionnaire:', error)
      setError(
        error && typeof error === 'object' && 'error' in error
          ? (error as { error?: { message?: string } }).error?.message || 'Erreur de serveur'
          : 'Impossible de charger le questionnaire. Veuillez réessayer.',
      )
      setCurrentStep('error')
    }
  }

  // ======================================================================
  // GESTION DES RÉPONSES
  // ======================================================================

  const handleAnswerChange = (questionId: string, optionId: string, score: number) => {
    setAnswers((prev) => {
      const newAnswers = prev.filter((a) => a.questionId !== questionId)
      newAnswers.push({ questionId, optionId, score })

      // Mise à jour du progrès
      const progress = Math.round(
        (newAnswers.length / (questionnaire?.questions.length || 1)) * 100,
      )
      setProgress(progress)

      return newAnswers
    })
  }

  // ======================================================================
  // SOUMISSION DU DIAGNOSTIC
  // ======================================================================

  const handleSubmitDiagnostic = async () => {
    if (!questionnaire || answers.length !== questionnaire.questions.length) {
      setError('Veuillez répondre à toutes les questions avant de soumettre.')
      return
    }

    try {
      setCurrentStep('submitting')
      setError(null)

      const submission = { answers }
      const response = await DiagnosticService.submitDiagnostic(questionnaire.id, submission)

      if (response.success) {
        setResult(response.result)
        setDiagnosticId(response.diagnosticId)
        setCurrentStep('result')
      } else {
        throw new Error('Échec de la soumission du diagnostic')
      }
    } catch (error: unknown) {
      console.error('Erreur soumission diagnostic:', error)
      setError(
        error && typeof error === 'object' && 'error' in error
          ? (error as { error?: { message?: string } }).error?.message || 'Erreur de serveur'
          : 'Erreur lors de la soumission. Veuillez réessayer.',
      )
      setCurrentStep('questionnaire')
    }
  }

  // ======================================================================
  // ACTIONS
  // ======================================================================

  const handleRetry = () => {
    setError(null)
    loadQuestionnaire()
  }

  const handleNewDiagnostic = () => {
    setAnswers([])
    setResult(null)
    setDiagnosticId(null)
    setProgress(0)
    setCurrentStep('questionnaire')
  }

  const goToHistory = () => {
    router.push('/history')
  }

  const goToHome = () => {
    router.push('/home')
  }

  // ======================================================================
  // RENDU CONDITIONNEL PAR ÉTAPE
  // ======================================================================

  const renderContent = () => {
    switch (currentStep) {
      case 'loading':
        return <LoadingSpinner message="Chargement du questionnaire..." />

      case 'questionnaire':
        return (
          <QuestionnaireForm
            questionnaire={questionnaire!}
            answers={answers}
            progress={progress}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmitDiagnostic}
            disabled={false}
          />
        )

      case 'submitting':
        return <LoadingSpinner message="Analyse en cours..." />

      case 'result':
        return (
          <DiagnosticResult
            result={result!}
            diagnosticId={diagnosticId!}
            onNewDiagnostic={handleNewDiagnostic}
            onViewHistory={goToHistory}
          />
        )

      case 'error':
        return (
          <Box className="text-center py-8">
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
            <Button variant="contained" onClick={handleRetry}>
              Réessayer
            </Button>
          </Box>
        )

      default:
        return null
    }
  }

  // ======================================================================
  // CALCUL DE L'ÉTAPE ACTIVE
  // ======================================================================

  const getActiveStep = (): number => {
    switch (currentStep) {
      case 'loading':
      case 'questionnaire':
        return 0
      case 'submitting':
        return 1
      case 'result':
        return 2
      default:
        return 0
    }
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

        <Typography variant="h4" className="font-bold mb-2">
          Diagnostic de Stress
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Évaluez votre niveau de stress avec notre questionnaire scientifique
        </Typography>
      </Box>

      {/* Stepper - seulement si pas en erreur */}
      {currentStep !== 'error' && (
        <Paper elevation={1} className="mb-6 p-4">
          <Stepper activeStep={getActiveStep()} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Barre de progrès pour le questionnaire */}
      {currentStep === 'questionnaire' && questionnaire && (
        <Paper elevation={1} className="mb-6 p-4">
          <Box className="flex items-center space-x-4">
            <Typography variant="body2" className="text-gray-600 min-w-0">
              Progrès: {answers.length} / {questionnaire.questions.length} questions
            </Typography>
            <LinearProgress variant="determinate" value={progress} className="flex-1" />
            <Typography variant="body2" className="text-gray-600">
              {progress}%
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Contenu principal */}
      <Paper elevation={2} className="p-6">
        {renderContent()}
      </Paper>

      {/* Actions supplémentaires pour la page résultat */}
      {currentStep === 'result' && (
        <Box className="mt-6 text-center space-x-4">
          <Button variant="outlined" onClick={handleNewDiagnostic} className="mr-4">
            Nouveau Diagnostic
          </Button>
          <Button variant="contained" onClick={goToHistory} startIcon={<TrendingUp />}>
            Voir l'Historique
          </Button>
        </Box>
      )}
    </Container>
  )
}
