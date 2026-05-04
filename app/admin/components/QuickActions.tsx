'use client'

import { Card, CardContent, Typography, Stack, Button, Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { UserPlus, FileText, ClipboardList, BarChart3, Users, Settings } from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  icon: any
  action: () => void
  color?: 'primary' | 'success' | 'warning' | 'error'
}

export default function QuickActions() {
  const router = useRouter()

  const actions: QuickAction[] = [
    {
      title: 'Gérer les utilisateurs',
      description: 'Voir tous les utilisateurs et gérer leurs permissions',
      icon: Users,
      action: () => router.push('/admin/utilisateurs'),
      color: 'primary',
    },
    {
      title: 'Créer un contenu',
      description: 'Ajouter une nouvelle page ou article informatif',
      icon: FileText,
      action: () => router.push('/admin/informations'),
      color: 'success',
    },
    {
      title: 'Modifier questionnaires',
      description: 'Gérer les questionnaires de diagnostic',
      icon: ClipboardList,
      action: () => router.push('/admin/questionnaires'),
      color: 'warning',
    },
  ]

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          Actions rapides
        </Typography>

        <Stack spacing={2}>
          {actions.map((action, index) => {
            const Icon = action.icon

            return (
              <Button
                key={index}
                onClick={action.action}
                variant="outlined"
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: `${action.color}.lighter`,
                    borderColor: `${action.color}.main`,
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: `${action.color}.lighter`,
                      color: `${action.color}.main`,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </Box>

                  <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        color: 'text.primary',
                      }}
                    >
                      {action.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ wordBreak: 'break-word' }}
                    >
                      {action.description}
                    </Typography>
                  </Box>
                </Stack>
              </Button>
            )
          })}
        </Stack>
      </CardContent>
    </Card>
  )
}
