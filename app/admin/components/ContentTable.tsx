'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Typography,
  Box,
  Switch,
  Tooltip,
  Avatar,
} from '@mui/material'
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Copy,
  ToggleLeft,
  ToggleRight,
  FileText,
  Calendar,
  User,
} from 'lucide-react'

interface Content {
  id?: string
  title: string
  slug: string
  type: 'page' | 'article' | 'menu'
  status: 'draft' | 'published' | 'archived'
  isActive: boolean
  author?: {
    prenom: string
    nom: string
  }
  createdAt?: Date
  updatedAt?: Date
  publishedAt?: Date
  excerpt?: string
  content: string
  order?: number
}

interface ContentTableProps {
  contents: Content[]
  loading?: boolean
  onToggleActive: (contentId: string, isActive: boolean) => void
  onEdit: (content: Content) => void
  onDelete: (content: Content) => void
  onDuplicate: (content: Content) => void
  onPreview: (content: Content) => void
}

export default function ContentTable({
  contents,
  loading = false,
  onToggleActive,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
}: ContentTableProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [currentContent, setCurrentContent] = useState<Content | null>(null)

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(contents.map((content) => content.id).filter(Boolean) as string[])
    } else {
      setSelected([])
    }
  }

  const handleSelect = (contentId: string) => {
    const selectedIndex = selected.indexOf(contentId)
    let newSelected: string[] = []

    if (selectedIndex === -1) {
      newSelected = [...selected, contentId]
    } else {
      newSelected = selected.filter((id) => id !== contentId)
    }

    setSelected(newSelected)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, content: Content) => {
    setAnchorEl(event.currentTarget)
    setCurrentContent(content)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setCurrentContent(null)
  }

  const handleAction = (action: string) => {
    if (!currentContent) return

    switch (action) {
      case 'edit':
        onEdit(currentContent)
        break
      case 'preview':
        onPreview(currentContent)
        break
      case 'duplicate':
        onDuplicate(currentContent)
        break
      case 'delete':
        onDelete(currentContent)
        break
    }
    handleMenuClose()
  }

  const getStatusColor = (status: Content['status']) => {
    switch (status) {
      case 'published':
        return 'success'
      case 'draft':
        return 'warning'
      case 'archived':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: Content['status']) => {
    switch (status) {
      case 'published':
        return 'Publié'
      case 'draft':
        return 'Brouillon'
      case 'archived':
        return 'Archivé'
      default:
        return status
    }
  }

  const getTypeColor = (type: Content['type']) => {
    switch (type) {
      case 'page':
        return 'primary'
      case 'article':
        return 'secondary'
      case 'menu':
        return 'info'
      default:
        return 'default'
    }
  }

  const getTypeLabel = (type: Content['type']) => {
    switch (type) {
      case 'page':
        return 'Page'
      case 'article':
        return 'Article'
      case 'menu':
        return 'Menu'
      default:
        return type
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const paginatedContents = contents.slice(page * rowsPerPage, page + rowsPerPage)

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < contents.length}
                  checked={contents.length > 0 && selected.length === contents.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actif</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Auteur</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dernière modification</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                        <Box sx={{ width: 40, height: 40, bgcolor: '#f0f0f0', borderRadius: 1 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Box
                            sx={{
                              width: '250px',
                              height: 16,
                              bgcolor: '#f0f0f0',
                              borderRadius: 1,
                              mb: 1,
                            }}
                          />
                          <Box
                            sx={{ width: '180px', height: 12, bgcolor: '#f0f0f0', borderRadius: 1 }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              : paginatedContents.map((content) => {
                  const isSelected = content.id ? selected.indexOf(content.id) !== -1 : false

                  return (
                    <TableRow
                      key={content.id || Math.random()}
                      hover
                      selected={isSelected}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isSelected} onChange={() => handleSelect(content.id!)} />
                      </TableCell>

                      <TableCell>
                        <Stack spacing={1}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {content.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            /{content.slug}
                          </Typography>
                          {content.excerpt && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {content.excerpt}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getTypeLabel(content.type)}
                          color={getTypeColor(content.type)}
                          size="small"
                          icon={<FileText size={16} />}
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatusLabel(content.status)}
                          color={getStatusColor(content.status)}
                          size="small"
                          variant={content.status === 'published' ? 'filled' : 'outlined'}
                        />
                      </TableCell>

                      <TableCell>
                        <Switch
                          checked={content.isActive}
                          onChange={(e) => onToggleActive(content.id!, e.target.checked)}
                          size="small"
                          color="primary"
                        />
                      </TableCell>

                      <TableCell>
                        {content.author ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {content.author.prenom.charAt(0)}
                              {content.author.nom.charAt(0)}
                            </Avatar>
                            <Typography variant="caption" color="text.secondary">
                              {content.author.prenom} {content.author.nom}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Auteur inconnu
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {content.updatedAt ? formatDate(content.updatedAt) : 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, content)}>
                          <MoreVertical size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={contents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10))
          setPage(0)
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleAction('edit')}>
          <Edit size={16} style={{ marginRight: 8 }} />
          Modifier
        </MenuItem>

        <MenuItem onClick={() => handleAction('preview')}>
          <Eye size={16} style={{ marginRight: 8 }} />
          Prévisualiser
        </MenuItem>

        <MenuItem onClick={() => handleAction('duplicate')}>
          <Copy size={16} style={{ marginRight: 8 }} />
          Dupliquer
        </MenuItem>

        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Supprimer
        </MenuItem>
      </Menu>
    </Paper>
  )
}
