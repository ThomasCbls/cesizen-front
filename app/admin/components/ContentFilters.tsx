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
import { Search, Filter, X, FilePlus } from 'lucide-react'

interface ContentFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  typeFilter: 'all' | 'page' | 'article' | 'menu'
  onTypeFilterChange: (type: 'all' | 'page' | 'article' | 'menu') => void
  statusFilter: 'all' | 'draft' | 'published' | 'archived'
  onStatusFilterChange: (status: 'all' | 'draft' | 'published' | 'archived') => void
  activeFilter: 'all' | 'active' | 'inactive'
  onActiveFilterChange: (active: 'all' | 'active' | 'inactive') => void
  onCreateContent: () => void
  selectedCount: number
  onBulkAction: (action: string) => void
}

export default function ContentFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  activeFilter,
  onActiveFilterChange,
  onCreateContent,
  selectedCount,
  onBulkAction,
}: ContentFiltersProps) {
  const [showAllFilters, setShowAllFilters] = useState(false)

  const clearFilters = () => {
    onSearchChange('')
    onTypeFilterChange('all')
    onStatusFilterChange('all')
    onActiveFilterChange('all')
  }

  const hasActiveFilters =
    searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || activeFilter !== 'all'

  const activeFiltersCount = [
    searchQuery,
    typeFilter !== 'all',
    statusFilter !== 'all',
    activeFilter !== 'all',
  ].filter(Boolean).length

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
            placeholder="Rechercher par titre, slug ou contenu..."
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
              Filtres {hasActiveFilters && `(${activeFiltersCount})`}
            </Button>

            <Button
              variant="contained"
              startIcon={<FilePlus size={16} />}
              onClick={onCreateContent}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Nouveau contenu
            </Button>
          </Stack>
        </Stack>

        {/* Filtres étendus */}
        {showAllFilters && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => onTypeFilterChange(e.target.value as any)}
              >
                <MenuItem value="all">Tous les types</MenuItem>
                <MenuItem value="page">Pages</MenuItem>
                <MenuItem value="article">Articles</MenuItem>
                <MenuItem value="menu">Éléments de menu</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={statusFilter}
                label="Statut"
                onChange={(e) => onStatusFilterChange(e.target.value as any)}
              >
                <MenuItem value="all">Tous les statuts</MenuItem>
                <MenuItem value="draft">Brouillons</MenuItem>
                <MenuItem value="published">Publiés</MenuItem>
                <MenuItem value="archived">Archivés</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Visibilité</InputLabel>
              <Select
                value={activeFilter}
                label="Visibilité"
                onChange={(e) => onActiveFilterChange(e.target.value as any)}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="active">Visibles</MenuItem>
                <MenuItem value="inactive">Masqués</MenuItem>
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
                {selectedCount} contenu{selectedCount > 1 ? 's' : ''} sélectionné
                {selectedCount > 1 ? 's' : ''}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button size="small" variant="outlined" onClick={() => onBulkAction('publish')}>
                  Publier
                </Button>
                <Button size="small" variant="outlined" onClick={() => onBulkAction('draft')}>
                  Brouillon
                </Button>
                <Button size="small" variant="outlined" onClick={() => onBulkAction('activate')}>
                  Rendre visible
                </Button>
                <Button size="small" variant="outlined" onClick={() => onBulkAction('deactivate')}>
                  Masquer
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
            {typeFilter !== 'all' && (
              <Chip
                label={`Type: ${typeFilter === 'page' ? 'Pages' : typeFilter === 'article' ? 'Articles' : 'Éléments de menu'}`}
                onDelete={() => onTypeFilterChange('all')}
                size="small"
                variant="outlined"
              />
            )}
            {statusFilter !== 'all' && (
              <Chip
                label={`Statut: ${statusFilter === 'draft' ? 'Brouillon' : statusFilter === 'published' ? 'Publié' : 'Archivé'}`}
                onDelete={() => onStatusFilterChange('all')}
                size="small"
                variant="outlined"
              />
            )}
            {activeFilter !== 'all' && (
              <Chip
                label={`Visibilité: ${activeFilter === 'active' ? 'Visible' : 'Masqué'}`}
                onDelete={() => onActiveFilterChange('all')}
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
