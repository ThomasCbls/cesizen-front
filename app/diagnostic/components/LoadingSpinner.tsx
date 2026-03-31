'use client'

// ======================================================================
// ⏳ LOADING SPINNER - Composant de chargement réutilisable
// ======================================================================

import React from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { Brain } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  showIcon?: boolean
}

const sizeConfig = {
  small: { spinner: 24, icon: 'h-6 w-6' },
  medium: { spinner: 40, icon: 'h-8 w-8' },
  large: { spinner: 60, icon: 'h-12 w-12' },
}

export default function LoadingSpinner({
  message = 'Chargement...',
  size = 'medium',
  showIcon = true,
}: LoadingSpinnerProps) {
  const config = sizeConfig[size]

  return (
    <Box className="flex flex-col items-center justify-center py-12">
      {/* Animation icon + spinner */}
      <Box className="relative mb-6">
        {showIcon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className={`${config.icon} text-blue-600 animate-pulse`} />
          </div>
        )}
        <CircularProgress size={config.spinner} thickness={2} className="text-blue-600" />
      </Box>

      {/* Message de chargement */}
      <Typography
        variant={size === 'small' ? 'body2' : 'body1'}
        color="textSecondary"
        className="text-center"
      >
        {message}
      </Typography>

      {/* Points d'animation */}
      <Box className="flex space-x-1 mt-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
            style={{
              animationDelay: `${index * 150}ms`,
            }}
          />
        ))}
      </Box>
    </Box>
  )
}
