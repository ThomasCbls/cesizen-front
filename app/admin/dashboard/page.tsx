'use client'

import { useState, useEffect } from 'react'
import { Container, Typography, Box, Stack, Alert } from '@mui/material'
import { Users, FileText, ClipboardList, CheckCircle } from 'lucide-react'
import { StatsCard, RecentActivity, QuickActions } from '../components'

// Types pour les données du dashboard
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalDiagnostics: number
  totalContent: number
  newUsersThisWeek: number
  diagnosticsThisWeek: number
}

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

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: Date
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  // Simulation de chargement des données - À remplacer par de vraies API calls
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Simuler un délai de chargement
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Données mockées - remplacer par vraies API calls
        const mockStats: DashboardStats = {
          totalUsers: 1247,
          activeUsers: 892,
          totalDiagnostics: 3456,
          totalContent: 28,
          newUsersThisWeek: 23,
          diagnosticsThisWeek: 156,
        }

        const mockActivities: ActivityItem[] = [
          {
            id: '1',
            type: 'user_registration',
            description: 'Nouvel utilisateur inscrit',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
            user: { prenom: 'Marie', nom: 'Dubois' },
          },
          {
            id: '2',
            type: 'diagnostic_completed',
            description: 'Diagnostic de stress complété',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // Il y a 4h
            user: { prenom: 'Pierre', nom: 'Martin' },
          },
          {
            id: '3',
            type: 'content_created',
            description: 'Nouvel article publié : "Gérer le stress au travail"',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // Il y a 6h
          },
          {
            id: '4',
            type: 'diagnostic_completed',
            description: 'Diagnostic de burnout complété',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // Il y a 8h
            user: { prenom: 'Sophie', nom: 'Leroy' },
          },
          {
            id: '5',
            type: 'user_registration',
            description: 'Nouvel utilisateur inscrit',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
            user: { prenom: 'Thomas', nom: 'Bernard' },
          },
        ]

        const mockAlerts: Alert[] = [
          {
            id: '1',
            type: 'warning',
            message: 'Serveur de mail en maintenance programmée demain à 14h',
            timestamp: new Date(),
          },
          {
            id: '2',
            type: 'info',
            message: 'Nouvelle version du questionnaire de stress disponible',
            timestamp: new Date(),
          },
        ]

        setStats(mockStats)
        setActivities(mockActivities)
        setAlerts(mockAlerts)
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
        console.error('Erreur dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleAlertClose = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Stack spacing={4}>
        {/* En-tête */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: 'text.primary',
            }}
          >
            Dashboard Administration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tableau de bord - Vue d&apos;ensemble de la plateforme CESIZen
          </Typography>
        </Box>

        {/* Alertes */}
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            severity={
              alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'
            }
            onClose={() => handleAlertClose(alert.id)}
            sx={{ borderRadius: 2 }}
          >
            {alert.message}
          </Alert>
        ))}

        {/* Cartes de statistiques */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ flex: 1 }}>
            <StatsCard
              title="Utilisateurs totaux"
              value={stats?.totalUsers || 0}
              icon={Users}
              color="primary"
              loading={loading}
              trend={{
                value: stats ? Math.round((stats.newUsersThisWeek / stats.totalUsers) * 100) : 0,
                label: 'cette semaine',
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <StatsCard
              title="Utilisateurs actifs"
              value={stats?.activeUsers || 0}
              icon={CheckCircle}
              color="success"
              loading={loading}
              trend={{
                value: stats ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0,
                label: "taux d'activité",
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <StatsCard
              title="Diagnostics réalisés"
              value={stats?.totalDiagnostics || 0}
              icon={ClipboardList}
              color="warning"
              loading={loading}
              trend={{
                value: 12,
                label: 'cette semaine',
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <StatsCard
              title="Contenus publiés"
              value={stats?.totalContent || 0}
              icon={FileText}
              color="error"
              loading={loading}
            />
          </Box>
        </Stack>

        {/* Section principale avec activité et actions */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          <Box sx={{ flex: 2 }}>
            <RecentActivity activities={activities} loading={loading} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <QuickActions />
          </Box>
        </Stack>
      </Stack>
    </Container>
  )
}
