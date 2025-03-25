import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useScrollTrigger,
} from '@mui/material';
import DiamondIcon from '@mui/icons-material/Diamond';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';

interface ElevationScrollProps {
  children: React.ReactElement;
}

function ElevationScroll(props: ElevationScrollProps) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    style: {
      backgroundColor: trigger ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease-in-out',
    },
  });
}

const Navbar: React.FC = () => {
  return (
    <ElevationScroll>
      <AppBar position="sticky" color="transparent" sx={{ boxShadow: 0 }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ py: 1 }}>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Typography
                variant="h5"
                component="div"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                Super Battle Moki
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
              <Button
                component={RouterLink}
                to="/"
                startIcon={<AccountBalanceWalletIcon />}
                sx={{ 
                  borderRadius: '8px',
                  color: 'text.primary',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(61, 220, 132, 0.1)',
                  }
                }}
              >
                Dashboard
              </Button>
              <Button
                component={RouterLink}
                to="/transactions"
                startIcon={<HistoryIcon />}
                sx={{ 
                  borderRadius: '8px',
                  color: 'text.primary',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(61, 220, 132, 0.1)',
                  }
                }}
              >
                Transactions
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </ElevationScroll>
  );
};

export default Navbar; 