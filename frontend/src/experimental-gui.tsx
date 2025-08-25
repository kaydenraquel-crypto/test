import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ExperimentalApp } from './components/experimental/ExperimentalApp';
import './styles.css';

// Create a professional trading theme
const tradingTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#667eea', // NovaSignal brand color
      dark: '#5a67d8',
      light: '#818cf8',
    },
    secondary: {
      main: '#fbbf24', // Gold accent for financial context
      dark: '#d97706',
      light: '#fcd34d',
    },
    background: {
      default: '#0f0f23', // Very dark blue-black
      paper: '#1a1b3a',   // Slightly lighter for cards
    },
    surface: {
      main: '#2a2d4e',   // For elevated surfaces
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a3bd',
    },
    success: {
      main: '#10b981', // Green for profits
      dark: '#065f46',
    },
    error: {
      main: '#ef4444', // Red for losses
      dark: '#991b1b',
    },
    warning: {
      main: '#f59e0b', // Amber for warnings
    },
    info: {
      main: '#3b82f6', // Blue for info
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1b3a',
          borderBottom: '1px solid #2a2d4e',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1b3a',
          borderRight: '1px solid #2a2d4e',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1b3a',
          border: '1px solid #2a2d4e',
          borderRadius: '12px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      },
    },
  },
});

// Extend the theme interface to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      main: string;
    };
  }

  interface PaletteOptions {
    surface?: {
      main: string;
    };
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={tradingTheme}>
        <CssBaseline />
        <ExperimentalApp />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);