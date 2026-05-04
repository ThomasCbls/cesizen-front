'use client'

import { useState } from 'react'
import {
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Box,
  Typography,
} from '@mui/material'
import { Search, Filter, X, UserPlus } from 'lucide-react'

interface FiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: 'all' | 'active' | 'inactive'
  onStatusFilterChange: (status: 'all' | 'active' | 'inactive') => void
  roleFilter: 'all' | 'USER' | 'ADMIN'
  onRoleFilterChange: (role: 'all' | 'USER' | 'ADMIN') => void
  onCreateUser: () => void
  selectedCount: number
  onBulkAction: (action: string) => void
}

export default function UsersFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
  onCreateUser,
  selectedCount,
  onBulkAction,
}: FiltersProps) {
  const [showAllFilters, setShowAllFilters] = useState(false)

  const clearFilters = () => {
    onSearchChange('')
    onStatusFilterChange('all')
    onRoleFilterChange('all')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || roleFilter !== 'all'

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        mb: 3,
      }}
    >
      <Stack spacing={3}>
        {/* Ligne principale avec recherche et actions */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: { md: 400 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={() => onSearchChange('')}
                    sx={{ minWidth: 'auto', p: 0.5 }}
                  >
                    <X size={16} />
                  </Button>
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Filter size={16} />}
              onClick={() => setShowAllFilters(!showAllFilters)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Filtres{' '}
              {hasActiveFilters &&
                `(${[searchQuery, statusFilter !== 'all', roleFilter !== 'all'].filter(Boolean).length})`}
            </Button>

            <Button
              variant="contained"
              startIcon={<UserPlus size={16} />}
              onClick={onCreateUser}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Nouvel utilisateur
            </Button>
          </Stack>
        </Stack>

        {/* Filtres étendus */}
        {showAllFilters && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={statusFilter}
                label="Statut"
                onChange={(e) => onStatusFilterChange(e.target.value as any)}
              >
                <MenuItem value="all">Tous les statuts</MenuItem>
                <MenuItem value="active">Actifs seulement</MenuItem>
                <MenuItem value="inactive">Inactifs seulement</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={roleFilter}
                label="Rôle"
                onChange={(e) => onRoleFilterChange(e.target.value as any)}
              >
                <MenuItem value="all">Tous les rôles</MenuItem>
                <MenuItem value="USER">Utilisateurs</MenuItem>
                <MenuItem value="ADMIN">Administrateurs</MenuItem>
              </Select>
            </FormControl>

            {hasActiveFilters && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<X size={16} />}
                onClick={clearFilters}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Effacer les filtres
              </Button>
            )}
          </Stack>
        )}

        {/* Actions en masse */}
        {selectedCount > 0 && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.lighter',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'primary.main',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selectedCount} utilisateur{selectedCount > 1 ? 's' : ''} sélectionné
                {selectedCount > 1 ? 's' : ''}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button size="small" variant="outlined" onClick={() => onBulkAction('activate')}>
                  Activer
                </Button>
                <Button size="small" variant="outlined" onClick={() => onBulkAction('deactivate')}>
                  Désactiver
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => onBulkAction('delete')}
                >
                  Supprimer
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Chips des filtres actifs */}
        {hasActiveFilters && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {searchQuery && (
              <Chip
                label={`Recherche: "${searchQuery}"`}
                onDelete={() => onSearchChange('')}
                size="small"
                variant="outlined"
              />
            )}
            {statusFilter !== 'all' && (
              <Chip
                label={`Statut: ${statusFilter === 'active' ? 'Actif' : 'Inactif'}`}
                onDelete={() => onStatusFilterChange('all')}
                size="small"
                variant="outlined"
              />
            )}
            {roleFilter !== 'all' && (
              <Chip
                label={`Rôle: ${roleFilter === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}`}
                onDelete={() => onRoleFilterChange('all')}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}
