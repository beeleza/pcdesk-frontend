import { ThemeProvider, CssBaseline } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import { theme } from './theme'
import AppRoutes from './routes'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
