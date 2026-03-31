'use client'

// ======================================================================
// ðŸ”‘ LOGIN VIEW PAGE - Mise Ã  jour avec nouveau systÃ¨me d'auth
// ======================================================================

import {
  Alert,
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth, usePublicRoute } from '@/contexts'
import type { LoginRequest } from '@/types'

const LogViewPage = () => {
  // Hooks d'authentification
  const { login, isLoading: authLoading, error: authError, clearError } = useAuth()
  usePublicRoute('/home') // Redirection si dÃ©jÃ  connectÃ©

  const router = useRouter()

  // Ã‰tat du composant
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<string>('')

  // Validation des champs
  const validateForm = (): boolean => {
    setFieldErrors('')
    clearError()

    if (!email || !password) {
      setFieldErrors('Veuillez remplir tous les champs')
      return false
    }

    if (!email.includes('@')) {
      setFieldErrors('Veuillez entrer une adresse email valide')
      return false
    }

    if (password.length < 6) {
      setFieldErrors('Le mot de passe doit contenir au moins 6 caractÃ¨res')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const credentials: LoginRequest = {
        email,
        password,
      }

      await login(credentials)

      // Redirection gÃ©rÃ©e automatiquement par usePublicRoute ou Context
      // mais on peut forcer au cas oÃ¹
      router.push('/home')
    } catch (error) {
      // L'erreur est gÃ©rÃ©e par le Context et affichÃ©e via authError
      console.error('Erreur de connexion:', error)
    }
  }

  const displayError = fieldErrors || authError

  return (
    <Stack
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: '100%',
          padding: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Lock size={48} style={{ color: '#667eea', marginBottom: 16 }} />
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Connexion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connectez-vous Ã  votre compte CESIZen
            </Typography>
          </Box>

          {displayError && (
            <Alert
              severity="error"
              onClose={() => {
                setFieldErrors('')
                clearError()
              }}
            >
              {displayError}
            </Alert>
          )}

          <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              disabled={authLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              disabled={authLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={authLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={authLoading}
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                height: 48,
                fontSize: '1.1rem',
              }}
            >
              {authLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Vous n'avez pas de compte ?{' '}
              <Link
                href="/register"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 'medium',
                }}
              >
                CrÃ©er un compte
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Stack>
  )
}

export default LogViewPage
