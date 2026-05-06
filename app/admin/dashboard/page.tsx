'use client'

import { adminService, type UserStats } from '@/lib/services'
import { Box, Container, Stack, Typography } from '@mui/material'
import { CheckCircle, ClipboardList, FileText, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { QuickActions, StatsCard } from '../components'

interface DashboardRaw {
  totalDiagnostics?: number
  totalContent?: number
  diagnosticsThisWeek?: number
  [key: string]: unknown
}

export default function AdminDashboard() {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [dashboardRaw, setDashboardRaw] = useState<DashboardRaw | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [rawDashboard, rawUserStats] = await Promise.all([
          adminService.getDashboardStats() as Promise<DashboardRaw>,
          adminService.getUserStats(),
        ])
        setDashboardRaw(rawDashboard)
        setUserStats(rawUserStats)
      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const totalUsers = userStats?.total ?? 0
  const activeUsers = userStats?.active ?? 0
  const recentRegistrations = userStats?.recentRegistrations ?? 0
  const totalDiagnostics = dashboardRaw?.totalDiagnostics ?? 0
  const totalContent = dashboardRaw?.totalContent ?? 0
  const diagnosticsThisWeek = dashboardRaw?.diagnosticsThisWeek ?? 0

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Stack spacing={4}>
        {/* En-tête */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            Dashboard Administration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tableau de bord - Vue d&apos;ensemble de la plateforme CESIZen
          </Typography>
        </Box>

        {/* Cartes de statistiques */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
          <Box sx={{ flex: 1 }}>
            <StatsCard
              title="Utilisateurs totaux"
              value={totalUsers}
              icon={Users}
              color="primary"
              loading={loading}
              trend={{
                value: totalUsers > 0 ? Math.round((recentRegistrations / totalUsers) * 100) : 0,
                label: 'cette semaine',
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <StatsCard
              title="Utilisateurs actifs"
              value={activeUsers}
              icon={CheckCircle}
              color="success"
              loading={loading}
              trend={{
                value: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
                label: "taux d'activité",
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <StatsCard
              title="Diagnostics réalisés"
              value={totalDiagnostics}
              icon={ClipboardList}
              color="warning"
              loading={loading}
              trend={{
                value:
                  totalDiagnostics > 0
                    ? Math.round((diagnosticsThisWeek / totalDiagnostics) * 100)
                    : 0,
                label: 'cette semaine',
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <StatsCard
              title="Contenus publiés"
              value={totalContent}
              icon={FileText}
              color="error"
              loading={loading}
            />
          </Box>
        </Stack>

        {/* Actions rapides */}
        <Box sx={{ maxWidth: 400 }}>
          <QuickActions />
        </Box>
      </Stack>
    </Container>
  )
}
