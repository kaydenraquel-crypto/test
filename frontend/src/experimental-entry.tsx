import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ExperimentalApp } from './components/experimental/ExperimentalApp';
import { TradingDataProvider } from './contexts/TradingDataContext';
import './styles.css';

// Create trading theme
const tradingTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#667eea',
      dark: '#5a67d8',
      light: '#818cf8',
    },
    secondary: {
      main: '#fbbf24',
      dark: '#d97706',
      light: '#fcd34d',
    },
    background: {
      default: '#0f0f23',
      paper: '#1a1b3a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a3bd',
    },
    success: {
      main: '#10b981',
      dark: '#065f46',
    },
    error: {
      main: '#ef4444',
      dark: '#991b1b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={tradingTheme}>
        <CssBaseline />
        <TradingDataProvider initialSymbol="AAPL" initialMarket="stocks" initialInterval="5">
          <ExperimentalApp />
        </TradingDataProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);