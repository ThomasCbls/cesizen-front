'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Container,
  Typography,
  Stack,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material'
import { X } from 'lucide-react'
import { ContentTable, ContentFilters, ContentModal, ConfirmDeleteModal } from '../components'

// Types pour les contenus
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

      // Simulation d'appel API - À remplacer par vraie API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Données mockées
      const mockContents: Content[] = [
        {
          id: '1',
          title: 'Guide de gestion du stress au travail',
          slug: 'guide-gestion-stress-travail',
          type: 'article',
          status: 'published',
          isActive: true,
          author: { prenom: 'Admin', nom: 'CESIZen' },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          publishedAt: new Date('2024-01-20'),
          excerpt:
            'Découvrez des techniques efficaces pour gérer le stress professionnel et améliorer votre bien-être au quotidien.',
          content:
            '# Guide de gestion du stress au travail\n\nLe stress au travail est un phénomène courant qui peut avoir des impacts significatifs sur la santé et la productivité.\n\n## Techniques de relaxation\n\n- Respiration profonde\n- Méditation de pleine conscience\n- Exercices physiques réguliers\n\n## Organisation du travail\n\n- Priorisation des tâches\n- Gestion du temps\n- Pauses régulières',
          order: 1,
        },
        {
          id: '2',
          title: "Conditions générales d'utilisation",
          slug: 'conditions-generales-utilisation',
          type: 'page',
          status: 'published',
          isActive: true,
          author: { prenom: 'Admin', nom: 'CESIZen' },
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          publishedAt: new Date('2024-01-10'),
          content:
            "# Conditions générales d'utilisation\n\n## Article 1 - Objet\n\nLes présentes conditions générales...\n\n## Article 2 - Acceptation\n\nL'utilisation de la plateforme implique...",
          order: 10,
        },
        {
          id: '3',
          title: "Burnout : signaux d'alarme",
          slug: 'burnout-signaux-alarme',
          type: 'article',
          status: 'draft',
          isActive: false,
          author: { prenom: 'Marie', nom: 'Dubois' },
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-05'),
          excerpt:
            "Reconnaître les premiers signes du burnout pour agir avant qu'il ne soit trop tard.",
          content:
            "# Burnout : reconnaître les signaux d'alarme\n\n*Article en cours de rédaction*\n\nLe burnout, ou épuisement professionnel, est un état de fatigue physique, émotionnelle et mentale...",
          order: 2,
        },
        {
          id: '4',
          title: "Ressources d'aide",
          slug: 'ressources-aide',
          type: 'menu',
          status: 'published',
          isActive: true,
          author: { prenom: 'Admin', nom: 'CESIZen' },
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-12'),
          publishedAt: new Date('2024-01-12'),
          content:
            "# Ressources d'aide\n\n## Numéros utiles\n\n- **SOS Amitié**: 09 72 39 40 50\n- **Suicide Écoute**: 01 45 39 40 00\n\n## Sites web recommandés\n\n- [Psycom](http://www.psycom.org)\n- [France Dépression](http://www.france-depression.org)",
          order: 5,
        },
      ]

      setContents(mockContents)
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
      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setContents((prev) =>
        prev.map((content) => (content.id === contentId ? { ...content, isActive } : content)),
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
      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const duplicatedContent = {
        ...content,
        id: Date.now().toString(),
        title: `${content.title} (Copie)`,
        slug: `${content.slug}-copie`,
        status: 'draft' as const,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: undefined,
      }

      setContents((prev) => [...prev, duplicatedContent])
      showSnackbar('Contenu dupliqué avec succès', 'success')
    } catch (error) {
      showSnackbar('Erreur lors de la duplication', 'error')
    }
  }

  const handleSaveContent = async (contentData: Content) => {
    try {
      setContentModal((prev) => ({ ...prev, loading: true }))

      // Simulation API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (contentData.id) {
        // Modification
        setContents((prev) =>
          prev.map((content) =>
            content.id === contentData.id
              ? {
                  ...contentData,
                  updatedAt: new Date(),
                  publishedAt:
                    contentData.status === 'published' ? new Date() : contentData.publishedAt,
                  author: prev.find((c) => c.id === contentData.id)?.author || {
                    prenom: 'Admin',
                    nom: 'CESIZen',
                  },
                }
              : content,
          ),
        )
        showSnackbar('Contenu modifié avec succès', 'success')
      } else {
        // Création
        const newContent = {
          ...contentData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: contentData.status === 'published' ? new Date() : undefined,
          author: { prenom: 'Admin', nom: 'CESIZen' }, // À remplacer par l'utilisateur connecté
        }
        setContents((prev) => [...prev, newContent])
        showSnackbar('Contenu créé avec succès', 'success')
      }

      setContentModal({ open: false, content: null, loading: false })
    } catch (error) {
      showSnackbar('Erreur lors de la sauvegarde', 'error')
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
    switch (action) {
      case 'publish':
      case 'draft':
      case 'activate':
      case 'deactivate':
        // Implémenter les actions en masse
        break
      case 'delete':
        setDeleteModal({
          open: true,
          content: null,
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
        setContents((prev) => prev.filter((content) => !selectedContents.includes(content.id!)))
        setSelectedContents([])
        showSnackbar(`${selectedContents.length} contenus supprimés`, 'success')
      } else if (deleteModal.content) {
        // Suppression individuelle
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
