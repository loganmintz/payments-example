import { createTheme } from '@mui/material/styles';

// Theme inspired by tama.meme with green primary color complementary to purple
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3DDC84', // Green color that complements purple
      light: '#61E59B',
      dark: '#30BA6E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4E47DC', // Purple accent color
      light: '#6A64E0',
      dark: '#3C36B8',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F4F7FE', // Light blue-gray background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0A1F44', // Dark blue text
      secondary: '#4E5D78',
    },
    error: {
      main: '#FF5B6F', // Red but with a softer tone
    },
    success: {
      main: '#40DFB6', // Mint green for success states
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", "SF Pro", "Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none', // Avoid uppercase buttons
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners like tama.meme
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s ease-in-out',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #3DDC84 0%, #30BA6E 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(90deg, #4E47DC 0%, #3F3AB5 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 15px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#3DDC84',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme; 