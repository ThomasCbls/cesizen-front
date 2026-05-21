'use client'

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Container,
  LinearProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import { ArrowLeft, BrainCircuit, ClipboardList } from 'lucide-react'
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
type DiagnosticStep = 'loading' | 'selection' | 'questionnaire' | 'submitting' | 'result' | 'error'

const STEPS = ['Sélection', 'Questionnaire', 'Résultat']

const CATEGORY_LABELS: Record<string, string> = {
  STRESS: 'Stress',
  ANXIETY: 'Anxiété',
  BURNOUT: 'Burnout',
}

const CATEGORY_COLORS: Record<string, 'warning' | 'error' | 'secondary' | 'default'> = {
  STRESS: 'warning',
  ANXIETY: 'error',
  BURNOUT: 'secondary',
}

export default function DiagnosticView() {
  const router = useRouter()

  // État du composant
  const [currentStep, setCurrentStep] = useState<DiagnosticStep>('loading')
  const [availableQuestionnaires, setAvailableQuestionnaires] = useState<
    Omit<Questionnaire, 'questions'>[]
  >([])
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [answers, setAnswers] = useState<DiagnosticSubmissionAnswer[]>([])
  const [result, setResult] = useState<DiagnosticResultType | null>(null)
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    loadAvailableQuestionnaires()
  }, [])

  const loadAvailableQuestionnaires = async () => {
    try {
      setCurrentStep('loading')
      setError(null)

      const response = await QuestionnaireService.getQuestionnaires({ limit: 50 })
      setAvailableQuestionnaires(response.questionnaires)
      setCurrentStep('selection')
    } catch (error: unknown) {
      console.error('Erreur chargement questionnaires:', error)
      setError('Impossible de charger les questionnaires. Veuillez réessayer.')
      setCurrentStep('error')
    }
  }

  const handleSelectQuestionnaire = async (id: string) => {
    try {
      setCurrentStep('loading')
      setError(null)

      const response = await QuestionnaireService.getQuestionnaireById(id)
      setQuestionnaire(response.questionnaire)
      setAnswers([])
      setProgress(0)
      setCurrentStep('questionnaire')
    } catch (error: unknown) {
      console.error('Erreur chargement questionnaire:', error)
      setError('Impossible de charger le questionnaire. Veuillez réessayer.')
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
    loadAvailableQuestionnaires()
  }

  const handleNewDiagnostic = () => {
    setAnswers([])
    setResult(null)
    setDiagnosticId(null)
    setProgress(0)
    setQuestionnaire(null)
    setCurrentStep('selection')
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
        return <LoadingSpinner message="Chargement..." />

      case 'selection':
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Choisissez un questionnaire
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sélectionnez le diagnostic que vous souhaitez réaliser.
              </Typography>
            </Box>
            {availableQuestionnaires.length === 0 ? (
              <Alert severity="info">Aucun questionnaire disponible pour le moment.</Alert>
            ) : (
              <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))"
                gap={2}
              >
                {availableQuestionnaires.map((q) => (
                  <Card
                    key={q.id}
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: '0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleSelectQuestionnaire(q.id)}
                      sx={{
                        p: 2.5,
                        height: '100%',
                        alignItems: 'flex-start',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Stack spacing={1.5} sx={{ width: '100%' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 36,
                              height: 36,
                              borderRadius: 1.5,
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                              flexShrink: 0,
                            }}
                          >
                            <ClipboardList size={18} />
                          </Box>
                          <Chip
                            label={CATEGORY_LABELS[q.category] ?? q.category}
                            color={CATEGORY_COLORS[q.category] ?? 'default'}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                        <Typography variant="subtitle1" fontWeight={600} lineHeight={1.3}>
                          {q.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {q.description}
                        </Typography>
                      </Stack>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            )}
          </Stack>
        )

      case 'questionnaire':
        return (
          <Stack spacing={2}>
            <Button
              startIcon={<ArrowLeft size={16} />}
              onClick={() => {
                setCurrentStep('selection')
                setQuestionnaire(null)
                setAnswers([])
                setProgress(0)
              }}
              variant="text"
              sx={{ alignSelf: 'flex-start' }}
            >
              Changer de questionnaire
            </Button>
            <QuestionnaireForm
              questionnaire={questionnaire!}
              answers={answers}
              progress={progress}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmitDiagnostic}
              disabled={false}
            />
          </Stack>
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
      case 'selection':
        return 0
      case 'questionnaire':
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
          Retour à l&apos;accueil
        </Button>

        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1 }}>
          <BrainCircuit size={28} />
          <Box>
            <Typography variant="h4" color="textPrimary">
              Diagnostic
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {currentStep === 'selection'
                ? 'Choisissez le questionnaire que vous souhaitez réaliser'
                : questionnaire
                  ? questionnaire.title
                  : 'Évaluez votre bien-être'}
            </Typography>
          </Box>
        </Stack>
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
