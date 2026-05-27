import { useState } from 'react'
import { Link } from 'react-router'
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  AppBar,
  Toolbar,
} from '@mui/material'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            pcdesk-frontend
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/about">
            About
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          Welcome to pcdesk
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="body1" gutterBottom>
              React + Vite + TypeScript + MUI + React Router + Axios
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Count: {count}
          </Typography>
          <Button variant="contained" onClick={() => setCount((c) => c + 1)}>
            Increment
          </Button>
        </Box>

        <Button variant="outlined" component={Link} to="/about">
          Go to About
        </Button>
      </Container>
    </>
  )
}

export default Home
