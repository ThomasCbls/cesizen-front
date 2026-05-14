'use client'

import { type AdminContent } from '@/lib/services'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { Bold, FileText, Italic, Link, List, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ContentModalProps {
  open: boolean
  onClose: () => void
  onSave: (content: Partial<AdminContent>) => Promise<void> | void
  content?: AdminContent | null
  loading?: boolean
}

export default function ContentModal({
  open,
  onClose,
  onSave,
  content,
  loading = false,
}: ContentModalProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState<Partial<AdminContent>>({
    title: '',
    slug: '',
    type: 'article',
    status: 'draft',
    isActive: true,
    excerpt: '',
    content: '',
    order: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = Boolean(content?.id)

  useEffect(() => {
    if (content) {
      setFormData(content)
    } else {
      setFormData({
        title: '',
        slug: '',
        type: 'article',
        status: 'draft',
        isActive: true,
        excerpt: '',
        content: '',
        order: 0,
      })
    }
    setErrors({})
    setActiveTab(0)
  }, [content, open])

  // Génération automatique du slug basé sur le titre
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Éviter les tirets multiples
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData?.title?.trim()) {
      newErrors.title = 'Le titre est requis'
    } else if (formData?.title?.trim().length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères'
    }

    if (!formData?.slug?.trim()) {
      newErrors.slug = 'Le slug est requis'
    } else if (!/^[a-z0-9-]+$/.test(formData?.slug)) {
      newErrors.slug = 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'
    }

    if (!formData?.content?.trim()) {
      newErrors.content = 'Le contenu est requis'
    }

    if (formData?.excerpt && formData?.excerpt.length > 200) {
      newErrors.excerpt = "L'extrait ne peut pas dépasser 200 caractères"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const contentData = {
      ...formData,
      title: formData?.title?.trim(),
      slug: formData?.slug?.trim(),
      content: formData?.content?.trim(),
      excerpt: formData?.excerpt?.trim() || undefined,
    }

    onSave(contentData)
  }

  const handleInputChange = (field: keyof AdminContent, value: string | boolean | number) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Générer automatiquement le slug si on modifie le titre et qu'on est en création
      if (field === 'title' && !isEdit && typeof value === 'string') {
        newData.slug = generateSlug(value)
      }

      return newData
    })

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Simple toolbar pour l'éditeur
  const insertFormatting = (tag: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData?.content?.substring(start, end) || ''

    let newContent = formData.content

    switch (tag) {
      case 'bold':
        newContent =
          formData?.content?.substring(0, start) +
          `**${selectedText || 'texte en gras'}**` +
          formData?.content?.substring(end)
        break
      case 'italic':
        newContent =
          formData?.content?.substring(0, start) +
          `*${selectedText || 'texte en italique'}*` +
          formData?.content?.substring(end)
        break
      case 'list':
        newContent =
          formData?.content?.substring(0, start) +
          `\n- Élément de liste\n` +
          formData?.content?.substring(end)
        break
      case 'link':
        newContent =
          formData?.content?.substring(0, start) +
          `[${selectedText || 'texte du lien'}](http://exemple.com)` +
          formData?.content?.substring(end)
        break
    }

    setFormData((prev) => ({ ...prev, content: newContent }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, height: '80vh' },
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
              <FileText size={20} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {isEdit ? 'Modifier le contenu' : 'Nouveau contenu'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? 'Modifier les informations du contenu' : 'Créer un nouveau contenu'}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <X size={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab label="Contenu" />
          <Tab label="Paramètres" />
          <Tab label="Aperçu" />
        </Tabs>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {activeTab === 0 && (
            <Stack spacing={3}>
              <TextField
                label="Titre"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={Boolean(errors.title)}
                helperText={errors.title}
                fullWidth
                required
              />

              <TextField
                label="Slug (URL)"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                error={Boolean(errors.slug)}
                helperText={errors.slug || "Utilisé dans l'URL de la page"}
                fullWidth
                required
              />

              <TextField
                label="Extrait (optionnel)"
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                error={Boolean(errors.excerpt)}
                helperText={errors.excerpt || `${formData.excerpt?.length || 0}/200 caractères`}
                fullWidth
                multiline
                rows={2}
              />

              {/* Toolbar simple */}
              <Paper sx={{ p: 1, bgcolor: '#f8fafc' }}>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => insertFormatting('bold')}>
                    <Bold size={16} />
                  </IconButton>
                  <IconButton size="small" onClick={() => insertFormatting('italic')}>
                    <Italic size={16} />
                  </IconButton>
                  <IconButton size="small" onClick={() => insertFormatting('list')}>
                    <List size={16} />
                  </IconButton>
                  <IconButton size="small" onClick={() => insertFormatting('link')}>
                    <Link size={16} />
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{ alignSelf: 'center', ml: 2, color: 'text.secondary' }}
                  >
                    Markdown supporté
                  </Typography>
                </Stack>
              </Paper>

              <TextField
                id="content-editor"
                label="Contenu"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                error={Boolean(errors.content)}
                helperText={errors.content || 'Vous pouvez utiliser Markdown pour la mise en forme'}
                fullWidth
                multiline
                rows={12}
                required
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '0.875rem',
                  },
                }}
              />
            </Stack>
          )}

          {activeTab === 1 && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Stack spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel>Type de contenu</InputLabel>
                    <Select
                      value={formData.type}
                      label="Type de contenu"
                      onChange={(e) => handleInputChange('type', e.target.value)}
                    >
                      <MenuItem value="page">Page</MenuItem>
                      <MenuItem value="article">Article</MenuItem>
                      <MenuItem value="menu">Élément de menu</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={formData.status}
                      label="Statut"
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <MenuItem value="draft">Brouillon</MenuItem>
                      <MenuItem value="published">Publié</MenuItem>
                      <MenuItem value="archived">Archivé</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Ordre d'affichage"
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                    helperText="Ordre d'affichage dans les menus (plus petit = en premier)"
                    fullWidth
                  />
                </Stack>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Stack spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Contenu visible"
                  />

                  {formData.status === 'published' && (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Ce contenu est publié et visible par les utilisateurs.
                    </Alert>
                  )}

                  {formData.status === 'draft' && (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      Ce contenu est en brouillon et n'est pas visible par les utilisateurs.
                    </Alert>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}

          {activeTab === 2 && (
            <Stack spacing={2}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Aperçu du rendu (Markdown basique supporté)
              </Alert>

              <Paper sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                  {formData.title || 'Titre du contenu'}
                </Typography>

                {formData.excerpt && (
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 3, fontStyle: 'italic', color: 'text.secondary' }}
                  >
                    {formData.excerpt}
                  </Typography>
                )}

                <Box
                  sx={{
                    whiteSpace: 'pre-wrap',
                    '& strong': { fontWeight: 600 },
                    '& em': { fontStyle: 'italic' },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: (formData?.content || '')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/^- (.*)$/gm, '• $1')
                      .replace(
                        /\[([^\]]*)\]\(([^)]*)\)/g,
                        '<a href="$2" style="color: #1976d2;">$1</a>',
                      ),
                  }}
                />
              </Paper>
            </Stack>
          )}
        </Box>
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
