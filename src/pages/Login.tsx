import { useState } from 'react'
import { Navigate } from 'react-router'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login, token } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (token) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      setError('E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100svh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f7f5ff 0%, #ede8ff 50%, #f3e8ff 100%)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          mx: 2,
          px: { xs: 3, sm: 5 },
          py: { xs: 4, sm: 5 },
          border: '1px solid rgba(170, 59, 255, 0.15)',
          boxShadow: '0 8px 40px rgba(170, 59, 255, 0.12), 0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #aa3bff 0%, #7c20d4 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: '0 4px 16px rgba(170, 59, 255, 0.35)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1025', letterSpacing: -0.5 }}>
            Bem-vindo de volta
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b6375', mt: 0.5 }}>
            Entre com suas credenciais para continuar
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              fullWidth
              disabled={loading}
              slotProps={{ inputLabel: { shrink: true } }}
              placeholder="seu@email.com"
            />

            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              fullWidth
              disabled={loading}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                        sx={{ color: '#6b6375' }}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              placeholder="••••••••"
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disableElevation
              disabled={loading}
              sx={{
                mt: 0.5,
                py: 1.5,
                background: 'linear-gradient(135deg, #aa3bff 0%, #7c20d4 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #bb5cff 0%, #8e32e8 100%)',
                  boxShadow: '0 4px 20px rgba(170, 59, 255, 0.4)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Entrar'}
            </Button>
          </Box>
        </Box>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#9ca3af', mt: 3 }}>
          © {new Date().getFullYear()} PCDesk. Todos os direitos reservados.
        </Typography>
      </Paper>
    </Box>
  )
}
