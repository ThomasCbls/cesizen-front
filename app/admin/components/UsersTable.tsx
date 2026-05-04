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
  Avatar,
  Tooltip,
  Box,
  Typography,
  Stack,
} from '@mui/material'
import { MoreVertical, Edit, Trash2, Shield, ShieldOff, UserCheck, UserX } from 'lucide-react'

interface User {
  id?: string
  email: string
  prenom: string
  nom: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  createdAt?: Date
  lastLoginAt?: Date
}

interface UsersTableProps {
  users: User[]
  loading?: boolean
  onToggleActive: (userId: string, isActive: boolean) => void
  onChangeRole: (userId: string, role: 'USER' | 'ADMIN') => void
  onDelete: (userId: string) => void
  onEdit: (user: User) => void
}

export default function UsersTable({
  users,
  loading = false,
  onToggleActive,
  onChangeRole,
  onDelete,
  onEdit,
}: UsersTableProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(users.map((user) => user.id).filter(Boolean) as string[])
    } else {
      setSelected([])
    }
  }

  const handleSelect = (userId: string) => {
    const selectedIndex = selected.indexOf(userId)
    let newSelected: string[] = []

    if (selectedIndex === -1) {
      newSelected = [...selected, userId]
    } else {
      newSelected = selected.filter((id) => id !== userId)
    }

    setSelected(newSelected)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget)
    setCurrentUser(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setCurrentUser(null)
  }

  const handleAction = (action: string) => {
    if (!currentUser) return

    switch (action) {
      case 'edit':
        onEdit(currentUser)
        break
      case 'toggle-active':
        onToggleActive(currentUser.id!, !currentUser.isActive)
        break
      case 'change-role':
        onChangeRole(currentUser.id!, currentUser.role === 'ADMIN' ? 'USER' : 'ADMIN')
        break
      case 'delete':
        onDelete(currentUser.id!)
        break
    }
    handleMenuClose()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  const paginatedUsers = users.slice(page * rowsPerPage, page + rowsPerPage)

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < users.length}
                  checked={users.length > 0 && selected.length === users.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Utilisateur</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rôle</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Inscription</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Dernière connexion</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: rowsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                        <Box
                          sx={{ width: 40, height: 40, bgcolor: '#f0f0f0', borderRadius: '50%' }}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                          <Box
                            sx={{
                              width: '200px',
                              height: 16,
                              bgcolor: '#f0f0f0',
                              borderRadius: 1,
                              mb: 1,
                            }}
                          />
                          <Box
                            sx={{ width: '150px', height: 12, bgcolor: '#f0f0f0', borderRadius: 1 }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              : paginatedUsers.map((user) => {
                  const isSelected = user.id ? selected.indexOf(user.id) !== -1 : false

                  return (
                    <TableRow
                      key={user.id || Math.random()}
                      hover
                      selected={isSelected}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isSelected} onChange={() => handleSelect(user.id!)} />
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                            {getInitials(user.prenom, user.nom)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {user.prenom} {user.nom}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                          color={user.role === 'ADMIN' ? 'error' : 'default'}
                          size="small"
                          icon={
                            user.role === 'ADMIN' ? <Shield size={16} /> : <UserCheck size={16} />
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Actif' : 'Inactif'}
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                          variant={user.isActive ? 'filled' : 'outlined'}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Jamais'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
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
        count={users.length}
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

        <MenuItem onClick={() => handleAction('toggle-active')}>
          {currentUser?.isActive ? (
            <UserX size={16} style={{ marginRight: 8 }} />
          ) : (
            <UserCheck size={16} style={{ marginRight: 8 }} />
          )}
          {currentUser?.isActive ? 'Désactiver' : 'Activer'}
        </MenuItem>

        <MenuItem onClick={() => handleAction('change-role')}>
          {currentUser?.role === 'ADMIN' ? (
            <ShieldOff size={16} style={{ marginRight: 8 }} />
          ) : (
            <Shield size={16} style={{ marginRight: 8 }} />
          )}
          {currentUser?.role === 'ADMIN' ? 'Retirer admin' : 'Promouvoir admin'}
        </MenuItem>

        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Supprimer
        </MenuItem>
      </Menu>
    </Paper>
  )
}
