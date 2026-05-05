'use client'

import { useRequireAuth } from '@/contexts'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { BrainIcon, LogOut, Newspaper, Settings, Target, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

// Articles temporaires (à remplacer par fetch depuis le backend)
const adminArticles = [
  {
    id: 1,
    title: "Comprendre l'échelle de Holmes et Rahe",
    summary:
      'Découvrez comment les événements de vie impactent votre niveau de stress selon cette méthode scientifique.',
    category: 'Prévention',
    image:
      'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&w=600&q=80',
    date: '12 Jan 2024',
  },
  {
    id: 2,
    title: '5 techniques de respiration immédiate',
    summary: 'Apprenez la cohérence cardiaque pour réduire votre anxiété en moins de 5 minutes.',
    category: 'Conseil',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    date: '10 Jan 2024',
  },
  {
    id: 3,
    title: "L'importance du sommeil sur le mental",
    summary: "Une bonne hygiène de sommeil est le premier pilier d'une bonne santé mentale.",
    category: 'Santé',
    image:
      'https://images.unsplash.com/photo-1541781777621-713b4331e21e?auto=format&fit=crop&w=600&q=80',
    date: '08 Jan 2024',
  },
]

const HomePage = () => {
  // Nouveau système d'authentification
  const { user, logout, isLoading } = useRequireAuth()

  const theme = useTheme()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const handleLogout = async () => {
    handleClose()
    await logout()
  }

  const goToDiagnostic = () => {
    router.push('/diagnostic')
  }

  const goToHistory = () => {
    router.push('/history')
  }

  const goToSettings = () => {
    handleClose()
    router.push('/user-setting')
  }

  // Affichage de chargement
  if (isLoading) {
    return (
      <Box
        sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Typography variant="h6" color="textSecondary">
          Chargement...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Box sx={{ p: 0.5, bgcolor: 'primary.main', borderRadius: 1, display: 'flex' }}>
              <BrainIcon color="white" size={24} />
            </Box>
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight="bold"
              sx={{ letterSpacing: '-0.5px' }}
            >
              CESIZen
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" gap={2}>
            <Button
              variant="text"
              startIcon={<BrainIcon size={18} />}
              onClick={goToDiagnostic}
              sx={{ display: { xs: 'none', md: 'flex' }, fontWeight: 600 }}
            >
              Diagnostic
            </Button>

            <Button
              variant="text"
              startIcon={<TrendingUp size={18} />}
              onClick={goToHistory}
              sx={{ display: { xs: 'none', md: 'flex' }, fontWeight: 600 }}
            >
              Historique
            </Button>

            <Tooltip title="Mon compte">
              <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ml: 1, border: '1px solid', borderColor: 'divider' }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
                  {user ? `${user.prenom[0]}${user.nom[0]}` : 'NC'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1.5,
              minWidth: 180,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {user && (
          <>
            <MenuItem onClick={goToSettings}>
              <ListItemIcon>
                <Settings size={16} />
              </ListItemIcon>
              Paramètres
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogOut size={16} color={theme.palette.error.main} />
              </ListItemIcon>
              Déconnexion
            </MenuItem>
          </>
        )}
      </Menu>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            mb: 6,
            p: 4,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Dégradé moderne
            color: 'white',
            textAlign: { xs: 'center', md: 'left' },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {user?.prenom ? `Bonjour ${user.prenom} 👋` : 'Bonjour 👋'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
              Prenez soin de votre santé mentale. C&apos;est le moment idéal pour faire le point sur
              votre niveau de stress actuel.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={goToDiagnostic}
            startIcon={<Target />}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            Commencer un Diagnostic
          </Button>
        </Box>
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={3}>
            <Newspaper color={theme.palette.primary.main} />
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Actualités & Conseils
            </Typography>
          </Stack>

          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={3}>
            {adminArticles.map((article) => (
              <Card
                key={article.id}
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <CardActionArea
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={article.image}
                    alt={article.title}
                  />
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Chip
                        label={article.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {article.date}
                      </Typography>
                    </Stack>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      fontWeight="bold"
                      lineHeight={1.2}
                    >
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {article.summary}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default HomePage
