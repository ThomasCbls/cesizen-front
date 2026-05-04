'use client'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Alert,
} from '@mui/material'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface ConfirmDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  warningMessage?: string
  confirmText?: string
  loading?: boolean
}

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  warningMessage,
  confirmText = 'Supprimer',
  loading = false,
}: ConfirmDeleteModalProps) {
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
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: 'error.lighter',
              color: 'error.main',
            }}
          >
            <AlertTriangle size={24} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Typography variant="body1" color="text.primary">
            {message}
          </Typography>

          {warningMessage && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {warningMessage}
            </Alert>
          )}

          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Cette action est irréversible.</strong> Toutes les données associées seront
              définitivement supprimées.
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={<Trash2 size={16} />}
        >
          {loading ? 'Suppression...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
