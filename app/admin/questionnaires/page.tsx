'use client'

import { adminService, type AdminQuestionnaire } from '@/lib/services'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { ClipboardList, Plus, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { ConfirmDeleteModal, QuestionnaireModal, QuestionnaireTable } from '../components'

type Questionnaire = AdminQuestionnaire

type QuestionnaireFormPayload = Partial<Omit<AdminQuestionnaire, 'questions'>> & {
  questions?: Array<
    Omit<AdminQuestionnaire['questions'][number], 'id' | 'options'> & {
      id?: string
      options: Array<
        Omit<AdminQuestionnaire['questions'][number]['options'][number], 'id'> & { id?: string }
      >
    }
  >
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
      const data = await adminService.getQuestionnaires()
      setQuestionnaires(data)
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
      const updated = await adminService.toggleQuestionnaireActive(questionnaireId, isActive)
      setQuestionnaires((prev) =>
        prev.map((q) => (q.id === questionnaireId ? { ...q, ...updated } : q)),
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
      const created = await adminService.createQuestionnaire({
        title: `${questionnaire.title} (Copie)`,
        description: questionnaire.description,
        category: questionnaire.category,
        isActive: false,
        questions: questionnaire.questions,
      })
      setQuestionnaires((prev) => [...prev, created])
      showSnackbar('Questionnaire dupliqué avec succès', 'success')
    } catch {
      showSnackbar('Erreur lors de la duplication', 'error')
    }
  }

  const handleSaveQuestionnaire = async (questionnaireData: QuestionnaireFormPayload) => {
    try {
      setQuestionnaireModal((prev) => ({ ...prev, loading: true }))

      if (questionnaireData.id) {
        await adminService.updateQuestionnaire(
          questionnaireData.id,
          questionnaireData as Questionnaire,
        )
        showSnackbar('Questionnaire modifié avec succès', 'success')
      } else {
        await adminService.createQuestionnaire(questionnaireData as Questionnaire)
        showSnackbar('Questionnaire créé avec succès', 'success')
      }

      // Rafraîchir la liste pour s'assurer que les données sont à jour
      await loadQuestionnaires()
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

      if (deleteModal.questionnaire?.id) {
        await adminService.deleteQuestionnaire(deleteModal.questionnaire.id)
        setQuestionnaires((prev) => prev.filter((q) => q.id !== deleteModal.questionnaire?.id))
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
                {questionnaires.reduce((sum, q) => sum + (q.questions?.length ?? 0), 0)}
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
                  {(previewModal.questionnaire.questions ?? []).map((question, index) => (
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
