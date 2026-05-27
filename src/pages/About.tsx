import { Link } from 'react-router'
import {
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Paper,
} from '@mui/material'

function About() {
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
          About
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            This project uses React, Vite, TypeScript, MUI, React Router, and
            Axios.
          </Typography>
        </Paper>

        <Button variant="outlined" component={Link} to="/" sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Container>
    </>
  )
}

export default About
