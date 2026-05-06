'use client'

import { adminService, type AdminContent } from '@/lib/services'
import {
  Alert,
  Box,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import { X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ConfirmDeleteModal, ContentFilters, ContentModal, ContentTable } from '../components'

type Content = AdminContent

interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

export default function ContentManagement() {
  // États pour les données
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContents, setSelectedContents] = useState<string[]>([])

  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'page' | 'article' | 'menu'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>(
    'all',
  )
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // États pour les modales
  const [contentModal, setContentModal] = useState<{
    open: boolean
    content?: Content | null
    loading: boolean
  }>({
    open: false,
    content: null,
    loading: false,
  })

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    content?: Content | null
    isBulk: boolean
    loading: boolean
  }>({
    open: false,
    content: null,
    isBulk: false,
    loading: false,
  })

  const [previewModal, setPreviewModal] = useState<{
    open: boolean
    content?: Content | null
  }>({
    open: false,
    content: null,
  })

  // État pour les notifications
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Charger les contenus au montage
  useEffect(() => {
    loadContents()
  }, [])

  const loadContents = async () => {
    try {
      setLoading(true)
      const { contents: data } = await adminService.getContents()
      setContents(data)
    } catch (error) {
      console.error('Erreur lors du chargement des contenus:', error)
      showSnackbar('Erreur lors du chargement des contenus', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les contenus selon les critères
  const filteredContents = useMemo(() => {
    return contents.filter((content) => {
      const matchesSearch =
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.content.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === 'all' || content.type === typeFilter
      const matchesStatus = statusFilter === 'all' || content.status === statusFilter
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && content.isActive) ||
        (activeFilter === 'inactive' && !content.isActive)

      return matchesSearch && matchesType && matchesStatus && matchesActive
    })
  }, [contents, searchQuery, typeFilter, statusFilter, activeFilter])

  const showSnackbar = (message: string, severity: SnackbarState['severity']) => {
    setSnackbar({ open: true, message, severity })
  }

  // Actions contenu
  const handleToggleActive = async (contentId: string, isActive: boolean) => {
    try {
      const updated = await adminService.toggleContentActive(contentId, isActive)
      setContents((prev) =>
        prev.map((content) => (content.id === contentId ? { ...content, ...updated } : content)),
      )
      showSnackbar(`Contenu ${isActive ? 'rendu visible' : 'masqué'} avec succès`, 'success')
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour de la visibilité', 'error')
    }
  }

  const handleCreateContent = () => {
    setContentModal({
      open: true,
      content: null,
      loading: false,
    })
  }

  const handleEditContent = (content: Content) => {
    setContentModal({
      open: true,
      content,
      loading: false,
    })
  }

  const handlePreviewContent = (content: Content) => {
    setPreviewModal({
      open: true,
      content,
    })
  }

  const handleDuplicateContent = async (content: Content) => {
    try {
      // Pas d'endpoint de duplication dans l'API : création d'une copie via createContent
      const copied = await adminService.createContent({
        title: `${content.title} (Copie)`,
        slug: content.slug ? `${content.slug}-copie` : undefined,
        type: content.type,
        content: content.content,
        isActive: false,
        order: content.order,
      })
      setContents((prev) => [...prev, copied])
      showSnackbar('Contenu dupliqué avec succès', 'success')
    } catch (error) {
      showSnackbar('Erreur lors de la duplication', 'error')
    }
  }

  const handleSaveContent = async (contentData: Content) => {
    try {
      setContentModal((prev) => ({ ...prev, loading: true }))

      if (contentData.id) {
        const updated = await adminService.updateContent(contentData.id, contentData)
        setContents((prev) =>
          prev.map((content) =>
            content.id === contentData.id ? { ...content, ...updated } : content,
          ),
        )
        showSnackbar('Contenu modifié avec succès', 'success')
      } else {
        const created = await adminService.createContent(contentData)
        setContents((prev) => [...prev, created])
        showSnackbar('Contenu créé avec succès', 'success')
      }

      setContentModal({ open: false, content: null, loading: false })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contenu:', error)
      const message = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      showSnackbar(message, 'error')
    } finally {
      setContentModal((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleDeleteContent = (content: Content) => {
    setDeleteModal({
      open: true,
      content,
      isBulk: false,
      loading: false,
    })
  }

  const handleBulkAction = (action: string) => {
    if (action === 'delete') {
      setDeleteModal({
        open: true,
        content: null,
        isBulk: true,
        loading: false,
      })
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }))

      if (deleteModal.isBulk) {
        await Promise.all(selectedContents.map((id) => adminService.deleteContent(id)))
        setContents((prev) => prev.filter((content) => !selectedContents.includes(content.id!)))
        setSelectedContents([])
        showSnackbar(`${selectedContents.length} contenus supprimés`, 'success')
      } else if (deleteModal.content?.id) {
        await adminService.deleteContent(deleteModal.content.id)
        setContents((prev) => prev.filter((content) => content.id !== deleteModal.content?.id))
        showSnackbar('Contenu supprimé avec succès', 'success')
      }

      setDeleteModal({ open: false, content: null, isBulk: false, loading: false })
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
            Gestion des contenus
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérer les pages, articles et éléments de menu
          </Typography>
        </Box>

        {/* Filtres */}
        <ContentFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          activeFilter={activeFilter}
          onActiveFilterChange={setActiveFilter}
          onCreateContent={handleCreateContent}
          selectedCount={selectedContents.length}
          onBulkAction={handleBulkAction}
        />

        {/* Table des contenus */}
        <ContentTable
          contents={filteredContents}
          loading={loading}
          onToggleActive={handleToggleActive}
          onEdit={handleEditContent}
          onDelete={handleDeleteContent}
          onDuplicate={handleDuplicateContent}
          onPreview={handlePreviewContent}
        />

        {/* Modal contenu */}
        <ContentModal
          open={contentModal.open}
          onClose={() => setContentModal({ open: false, content: null, loading: false })}
          onSave={handleSaveContent}
          content={contentModal.content}
          loading={contentModal.loading}
        />

        {/* Modal de prévisualisation */}
        <Dialog
          open={previewModal.open}
          onClose={() => setPreviewModal({ open: false, content: null })}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Aperçu du contenu</Typography>
              <IconButton onClick={() => setPreviewModal({ open: false, content: null })}>
                <X size={20} />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {previewModal.content && (
              <Box>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                  {previewModal.content.title}
                </Typography>
                {previewModal.content.excerpt && (
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 3, fontStyle: 'italic', color: 'text.secondary' }}
                  >
                    {previewModal.content.excerpt}
                  </Typography>
                )}
                <Box
                  sx={{
                    whiteSpace: 'pre-wrap',
                    '& strong': { fontWeight: 600 },
                    '& em': { fontStyle: 'italic' },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: previewModal.content.content
                      .replace(
                        /^# (.*)$/gm,
                        '<h1 style="font-size: 2rem; font-weight: 600; margin: 1rem 0;">$1</h1>',
                      )
                      .replace(
                        /^## (.*)$/gm,
                        '<h2 style="font-size: 1.5rem; font-weight: 600; margin: 0.8rem 0;">$1</h2>',
                      )
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/^- (.*)$/gm, '• $1')
                      .replace(
                        /\[([^\]]*)\]\(([^)]*)\)/g,
                        '<a href="$2" style="color: #1976d2;">$1</a>',
                      ),
                  }}
                />
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de confirmation de suppression */}
        <ConfirmDeleteModal
          open={deleteModal.open}
          onClose={() =>
            setDeleteModal({ open: false, content: null, isBulk: false, loading: false })
          }
          onConfirm={handleConfirmDelete}
          title={deleteModal.isBulk ? 'Supprimer les contenus' : 'Supprimer le contenu'}
          message={
            deleteModal.isBulk
              ? `Êtes-vous sûr de vouloir supprimer ${selectedContents.length} contenus sélectionnés ?`
              : `Êtes-vous sûr de vouloir supprimer le contenu "${deleteModal.content?.title}" ?`
          }
          warningMessage="Ce contenu ne sera plus accessible aux utilisateurs."
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
