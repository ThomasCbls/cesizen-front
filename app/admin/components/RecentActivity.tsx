'use client'

import { Card, CardContent, Typography, Box, Stack, Chip, Avatar, Skeleton } from '@mui/material'
// Removed date-fns dependency - using native JS
import { User, FileText, ClipboardList, Clock } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'user_registration' | 'diagnostic_completed' | 'content_created' | 'questionnaire_updated'
  description: string
  timestamp: Date
  user?: {
    prenom: string
    nom: string
  }
}

interface RecentActivityProps {
  activities: ActivityItem[]
  loading?: boolean
}

export default function RecentActivity({ activities, loading = false }: RecentActivityProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registration':
        return <User size={16} />
      case 'diagnostic_completed':
        return <ClipboardList size={16} />
      case 'content_created':
        return <FileText size={16} />
      case 'questionnaire_updated':
        return <ClipboardList size={16} />
      default:
        return <Clock size={16} />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registration':
        return 'success'
      case 'diagnostic_completed':
        return 'primary'
      case 'content_created':
        return 'warning'
      case 'questionnaire_updated':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "À l'instant"
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
      })
    }
  }

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
          Activité récente
        </Typography>

        <Stack spacing={2}>
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Stack key={index} direction="row" spacing={2} alignItems="center">
                <Skeleton variant="circular" width={32} height={32} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Stack>
            ))
          ) : activities.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Clock size={32} />
              <Typography variant="body2">Aucune activité récente</Typography>
            </Box>
          ) : (
            activities.slice(0, 10).map((activity) => (
              <Stack
                key={activity.id}
                direction="row"
                spacing={2}
                alignItems="flex-start"
                sx={{
                  pb: 2,
                  '&:not(:last-child)': {
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: `${getActivityColor(activity.type)}.main`,
                    color: 'white',
                  }}
                >
                  {getActivityIcon(activity.type)}
                </Avatar>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    {activity.description}
                  </Typography>

                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    {activity.user && (
                      <Chip
                        label={`${activity.user.prenom} ${activity.user.nom}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(activity.timestamp)}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
