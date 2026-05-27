import { Box, Typography, Avatar, Tooltip, IconButton } from '@mui/material'
import { Outlet, NavLink, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import type { ReactNode } from 'react'

const SIDEBAR_WIDTH = 240
const HEADER_HEIGHT = 64

interface NavItem {
  label: string
  path: string
  icon: ReactNode
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    label: 'Computadores',
    path: '/computers',
    icon: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    label: 'Clientes',
    path: '/customers',
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    label: 'Ordens de Serviço',
    path: '/service-orders',
    icon: (
      <>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
        <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  },
  {
    label: 'Histórico',
    path: '/histories',
    icon: (
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
]

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/computers': 'Computadores',
  '/customers': 'Clientes',
  '/service-orders': 'Ordens de Serviço',
  '/histories': 'Histórico de Alocações',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const currentTitle = pageTitles[location.pathname] ?? 'PCDesk'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          bgcolor: '#12062a',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 1200,
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            height: HEADER_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            px: 2.5,
            gap: 1.5,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #aa3bff 0%, #7c20d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(170,59,255,0.4)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', letterSpacing: -0.3 }}>
            PCDesk
          </Typography>
        </Box>

        {/* Nav */}
        <Box sx={{ flex: 1, py: 2, overflow: 'auto' }}>
          {navItems.map((item) => {
            const active =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)

            return (
              <Box
                key={item.path}
                component={NavLink}
                to={item.path}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mx: 1.5,
                  px: 1.5,
                  py: 1.1,
                  borderRadius: 1.5,
                  mb: 0.5,
                  textDecoration: 'none',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  bgcolor: active ? 'rgba(170, 59, 255, 0.18)' : 'transparent',
                  borderLeft: `3px solid ${active ? '#aa3bff' : 'transparent'}`,
                  transition: 'all 0.15s ease',
                  fontWeight: active ? 600 : 400,
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: '#fff',
                    bgcolor: active ? 'rgba(170, 59, 255, 0.18)' : 'rgba(255,255,255,0.06)',
                  },
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  {item.icon}
                </svg>
                {item.label}
              </Box>
            )
          })}
        </Box>

        {/* User */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <Avatar sx={{ width: 34, height: 34, fontSize: '0.85rem', bgcolor: '#aa3bff', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                lineHeight: 1.3,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name ?? 'Usuário'}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.7rem',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email ?? ''}
            </Typography>
          </Box>
          <Tooltip title="Sair">
            <IconButton
              onClick={logout}
              size="small"
              sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff' } }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main area */}
      <Box
        sx={{
          flex: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: '#f6f4ff',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            height: HEADER_HEIGHT,
            bgcolor: '#fff',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
            display: 'flex',
            alignItems: 'center',
            px: 3,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }} color="text.primary">
            {currentTitle}
          </Typography>
        </Box>

        {/* Page content */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
