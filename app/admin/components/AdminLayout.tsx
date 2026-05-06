'use client'

import { useAuth } from '@/contexts'
import {
  AppBar,
  Box,
  Chip,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  BrainCircuit,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

const drawerWidth = 260

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'ADMIN') {
      router.push('/home')
      return
    }
  }, [user, isLoading, router])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const menuItems = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, text: 'Utilisateurs', path: '/admin/utilisateurs' },
    { icon: FileText, text: 'Contenus', path: '/admin/informations' },
    { icon: ClipboardList, text: 'Questionnaires', path: '/admin/questionnaires' },
  ]

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#f8fafc' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
            }}
          >
            <BrainCircuit size={24} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              CESIZen
            </Typography>
            <Chip
              label="Admin"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          </Box>
        </Stack>
      </Box>

      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = typeof window !== 'undefined' && window.location.pathname === item.path

          return (
            <ListItem
              key={item.path}
              onClick={() => router.push(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                cursor: 'pointer',
                bgcolor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: isActive ? 'primary.main' : 'rgba(0, 0, 0, 0.04)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.95rem',
                }}
              />
            </ListItem>
          )
        })}
      </List>

      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Box sx={{ px: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              {user?.prenom} {user?.nom}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>

          <ListItem
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              cursor: 'pointer',
              color: 'error.main',
              '&:hover': { bgcolor: 'error.lighter' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <LogOut size={20} />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItem>
        </Stack>
      </Box>
    </Box>
  )

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Administration CESIZen
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          bgcolor: '#f0f4f8',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
