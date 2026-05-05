'use client'

import { QuestionnaireService } from '@/lib/services'
import type { Questionnaire } from '@/types'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { ArrowLeft, Brain, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type QuestionnaireItem = Omit<Questionnaire, 'questions'>

const categoryLabels: Record<string, { label: string; color: 'primary' | 'warning' | 'error' }> = {
  STRESS: { label: 'Stress', color: 'primary' },
  ANXIETY: { label: 'Anxiété', color: 'warning' },
  BURNOUT: { label: 'Burnout', color: 'error' },
}

export default function QuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const response = await QuestionnaireService.getQuestionnaires()
        setQuestionnaires(response.questionnaires)
      } catch (err) {
        console.error('Erreur lors du chargement des questionnaires:', err)
        setError('Impossible de charger les questionnaires. Veuillez réessayer plus tard.')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestionnaires()
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" gap={1}>
              <Box sx={{ p: 0.5, bgcolor: 'primary.main', borderRadius: 1, display: 'flex' }}>
                <Brain color="white" size={24} />
              </Box>
              <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: '-0.5px' }}>
                CESIZen
              </Typography>
            </Stack>
            <Link href="/">
              <Button variant="text" startIcon={<ArrowLeft size={18} />}>
                Retour
              </Button>
            </Link>
          </Stack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Questionnaires Disponibles
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Découvrez nos questionnaires scientifiquement validés pour évaluer votre bien-être.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={120} />
            ))}
          </Stack>
        ) : questionnaires.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <ClipboardList size={48} style={{ color: '#9e9e9e', marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary">
                Aucun questionnaire disponible pour le moment.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {questionnaires.map((q) => {
              const cat = categoryLabels[q.category] || {
                label: q.category,
                color: 'primary' as const,
              }
              return (
                <Card
                  key={q.id}
                  sx={{ '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography variant="h6" fontWeight="bold">
                            {q.title}
                          </Typography>
                          <Chip label={cat.label} color={cat.color} size="small" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {q.description}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
          </Stack>
        )}
      </Container>
    </Box>
  )
}
