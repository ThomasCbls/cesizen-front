'use client'

import { Card, CardContent, Typography, Box, Stack, Skeleton } from '@mui/material'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'primary' | 'success' | 'warning' | 'error'
  loading?: boolean
  trend?: {
    value: number
    label: string
  }
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  loading = false,
  trend,
}: StatsCardProps) {
  const colorMap = {
    primary: { bg: '#e3f2fd', text: '#1976d2' },
    success: { bg: '#e8f5e8', text: '#2e7d32' },
    warning: { bg: '#fff8e1', text: '#f57c00' },
    error: { bg: '#ffebee', text: '#d32f2f' },
  }

  const colors = colorMap[color]

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                {title}
              </Typography>
              {loading ? (
                <Skeleton variant="text" width={80} height={32} />
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text }}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: colors.bg,
                color: colors.text,
              }}
            >
              <Icon size={24} />
            </Box>
          </Stack>

          {trend && !loading && (
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color:
                      trend.value > 0
                        ? 'success.main'
                        : trend.value < 0
                          ? 'error.main'
                          : 'text.secondary',
                  }}
                >
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {trend.label}
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
