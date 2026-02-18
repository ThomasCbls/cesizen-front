'use client'

import { useUser } from '@/app/hooks/useUser'
import { apiCall, endpoints } from '@/app/utils/endpoint'
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material'
import { ArrowLeft, Camera, Lock, Mail, Save, ShieldCheck, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const UserSettingPage = () => {
  const theme = useTheme()
  const { user, setUser } = useUser()
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
  })
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  console.log('🚀 ~ UserSettingPage ~ user:', user)

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }
  const handleSaveProfile = async () => {
    try {
      const updateData = {
        prenom: profileData.prenom,
        nom: profileData.nom,
        email: profileData.email,
      }

      await apiCall(endpoints.users.update(user?.id), 'PATCH', updateData)
      console.log('🚀 ~ handleSaveProfile ~ endpoints.users:', endpoints.users.update(user?.id))

      if (user) {
        setUser({ ...user, ...updateData })
      }

      setSnackbar({
        open: true,
        message: 'Informations mises à jour avec succès !',
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          (error instanceof Error ? error.message : 'Erreur lors de la mise à jour') ||
          'Erreur lors de la mise à jour',
        severity: 'error',
      })
    }
  }

  const handleSavePassword = async () => {
    // Validation basique
    if (passwordData.new !== passwordData.confirm) {
      setSnackbar({
        open: true,
        message: 'Les nouveaux mots de passe ne correspondent pas.',
        severity: 'error',
      })
      return
    }

    if (!passwordData.current || !passwordData.new) {
      setSnackbar({
        open: true,
        message: 'Veuillez remplir tous les champs.',
        severity: 'error',
      })
      return
    }

    try {
      await apiCall(endpoints.users.update(user?.id), 'PATCH', {
        current_password: passwordData.current,
        mot_de_passe: passwordData.new,
      })

      setSnackbar({ open: true, message: 'Mot de passe modifié avec succès.', severity: 'success' })
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          (error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe') ||
          'Erreur lors du changement de mot de passe',
        severity: 'error',
      })
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <IconButton edge="start" sx={{ mr: 2 }}>
              <ArrowLeft size={24} />
            </IconButton>
          </Link>
          <Typography variant="h6" color="text.primary" fontWeight="bold">
            Paramètres du compte
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'visible',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="flex-start">
                <Box sx={{ position: 'relative', mx: 'auto' }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      fontSize: 32,
                      boxShadow: 3,
                    }}
                  >
                    {user?.prenom[0]}
                    {user?.nom[0]}
                  </Avatar>
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'white',
                      border: '1px solid #ddd',
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    <Camera size={16} color={theme.palette.text.secondary} />
                  </IconButton>
                </Box>
                <Box sx={{ flexGrow: 1, width: '100%' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Informations Personnelles
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Mettez à jour vos informations d&apos;identification sur la plateforme CESIZen.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Prénom"
                        name="prenom"
                        placeholder={user?.prenom}
                        value={profileData.prenom}
                        onChange={handleProfileChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <User size={18} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nom"
                        name="nom"
                        value={profileData.nom}
                        onChange={handleProfileChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <User size={18} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Adresse Email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Mail size={18} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save size={18} />}
                      onClick={handleSaveProfile}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                    >
                      Enregistrer les modifications
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" gap={2} alignItems="center" mb={1}>
                <ShieldCheck color={theme.palette.primary.main} />
                <Typography variant="h6" fontWeight="bold">
                  Sécurité & Mot de passe
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={3} ml={4.5}>
                Pour votre sécurité, nous recommandons un mot de passe fort (lettres, chiffres,
                caractères spéciaux).
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Stack spacing={3} maxWidth="sm">
                <TextField
                  fullWidth
                  label="Mot de passe actuel"
                  type="password"
                  name="current"
                  value={passwordData.current}
                  onChange={handlePasswordChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Nouveau mot de passe"
                  type="password"
                  name="new"
                  value={passwordData.new}
                  onChange={handlePasswordChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Confirmer le nouveau mot de passe"
                  type="password"
                  name="confirm"
                  value={passwordData.confirm}
                  onChange={handlePasswordChange}
                  error={
                    passwordData.new !== '' &&
                    passwordData.confirm !== '' &&
                    passwordData.new !== passwordData.confirm
                  }
                  helperText={
                    passwordData.new !== passwordData.confirm && passwordData.confirm !== ''
                      ? 'Les mots de passe ne correspondent pas'
                      : ''
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleSavePassword}
                    disabled={!passwordData.current || !passwordData.new}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                  >
                    Mettre à jour le mot de passe
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default UserSettingPage
