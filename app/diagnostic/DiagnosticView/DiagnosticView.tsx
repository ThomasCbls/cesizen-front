'use client'

import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  LinearProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { DiagnosticService, QuestionnaireService } from '@/lib/services'
import type {
  DiagnosticResult as DiagnosticResultType,
  DiagnosticSubmissionAnswer,
  Questionnaire,
} from '@/types'

import DiagnosticResult from '../components/DiagnosticResult'
import LoadingSpinner from '../components/LoadingSpinner'
import QuestionnaireForm from '../components/QuestionnaireForm'

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

  return (
    <Container maxWidth="lg" className="py-6">
      {/* Header */}
      <Box className="mb-6">
        <Button startIcon={<ArrowLeft />} onClick={goToHome} variant="text">
          Retour à l&apos; accueil
        </Button>

        <Typography variant="h4" color="textPrimary">
          Diagnostic de Stress
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Évaluez votre niveau de stress avec notre questionnaire scientifique
        </Typography>
      </Box>

      {/* Stepper - seulement si pas en erreur */}
      {currentStep !== 'error' && (
        <Card
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3, p: 2 }}
        >
          <Stepper activeStep={getActiveStep()} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Card>
      )}

      {/* Barre de progrès pour le questionnaire */}
      {currentStep === 'questionnaire' && questionnaire && (
        <Card
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3, p: 2 }}
        >
          <Box className="flex items-center space-x-4">
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
              <Typography variant="body2" className="text-gray-600 min-w-0">
                Progrès: {answers.length} / {questionnaire.questions.length} questions
              </Typography>
              <LinearProgress variant="determinate" value={progress} className="flex-1" />
              <Typography variant="body2" className="text-gray-600">
                {progress}%
              </Typography>
            </Stack>
          </Box>
        </Card>
      )}

      {/* Contenu principal */}
      <Card
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}
      >
        {renderContent()}
      </Card>
    </Container>
  )
}
