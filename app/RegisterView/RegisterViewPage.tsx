'use client'

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
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { endpoints } from '../utils/endpoint'

const RegisterViewPage = () => {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')

  const [lastName, setLastName] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!firstName || !lastName || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs')
      setIsLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    try {
      console.log("Tentative d'inscription à:", endpoints.auth.register)

      const response = await fetch(endpoints.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          prenom: firstName,
          nom: lastName,
          email: email,
          mot_de_passe: password,
        }),
      })

      console.log('Réponse reçue:', response.status, response.statusText)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Erreur serveur: ${response.status}`)
      }

      const data = await response.json()

      // Inscription réussie
      console.log('Utilisateur inscrit:', data)

      // Stocker le token si présent
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token)
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      // Rediriger après inscription réussie
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur d'inscription"
      console.error("Erreur lors de l'inscription:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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
              S&apos;inscrire
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Créez votre compte
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={20} />
                  </InputAdornment>
                ),
              }}
            />{' '}
            <TextField
              fullWidth
              label="Prénom"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              variant="outlined"
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} />
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontSize: 16,
                fontWeight: 600,
                padding: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #66438e 100%)',
                },
                '&:disabled': {
                  background: '#ccc',
                },
              }}
            >
              {isLoading ? 'Inscription...' : "S'inscrire"}
            </Button>
          </Stack>

          <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Vous avez déjà un compte ?{' '}
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button
                  variant="text"
                  size="small"
                  sx={{ textTransform: 'none', padding: 0, minWidth: 'auto', color: '#667eea' }}
                >
                  Se connecter
                </Button>
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Card>
    </Stack>
  )
}

export default RegisterViewPage
