'use client'

import { type AdminQuestionnaire } from '@/lib/services'
import {
  Checkbox,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import {
  BarChart3,
  ClipboardList,
  Copy,
  Edit,
  Eye,
  MoreVertical,
  Trash2,
  Users,
} from 'lucide-react'
import { useState } from 'react'

type Questionnaire = AdminQuestionnaire & {
  stats?: {
    totalResponses: number
    avgScore: number
    lastResponseAt?: Date
  }
}

interface QuestionnaireTableProps {
  questionnaires: Questionnaire[]
  loading?: boolean
  onToggleActive: (questionnaireId: string, isActive: boolean) => void
  onEdit: (questionnaire: Questionnaire) => void
  onDelete: (questionnaire: Questionnaire) => void
  onDuplicate: (questionnaire: Questionnaire) => void
  onPreview: (questionnaire: Questionnaire) => void
}

export default function QuestionnaireTable({
  questionnaires,
  loading = false,
  onToggleActive,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
}: QuestionnaireTableProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [currentQuestionnaire, setCurrentQuestionnaire] = useState<Questionnaire | null>(null)

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(questionnaires.map((q) => q.id).filter(Boolean) as string[])
    } else {
      setSelected([])
    }
  }

  const handleSelect = (questionnaireId: string) => {
    const selectedIndex = selected.indexOf(questionnaireId)
    let newSelected: string[] = []

    if (selectedIndex === -1) {
      newSelected = [...selected, questionnaireId]
    } else {
      newSelected = selected.filter((id) => id !== questionnaireId)
    }

    setSelected(newSelected)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, questionnaire: Questionnaire) => {
    setAnchorEl(event.currentTarget)
    setCurrentQuestionnaire(questionnaire)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setCurrentQuestionnaire(null)
  }

  const handleAction = (action: string) => {
    if (!currentQuestionnaire) return

    switch (action) {
      case 'edit':
        onEdit(currentQuestionnaire)
        break
      case 'preview':
        onPreview(currentQuestionnaire)
        break
      case 'duplicate':
        onDuplicate(currentQuestionnaire)
        break
      case 'delete':
        onDelete(currentQuestionnaire)
        break
    }
    handleMenuClose()
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

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getMaxScore = (questionnaire: Questionnaire) => {
    return (questionnaire.questions ?? []).reduce((total, question) => {
      const scores = (question.options ?? []).map((option) => option.score)
      const maxOptionScore = scores.length > 0 ? Math.max(...scores) : 0
      return total + maxOptionScore
    }, 0)
  }

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < questionnaires.length}
                  checked={questionnaires.length > 0 && selected.length === questionnaires.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Questionnaire</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Questions</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Score max</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Réponses</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actif</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dernière MAJ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={9}>
                    <LinearProgress sx={{ my: 2 }} />
                  </TableCell>
                </TableRow>
              ))
            ) : questionnaires.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 8 }}>
                  <Stack alignItems="center" spacing={2}>
                    <ClipboardList size={48} style={{ opacity: 0.3 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucun questionnaire
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Créez votre premier questionnaire pour commencer
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              questionnaires.map((questionnaire) => {
                const isSelected = questionnaire.id
                  ? selected.indexOf(questionnaire.id) !== -1
                  : false
                const maxScore = getMaxScore(questionnaire)

                return (
                  <TableRow
                    key={questionnaire.id || Math.random()}
                    hover
                    selected={isSelected}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelect(questionnaire.id!)}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack spacing={1}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {questionnaire.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {questionnaire.description}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getCategoryLabel(questionnaire.category)}
                        color={getCategoryColor(questionnaire.category)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={<ClipboardList size={16} />}
                        label={`${questionnaire.questions?.length ?? 0} questions`}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {maxScore} pts
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {questionnaire.stats ? (
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Users size={14} />
                            <Typography variant="body2">
                              {questionnaire.stats.totalResponses}
                            </Typography>
                          </Stack>
                          {questionnaire.stats.totalResponses > 0 && (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <BarChart3 size={14} />
                              <Typography variant="caption" color="text.secondary">
                                Moy: {questionnaire.stats.avgScore.toFixed(1)}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Aucune
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Switch
                        checked={questionnaire.isActive}
                        onChange={(e) => onToggleActive(questionnaire.id!, e.target.checked)}
                        size="small"
                        color="primary"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {questionnaire.updatedAt ? formatDate(questionnaire.updatedAt) : 'N/A'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, questionnaire)}>
                        <MoreVertical size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Modifier
        </MenuItem>

        <MenuItem onClick={() => handleAction('preview')}>
          <Eye size={16} style={{ marginRight: 8 }} />
          Prévisualiser
        </MenuItem>

        <MenuItem onClick={() => handleAction('duplicate')}>
          <Copy size={16} style={{ marginRight: 8 }} />
          Dupliquer
        </MenuItem>

        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Supprimer
        </MenuItem>
      </Menu>
    </Paper>
  )
}
