'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Typography,
  Stack,
  Box,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Card,
  CardContent,
  Divider,
  Chip,
  Paper,
} from '@mui/material'
import { X, Plus, ClipboardList } from 'lucide-react'
import { QuestionnaireTable, QuestionnaireModal, ConfirmDeleteModal } from '../components'

// Types pour les questionnaires
interface QuestionOption {
  id: string
  text: string
  score: number
}

interface Question {
  id: string
  text: string
  order: number
  options: QuestionOption[]
}

interface Questionnaire {
  id?: string
  title: string
  description: string
  category: 'STRESS' | 'ANXIETY' | 'BURNOUT'
  isActive: boolean
  questions: Question[]
  createdAt?: Date
  updatedAt?: Date
  stats?: {
    totalResponses: number
    avgScore: number
    lastResponseAt?: Date
  }
}

interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

export default function QuestionnaireManagement() {
  // États pour les données
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)

  // États pour les modales
  const [questionnaireModal, setQuestionnaireModal] = useState<{
    open: boolean
    questionnaire?: Questionnaire | null
    loading: boolean
  }>({
    open: false,
    questionnaire: null,
    loading: false,
  })

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    questionnaire?: Questionnaire | null
    loading: boolean
  }>({
    open: false,
    questionnaire: null,
    loading: false,
  })

  const [previewModal, setPreviewModal] = useState<{
    open: boolean
    questionnaire?: Questionnaire | null
  }>({
    open: false,
    questionnaire: null,
  })

  // État pour les notifications
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  })

  const loadQuestionnaires = useCallback(async () => {
    try {
      setLoading(true)

      // Simulation d'appel API - À remplacer par vraie API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Données mockées
      const mockQuestionnaires: Questionnaire[] = [
        {
          id: '1',
          title: 'Échelle de stress perçu (PSS-10)',
          description:
            'Questionnaire standardisé pour mesurer le niveau de stress perçu au cours du dernier mois.',
          category: 'STRESS',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-10'),
          stats: {
            totalResponses: 247,
            avgScore: 16.8,
            lastResponseAt: new Date(),
          },
          questions: [
            {
              id: 'q1',
              text: 'Au cours du dernier mois, combien de fois avez-vous été contrarié(e) par quelque chose qui est arrivé de manière inattendue ?',
              order: 0,
              options: [
                { id: 'o1', text: 'Jamais', score: 0 },
                { id: 'o2', text: 'Presque jamais', score: 1 },
                { id: 'o3', text: 'Parfois', score: 2 },
                { id: 'o4', text: 'Assez souvent', score: 3 },
                { id: 'o5', text: 'Très souvent', score: 4 },
              ],
            },
            {
              id: 'q2',
              text: 'Au cours du dernier mois, combien de fois avez-vous senti que vous étiez incapable de contrôler les choses importantes de votre vie ?',
              order: 1,
              options: [
                { id: 'o6', text: 'Jamais', score: 0 },
                { id: 'o7', text: 'Presque jamais', score: 1 },
                { id: 'o8', text: 'Parfois', score: 2 },
                { id: 'o9', text: 'Assez souvent', score: 3 },
                { id: 'o10', text: 'Très souvent', score: 4 },
              ],
            },
          ],
        },
        {
          id: '2',
          title: 'Inventaire de Burnout de Maslach (MBI)',
          description: "Questionnaire de référence pour évaluer l'épuisement professionnel.",
          category: 'BURNOUT',
          isActive: true,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-25'),
          stats: {
            totalResponses: 89,
            avgScore: 22.4,
            lastResponseAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          questions: [
            {
              id: 'q3',
              text: 'Je me sens émotionnellement vidé(e) par mon travail',
              order: 0,
              options: [
                { id: 'o11', text: 'Jamais', score: 0 },
                { id: 'o12', text: 'Quelques fois par an', score: 1 },
                { id: 'o13', text: 'Une fois par mois', score: 2 },
                { id: 'o14', text: 'Quelques fois par mois', score: 3 },
                { id: 'o15', text: 'Une fois par semaine', score: 4 },
                { id: 'o16', text: 'Quelques fois par semaine', score: 5 },
                { id: 'o17', text: 'Chaque jour', score: 6 },
              ],
            },
          ],
        },
        {
          id: '3',
          title: "Questionnaire d'anxiété GAD-7",
          description: 'Outil de dépistage des troubles anxieux généralisés.',
          category: 'ANXIETY',
          isActive: false,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
          questions: [
            {
              id: 'q4',
              text: 'Au cours des 2 dernières semaines, à quelle fréquence avez-vous été dérangé(e) par les problèmes suivants : Se sentir nerveux(se), anxieux(se) ou survolté(e)',
              order: 0,
              options: [
                { id: 'o18', text: 'Pas du tout', score: 0 },
                { id: 'o19', text: 'Plusieurs jours', score: 1 },
                { id: 'o20', text: 'Plus de la moitié des jours', score: 2 },
                { id: 'o21', text: 'Presque tous les jours', score: 3 },
              ],
            },
          ],
        },
      ]

      setQuestionnaires(mockQuestionnaires)
    } catch (error) {
      console.error('Erreur lors du chargement des questionnaires:', error)
      showSnackbar('Erreur lors du chargement des questionnaires', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Charger les questionnaires au montage
  useEffect(() => {
    loadQuestionnaires()
  }, [loadQuestionnaires])

  const showSnackbar = (message: string, severity: SnackbarState['severity']) => {
    setSnackbar({ open: true, message, severity })
  }

  // Actions questionnaire
  const handleToggleActive = async (questionnaireId: string, isActive: boolean) => {
    try {
      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setQuestionnaires((prev) =>
        prev.map((questionnaire) =>
          questionnaire.id === questionnaireId ? { ...questionnaire, isActive } : questionnaire,
        ),
      )

      showSnackbar(`Questionnaire ${isActive ? 'activé' : 'désactivé'} avec succès`, 'success')
    } catch {
      showSnackbar('Erreur lors de la mise à jour du statut', 'error')
    }
  }

  const handleCreateQuestionnaire = () => {
    setQuestionnaireModal({
      open: true,
      questionnaire: null,
      loading: false,
    })
  }

  const handleEditQuestionnaire = (questionnaire: Questionnaire) => {
    setQuestionnaireModal({
      open: true,
      questionnaire,
      loading: false,
    })
  }

  const handlePreviewQuestionnaire = (questionnaire: Questionnaire) => {
    setPreviewModal({
      open: true,
      questionnaire,
    })
  }

  const handleDuplicateQuestionnaire = async (questionnaire: Questionnaire) => {
    try {
      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const duplicatedQuestionnaire = {
        ...questionnaire,
        id: Date.now().toString(),
        title: `${questionnaire.title} (Copie)`,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: undefined,
      }

      setQuestionnaires((prev) => [...prev, duplicatedQuestionnaire])
      showSnackbar('Questionnaire dupliqué avec succès', 'success')
    } catch {
      showSnackbar('Erreur lors de la duplication', 'error')
    }
  }

  const handleSaveQuestionnaire = async (questionnaireData: Questionnaire) => {
    try {
      setQuestionnaireModal((prev) => ({ ...prev, loading: true }))

      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (questionnaireData.id) {
        // Modification
        setQuestionnaires((prev) =>
          prev.map((questionnaire) =>
            questionnaire.id === questionnaireData.id
              ? {
                  ...questionnaireData,
                  updatedAt: new Date(),
                  stats: prev.find((q) => q.id === questionnaireData.id)?.stats,
                }
              : questionnaire,
          ),
        )
        showSnackbar('Questionnaire modifié avec succès', 'success')
      } else {
        // Création
        const newQuestionnaire = {
          ...questionnaireData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setQuestionnaires((prev) => [...prev, newQuestionnaire])
        showSnackbar('Questionnaire créé avec succès', 'success')
      }

      setQuestionnaireModal({ open: false, questionnaire: null, loading: false })
    } catch {
      showSnackbar('Erreur lors de la sauvegarde', 'error')
    } finally {
      setQuestionnaireModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleDeleteQuestionnaire = (questionnaire: Questionnaire) => {
    setDeleteModal({
      open: true,
      questionnaire,
      loading: false,
    })
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }))

      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (deleteModal.questionnaire) {
        setQuestionnaires((prev) =>
          prev.filter((questionnaire) => questionnaire.id !== deleteModal.questionnaire?.id),
        )
        showSnackbar('Questionnaire supprimé avec succès', 'success')
      }

      setDeleteModal({ open: false, questionnaire: null, loading: false })
    } catch {
      showSnackbar('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const getCategoryColor = (category: Questionnaire['category']) => {
    switch (category) {
      case 'STRESS':
        return 'warning'
      case 'ANXIETY':
        return 'error'
      case 'BURNOUT':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getCategoryLabel = (category: Questionnaire['category']) => {
    switch (category) {
      case 'STRESS':
        return 'Stress'
      case 'ANXIETY':
        return 'Anxiété'
      case 'BURNOUT':
        return 'Burnout'
      default:
        return category
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Stack spacing={4}>
        {/* En-tête */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  color: 'text.primary',
                }}
              >
                Gestion des questionnaires
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Créer et gérer les questionnaires de diagnostic
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={handleCreateQuestionnaire}
              sx={{ height: 'fit-content' }}
            >
              Nouveau questionnaire
            </Button>
          </Stack>
        </Box>

        {/* Statistiques rapides */}
        <Paper
          elevation={0}
          sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {questionnaires.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Questionnaires
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {questionnaires.filter((q) => q.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Actifs
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {questionnaires.reduce((sum, q) => sum + (q.stats?.totalResponses || 0), 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Réponses totales
              </Typography>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'info.main' }}>
                {questionnaires.reduce((sum, q) => sum + q.questions.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Questions totales
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Table des questionnaires */}
        <QuestionnaireTable
          questionnaires={questionnaires}
          loading={loading}
          onToggleActive={handleToggleActive}
          onEdit={handleEditQuestionnaire}
          onDelete={handleDeleteQuestionnaire}
          onDuplicate={handleDuplicateQuestionnaire}
          onPreview={handlePreviewQuestionnaire}
        />

        {/* Modal questionnaire */}
        <QuestionnaireModal
          open={questionnaireModal.open}
          onClose={() =>
            setQuestionnaireModal({ open: false, questionnaire: null, loading: false })
          }
          onSave={handleSaveQuestionnaire}
          questionnaire={questionnaireModal.questionnaire}
          loading={questionnaireModal.loading}
        />

        {/* Modal de prévisualisation */}
        <Dialog
          open={previewModal.open}
          onClose={() => setPreviewModal({ open: false, questionnaire: null })}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={2}>
                <ClipboardList size={20} />
                <Typography variant="h6">Aperçu du questionnaire</Typography>
              </Stack>
              <IconButton onClick={() => setPreviewModal({ open: false, questionnaire: null })}>
                <X size={20} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {previewModal.questionnaire && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    {previewModal.questionnaire.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {previewModal.questionnaire.description}
                  </Typography>
                  <Chip
                    label={getCategoryLabel(previewModal.questionnaire.category)}
                    color={getCategoryColor(previewModal.questionnaire.category)}
                    size="small"
                  />
                </Box>

                <Divider />

                <Stack spacing={3}>
                  {previewModal.questionnaire.questions.map((question, index) => (
                    <Card
                      key={question.id}
                      elevation={0}
                      sx={{ border: '1px solid', borderColor: 'divider' }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                          {index + 1}. {question.text}
                        </Typography>

                        <Stack spacing={1}>
                          {question.options.map((option, optionIndex) => (
                            <Stack
                              key={option.id}
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{
                                p: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                bgcolor: '#f8fafc',
                              }}
                            >
                              <Typography variant="body2">
                                {String.fromCharCode(65 + optionIndex)}. {option.text}
                              </Typography>
                              <Chip
                                label={`${option.score} pts`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Stack>
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de confirmation de suppression */}
        <ConfirmDeleteModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, questionnaire: null, loading: false })}
          onConfirm={handleConfirmDelete}
          title="Supprimer le questionnaire"
          message={`Êtes-vous sûr de vouloir supprimer le questionnaire "${deleteModal.questionnaire?.title}" ?`}
          warningMessage="Toutes les réponses associées à ce questionnaire seront également supprimées."
          loading={deleteModal.loading}
        />

        {/* Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </Container>
  )
}
