'use client'

import {
  type AdminQuestion,
  type AdminQuestionnaire,
  type AdminQuestionOption,
} from '@/lib/services'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { ChevronDown, ChevronUp, ClipboardList, Minus, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Question = AdminQuestion
type QuestionOption = AdminQuestionOption

interface QuestionnaireForm {
  id?: string
  title: string
  description: string
  category: 'STRESS' | 'ANXIETY' | 'BURNOUT'
  isActive: boolean
  questions: Question[]
}

interface QuestionnaireModalProps {
  open: boolean
  onClose: () => void
  onSave: (questionnaire: Partial<AdminQuestionnaire>) => Promise<void> | void
  questionnaire?: AdminQuestionnaire | null
  loading?: boolean
}

export default function QuestionnaireModal({
  open,
  onClose,
  onSave,
  questionnaire,
  loading = false,
}: QuestionnaireModalProps) {
  const [formData, setFormData] = useState<QuestionnaireForm>({
    title: '',
    description: '',
    category: 'STRESS',
    isActive: true,
    questions: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const isEdit = Boolean(questionnaire?.id)

  // Reset form when modal opens or questionnaire prop changes
  useEffect(() => {
    if (open) {
      // Utiliser setTimeout pour éviter les mises à jour synchrones dans l'effet
      const timer = setTimeout(() => {
        if (questionnaire) {
          setFormData(questionnaire)
          setExpandedQuestions(new Set(questionnaire.questions.map((q) => q.id)))
        } else {
          setFormData({
            title: '',
            description: '',
            category: 'STRESS',
            isActive: true,
            questions: [],
          })
          setExpandedQuestions(new Set())
        }
        setErrors({})
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [open, questionnaire])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise'
    }

    if (formData.questions.length === 0) {
      newErrors.questions = 'Au moins une question est requise'
    }

    // Valider chaque question
    formData.questions.forEach((question, qIndex) => {
      if (!question.text.trim()) {
        newErrors[`question_${qIndex}`] = 'Le texte de la question est requis'
      }
      if (question.options.length < 2) {
        newErrors[`question_${qIndex}_options`] = 'Au moins 2 options sont requises'
      }

      question.options.forEach((option, oIndex) => {
        if (!option.text.trim()) {
          newErrors[`question_${qIndex}_option_${oIndex}`] = "Le texte de l'option est requis"
        }
        if (option.score === undefined || option.score < 0) {
          newErrors[`question_${qIndex}_option_${oIndex}_score`] =
            'Le score doit être défini et positif'
        }
      })
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    // Nettoyer les données: enlever les IDs temporaires du frontend
    const cleanedData = {
      ...(formData.id && { id: formData.id }),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      isActive: formData.isActive,
      questions: formData.questions.map(({ id, ...question }) => ({
        ...question,
        options: question.options.map(({ id, ...option }) => option),
      })),
    }

    onSave(cleanedData)
  }

  const handleInputChange = (field: keyof QuestionnaireForm, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      order: formData.questions.length + 1,
      options: [
        { id: `o_${Date.now()}_1`, text: '', score: 0 },
        { id: `o_${Date.now()}_2`, text: '', score: 1 },
      ],
    }

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))

    // Étendre automatiquement la nouvelle question
    setExpandedQuestions((prev) => new Set([...prev, newQuestion.id]))
  }

  const removeQuestion = (questionId: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }))
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }

  const updateQuestion = (questionId: string, field: keyof Question, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)),
    }))
  }

  const addOption = (questionId: string) => {
    const newOption: QuestionOption = {
      id: `o_${Date.now()}`,
      text: '',
      score: 0,
    }

    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: [...q.options, newOption],
            }
          : q,
      ),
    }))
  }

  const removeOption = (questionId: string, optionId: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.filter((o) => o.id !== optionId),
            }
          : q,
      ),
    }))
  }

  const updateOption = (
    questionId: string,
    optionId: string,
    field: keyof QuestionOption,
    value: unknown,
  ) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((o) => (o.id === optionId ? { ...o, [field]: value } : o)),
            }
          : q,
      ),
    }))
  }

  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })
  }

  const moveQuestion = (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = formData.questions.findIndex((q) => q.id === questionId)
    if (
      (direction === 'up' && currentIndex > 0) ||
      (direction === 'down' && currentIndex < formData.questions.length - 1)
    ) {
      const newQuestions = [...formData.questions]
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

      // Échanger les positions
      ;[newQuestions[currentIndex], newQuestions[targetIndex]] = [
        newQuestions[targetIndex],
        newQuestions[currentIndex],
      ]

      // Mettre à jour les ordres
      newQuestions.forEach((q, index) => {
        q.order = index + 1
      })

      setFormData((prev) => ({ ...prev, questions: newQuestions }))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, height: '90vh' },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <ClipboardList size={20} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {isEdit ? 'Modifier le questionnaire' : 'Nouveau questionnaire'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configurez les questions et les scores
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, overflow: 'auto' }}>
        <Stack spacing={3}>
          {/* Informations générales */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Informations générales
              </Typography>

              <Stack spacing={2}>
                <TextField
                  label="Titre du questionnaire"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={Boolean(errors.title)}
                  helperText={errors.title}
                  fullWidth
                  required
                />

                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={Boolean(errors.description)}
                  helperText={errors.description}
                  fullWidth
                  multiline
                  rows={2}
                  required
                />

                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Catégorie</InputLabel>
                    <Select
                      value={formData.category}
                      label="Catégorie"
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <MenuItem value="STRESS">Stress</MenuItem>
                      <MenuItem value="ANXIETY">Anxiété</MenuItem>
                      <MenuItem value="BURNOUT">Burnout</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      />
                    }
                    label="Questionnaire actif"
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Questions ({formData.questions.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Plus size={16} />}
                  onClick={addQuestion}
                >
                  Ajouter une question
                </Button>
              </Stack>

              {errors.questions && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {errors.questions}
                </Alert>
              )}

              <Stack spacing={2}>
                {formData.questions.map((question, qIndex) => (
                  <Card
                    key={question.id}
                    elevation={0}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: '#f8fafc',
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* En-tête de question */}
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleQuestionExpanded(question.id)}
                        >
                          {expandedQuestions.has(question.id) ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </IconButton>

                        <Chip
                          label={`Q${qIndex + 1}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {question.text || 'Nouvelle question'}
                          </Typography>
                        </Box>

                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => moveQuestion(question.id, 'up')}
                            disabled={qIndex === 0}
                          >
                            <ChevronUp size={14} />
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() => moveQuestion(question.id, 'down')}
                            disabled={qIndex === formData.questions.length - 1}
                          >
                            <ChevronDown size={14} />
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() => removeQuestion(question.id)}
                            color="error"
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Collapse in={expandedQuestions.has(question.id)}>
                        <Stack spacing={2}>
                          <TextField
                            label="Texte de la question"
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                            error={Boolean(errors[`question_${qIndex}`])}
                            helperText={errors[`question_${qIndex}`]}
                            fullWidth
                            multiline
                            rows={2}
                            required
                          />

                          {/* Options */}
                          <Box>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{ mb: 1 }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                Options de réponse
                              </Typography>
                              <Button
                                size="small"
                                startIcon={<Plus size={14} />}
                                onClick={() => addOption(question.id)}
                              >
                                Ajouter option
                              </Button>
                            </Stack>

                            {errors[`question_${qIndex}_options`] && (
                              <Alert severity="error" sx={{ mb: 1 }}>
                                {errors[`question_${qIndex}_options`]}
                              </Alert>
                            )}

                            <Stack spacing={1}>
                              {question.options.map((option, oIndex) => (
                                <Stack
                                  key={option.id}
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <TextField
                                    label={`Option ${oIndex + 1}`}
                                    value={option.text}
                                    onChange={(e) =>
                                      updateOption(question.id, option.id, 'text', e.target.value)
                                    }
                                    error={Boolean(errors[`question_${qIndex}_option_${oIndex}`])}
                                    size="small"
                                    sx={{ flexGrow: 1 }}
                                    required
                                  />

                                  <TextField
                                    label="Score"
                                    type="number"
                                    value={option.score}
                                    onChange={(e) =>
                                      updateOption(
                                        question.id,
                                        option.id,
                                        'score',
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    error={Boolean(
                                      errors[`question_${qIndex}_option_${oIndex}_score`],
                                    )}
                                    size="small"
                                    sx={{ width: 80 }}
                                    inputProps={{ min: 0, max: 100 }}
                                    required
                                  />

                                  <IconButton
                                    size="small"
                                    onClick={() => removeOption(question.id, option.id)}
                                    disabled={question.options.length <= 2}
                                    color="error"
                                  >
                                    <Minus size={16} />
                                  </IconButton>
                                </Stack>
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </Collapse>
                    </CardContent>
                  </Card>
                ))}

                {formData.questions.length === 0 && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Aucune question ajoutée. Cliquez sur &ldquo;Ajouter une question&rdquo; pour
                    commencer.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={<Save size={16} />}
        >
          {loading ? 'Sauvegarde...' : isEdit ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
