'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  Typography,
  IconButton,
} from '@mui/material'
import { X, Save, User } from 'lucide-react'

interface User {
  id?: string
  email: string
  prenom: string
  nom: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  password?: string
}

interface UserModalProps {
  open: boolean
  onClose: () => void
  onSave: (user: User) => Promise<void> | void
  user?: User | null
  loading?: boolean
}

export default function UserModal({
  open,
  onClose,
  onSave,
  user,
  loading = false,
}: UserModalProps) {
  const [formData, setFormData] = useState<User>({
    email: '',
    prenom: '',
    nom: '',
    role: 'USER',
    isActive: true,
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)

  const isEdit = Boolean(user?.id)

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        password: '', // Ne pas pré-remplir le mot de passe
      })
      setShowPassword(false)
    } else {
      // Réinitialiser pour nouveau utilisateur
      setFormData({
        email: '',
        prenom: '',
        nom: '',
        role: 'USER',
        isActive: true,
        password: '',
      })
      setShowPassword(true)
    }
    setErrors({})
  }, [user, open])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis'
    } else if (formData.prenom.trim().length < 2) {
      newErrors.prenom = 'Le prénom doit contenir au moins 2 caractères'
    }

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis'
    } else if (formData.nom.trim().length < 2) {
      newErrors.nom = 'Le nom doit contenir au moins 2 caractères'
    }

    if (!isEdit && !formData.password) {
      newErrors.password = 'Le mot de passe est requis pour un nouvel utilisateur'
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const userData = {
      ...formData,
      prenom: formData.prenom.trim(),
      nom: formData.nom.trim(),
      email: formData.email.trim().toLowerCase(),
    }

    // Ne pas envoyer le mot de passe s'il est vide en mode édition
    if (isEdit && !formData.password) {
      delete userData.password
    }

    onSave(userData)
  }

  const handleInputChange = (field: keyof User, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}
            >
              <User size={20} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {isEdit ? "Modifier l'utilisateur" : 'Nouvel utilisateur'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit
                  ? "Modifier les informations de l'utilisateur"
                  : 'Créer un nouveau compte utilisateur'}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {!isEdit && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Un email de bienvenue sera automatiquement envoyé à l'utilisateur avec ses
              identifiants.
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Prénom"
              value={formData.prenom}
              onChange={(e) => handleInputChange('prenom', e.target.value)}
              error={Boolean(errors.prenom)}
              helperText={errors.prenom}
              fullWidth
              required
            />
            <TextField
              label="Nom"
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              error={Boolean(errors.nom)}
              helperText={errors.nom}
              fullWidth
              required
            />
          </Stack>

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            fullWidth
            required
            disabled={isEdit} // Ne pas permettre de changer l'email en édition
          />

          {(showPassword || !isEdit) && (
            <TextField
              label={isEdit ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={Boolean(errors.password)}
              helperText={
                errors.password ||
                (isEdit ? 'Laisser vide pour conserver le mot de passe actuel' : '')
              }
              fullWidth
              required={!isEdit}
            />
          )}

          {isEdit && !showPassword && (
            <Button
              variant="outlined"
              onClick={() => setShowPassword(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              Changer le mot de passe
            </Button>
          )}

          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={formData.role}
                label="Rôle"
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <MenuItem value="USER">Utilisateur</MenuItem>
                <MenuItem value="ADMIN">Administrateur</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  color="primary"
                />
              }
              label="Compte actif"
            />
          </Stack>

          {formData.role === 'ADMIN' && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Attention:</strong> Les administrateurs ont accès à toutes les
                fonctionnalités de gestion de la plateforme. Accordez ce rôle avec précaution.
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={<Save size={16} />}
        >
          {loading ? 'Sauvegarde...' : isEdit ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
