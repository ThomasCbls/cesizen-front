'use client'

// 📈 RESULTAT DIAGNOSTIC - Composant d'affichage des résultats

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { AlertTriangle, Calendar, CheckCircle, Lightbulb, Target, TrendingUp } from 'lucide-react'

import type { DiagnosticResult } from '@/types'

interface DiagnosticResultProps {
  result: DiagnosticResult
  diagnosticId: string
  onNewDiagnostic: () => void
  onViewHistory: () => void
}

const levelConfig = {
  LOW: {
    label: 'Stress Faible',
    color: 'success' as const,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: CheckCircle,
    description: 'Votre niveau de stress est dans une plage normale et saine.',
  },
  MODERATE: {
    label: 'Stress Modéré',
    color: 'warning' as const,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: AlertTriangle,
    description: 'Votre niveau de stress est élevé mais gérable avec les bonnes techniques.',
  },
  HIGH: {
    label: 'Stress Élevé',
    color: 'warning' as const,
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: AlertTriangle,
    description: 'Votre niveau de stress est élevé et nécessite une attention particulière.',
  },
  SEVERE: {
    label: 'Stress Sévère',
    color: 'error' as const,
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: AlertTriangle,
    description:
      'Votre niveau de stress est très élevé. Il est conseillé de consulter un professionnel.',
  },
}

export default function DiagnosticResult({
  result,
  diagnosticId,
  onNewDiagnostic,
  onViewHistory,
}: DiagnosticResultProps) {
  const config = levelConfig[result.level]
  const IconComponent = config.icon

  return (
    <div className="space-y-6">
      {/* En-tête des résultats */}
      <Box className="text-center mb-8">
        <div className="mb-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        </div>
        <Typography variant="h4" color="textPrimary">
          Diagnostic Terminé
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Voici l&apos;analyse de votre niveau de stress
        </Typography>
      </Box>

      {/* Score global */}
      <Card variant="outlined" className="mb-6">
        <CardContent className="text-center p-8">
          <Typography variant="h2" color="textPrimary">
            {result.totalScore}/{result.maxScore}
          </Typography>
          <Typography variant="h6" color="textSecondary" className="mb-4">
            Score Global ({result.percentage.toFixed(1)}%)
          </Typography>

          <LinearProgress
            variant="determinate"
            value={result.percentage}
            className="h-2 mb-4 rounded-full"
            style={{
              backgroundColor: '#e0e0e0',
            }}
          />

          <Chip
            icon={<IconComponent className="h-4 w-4" />}
            label={config.label}
            className={`${config.bgColor} ${config.textColor} px-4 py-2 text-sm font-medium`}
          />
        </CardContent>
      </Card>

      {/* Niveau et interprétation */}
      <Card variant="outlined">
        <CardContent>
          <Box className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${config.bgColor}`}>
              <IconComponent className={`h-6 w-6 ${config.textColor}`} />
            </div>
            <div className="flex-1">
              <Typography variant="h6" className="font-semibold mb-2">
                Interprétation du Résultat
              </Typography>
              <Typography variant="body1" color="textSecondary" className="mb-4">
                {config.description}
              </Typography>
              <Alert severity={config.color} className="mb-4">
                {result.interpretation}
              </Alert>
            </div>
          </Box>
        </CardContent>
      </Card>

      {/* Recommandations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <Card variant="outlined">
          <CardContent>
            <Box className="flex items-center space-x-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <Typography variant="h6" className="font-semibold">
                Recommandations Personnalisées
              </Typography>
            </Box>

            <List>
              {result.recommendations.map((recommendation, index) => (
                <ListItem key={index} className="px-0">
                  <ListItemIcon>
                    <Target className="h-5 w-5 text-blue-600" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} className="text-gray-700" />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Informations du diagnostic */}
      <Card variant="outlined" className="bg-gray-50">
        <CardContent>
          <Box className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <Typography variant="body2" color="textSecondary">
                Diagnostic ID: {diagnosticId}
              </Typography>
            </div>
            <Typography variant="body2" color="textSecondary">
              {new Date().toLocaleString('fr-FR')}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button
          variant="outlined"
          onClick={onNewDiagnostic}
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          Nouveau Diagnostic
        </Button>
        <Button
          variant="contained"
          onClick={onViewHistory}
          startIcon={<TrendingUp />}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Voir l&apos;Historique Complet
        </Button>
      </Box>

      {/* Note clinique */}
      {result.level === 'SEVERE' && (
        <Alert severity="warning" className="mt-6">
          <Typography variant="body2">
            <strong>Note importante:</strong> Ce diagnostic est un outil d&apos;évaluation et ne
            remplace pas une consultation médicale. Si vous ressentez un stress important qui
            affecte votre quotidien, nous vous encourageons à consulter un professionnel de la
            santé.
          </Typography>
        </Alert>
      )}
    </div>
  )
}
