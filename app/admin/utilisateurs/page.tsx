'use client'

import { useState, useEffect, useMemo } from 'react'
import { Container, Typography, Stack, Box, Snackbar, Alert } from '@mui/material'
import { UsersTable, UsersFilters, UserModal, ConfirmDeleteModal } from '../components'

// Types pour les utilisateurs
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

interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

export default function UsersManagement() {
  // États pour les données
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'USER' | 'ADMIN'>('all')

  // États pour les modales
  const [userModal, setUserModal] = useState<{
    open: boolean
    user?: User | null
    loading: boolean
  }>({
    open: false,
    user: null,
    loading: false,
  })

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    user?: User | null
    isBulk: boolean
    loading: boolean
  }>({
    open: false,
    user: null,
    isBulk: false,
    loading: false,
  })

  // État pour les notifications
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Charger les utilisateurs au montage
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)

      // Simulation d'appel API - À remplacer par vraie API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Données mockées
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@cesizen.fr',
          prenom: 'Admin',
          nom: 'CESIZen',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          lastLoginAt: new Date(),
        },
        {
          id: '2',
          email: 'marie.dubois@email.com',
          prenom: 'Marie',
          nom: 'Dubois',
          role: 'USER',
          isActive: true,
          createdAt: new Date('2024-02-20'),
          lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
        },
        {
          id: '3',
          email: 'pierre.martin@email.com',
          prenom: 'Pierre',
          nom: 'Martin',
          role: 'USER',
          isActive: false,
          createdAt: new Date('2024-03-10'),
          lastLoginAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
        },
        {
          id: '4',
          email: 'sophie.leroy@email.com',
          prenom: 'Sophie',
          nom: 'Leroy',
          role: 'USER',
          isActive: true,
          createdAt: new Date('2024-04-05'),
          lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Il y a 1 heure
        },
        {
          id: '5',
          email: 'thomas.bernard@email.com',
          prenom: 'Thomas',
          nom: 'Bernard',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date('2024-01-25'),
          lastLoginAt: new Date(Date.now() - 30 * 60 * 1000), // Il y a 30 minutes
        },
      ]

      setUsers(mockUsers)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      showSnackbar('Erreur lors du chargement des utilisateurs', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les utilisateurs selon les critères
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive)

      const matchesRole = roleFilter === 'all' || user.role === roleFilter

      return matchesSearch && matchesStatus && matchesRole
    })
  }, [users, searchQuery, statusFilter, roleFilter])

  const showSnackbar = (message: string, severity: SnackbarState['severity']) => {
    setSnackbar({ open: true, message, severity })
  }

  // Actions utilisateur
  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, isActive } : user)))

      showSnackbar(`Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`, 'success')
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour du statut', 'error')
    }
  }

  const handleChangeRole = async (userId: string, role: 'USER' | 'ADMIN') => {
    try {
      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)))

      showSnackbar(
        `Rôle modifié vers ${role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}`,
        'success',
      )
    } catch (error) {
      showSnackbar('Erreur lors de la modification du rôle', 'error')
    }
  }

  const handleCreateUser = () => {
    setUserModal({
      open: true,
      user: null,
      loading: false,
    })
  }

  const handleEditUser = (user: User) => {
    setUserModal({
      open: true,
      user,
      loading: false,
    })
  }

  const handleSaveUser = async (userData: User) => {
    try {
      setUserModal((prev) => ({ ...prev, loading: true }))

      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (userData.id) {
        // Modification
        setUsers((prev) => prev.map((user) => (user.id === userData.id ? { ...userData } : user)))
        showSnackbar('Utilisateur modifié avec succès', 'success')
      } else {
        // Création
        const newUser = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date(),
        }
        setUsers((prev) => [...prev, newUser])
        showSnackbar('Utilisateur créé avec succès', 'success')
      }

      setUserModal({ open: false, user: null, loading: false })
    } catch (error) {
      showSnackbar('Erreur lors de la sauvegarde', 'error')
    } finally {
      setUserModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setDeleteModal({
        open: true,
        user,
        isBulk: false,
        loading: false,
      })
    }
  }

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'activate':
        // Activer tous les utilisateurs sélectionnés
        break
      case 'deactivate':
        // Désactiver tous les utilisateurs sélectionnés
        break
      case 'delete':
        setDeleteModal({
          open: true,
          user: null,
          isBulk: true,
          loading: false,
        })
        break
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }))

      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (deleteModal.isBulk) {
        // Suppression en masse
        setUsers((prev) => prev.filter((user) => !selectedUsers.includes(user.id!)))
        setSelectedUsers([])
        showSnackbar(`${selectedUsers.length} utilisateurs supprimés`, 'success')
      } else if (deleteModal.user) {
        // Suppression individuelle
        setUsers((prev) => prev.filter((user) => user.id !== deleteModal.user?.id))
        showSnackbar('Utilisateur supprimé avec succès', 'success')
      }

      setDeleteModal({ open: false, user: null, isBulk: false, loading: false })
    } catch (error) {
      showSnackbar('Erreur lors de la suppression', 'error')
    } finally {
      setDeleteModal((prev) => ({ ...prev, loading: false }))
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 0 }}>
      <Stack spacing={4}>
        {/* En-tête */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: 'text.primary',
            }}
          >
            Gestion des utilisateurs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérer les comptes utilisateurs et leurs permissions
          </Typography>
        </Box>

        {/* Filtres */}
        <UsersFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          onCreateUser={handleCreateUser}
          selectedCount={selectedUsers.length}
          onBulkAction={handleBulkAction}
        />

        {/* Table des utilisateurs */}
        <UsersTable
          users={filteredUsers}
          loading={loading}
          onToggleActive={handleToggleActive}
          onChangeRole={handleChangeRole}
          onDelete={handleDeleteUser}
          onEdit={handleEditUser}
        />

        {/* Modal utilisateur */}
        <UserModal
          open={userModal.open}
          onClose={() => setUserModal({ open: false, user: null, loading: false })}
          onSave={handleSaveUser}
          user={userModal.user}
          loading={userModal.loading}
        />

        {/* Modal de confirmation de suppression */}
        <ConfirmDeleteModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, user: null, isBulk: false, loading: false })}
          onConfirm={handleConfirmDelete}
          title={deleteModal.isBulk ? 'Supprimer les utilisateurs' : "Supprimer l'utilisateur"}
          message={
            deleteModal.isBulk
              ? `Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateurs sélectionnés ?`
              : `Êtes-vous sûr de vouloir supprimer l'utilisateur ${deleteModal.user?.prenom} ${deleteModal.user?.nom} ?`
          }
          warningMessage={
            deleteModal.isBulk
              ? 'Tous les diagnostics et données associées à ces utilisateurs seront également supprimés.'
              : 'Tous les diagnostics et données associées à cet utilisateur seront également supprimés.'
          }
          loading={deleteModal.loading}
        />

        {/* Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </Container>
  )
}
