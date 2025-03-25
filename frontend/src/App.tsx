import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box className="hero-background" />
        <Container 
          className="app-container"
          maxWidth="lg" 
          sx={{ 
            mt: 6, 
            mb: 6, 
            flex: 1,
            borderRadius: 4,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </Container>
        <Box 
          component="footer" 
          sx={{ 
            py: 3, 
            textAlign: 'center',
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          © {new Date().getFullYear()} Gem Balance System • Inspired by Tama.meme
        </Box>
      </Box>
    </Router>
  );
}

export default App; 