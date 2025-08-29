import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ExperimentalApp } from './components/experimental/ExperimentalApp';
import { TradingDataProvider } from './contexts/TradingDataContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import './styles.css';

console.log('🚀 MAIN.TSX LOADED - USING EXPERIMENTAL MUI INTERFACE')

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

// Add skip link to DOM
const skipLink = document.createElement('a')
skipLink.href = '#main-content'
skipLink.textContent = 'Skip to main content'
skipLink.className = 'skip-link'
skipLink.id = 'skip-link'
document.body.insertBefore(skipLink, document.body.firstChild)

// Add live region for announcements
const liveRegion = document.createElement('div')
liveRegion.id = 'live-region'
liveRegion.setAttribute('aria-live', 'polite')
liveRegion.setAttribute('aria-atomic', 'true')
liveRegion.className = 'sr-only'
document.body.appendChild(liveRegion)

// Detect accessibility preferences
const detectPreferences = () => {
  // High contrast detection
  if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
    document.body.classList.add('high-contrast-mode')
  }
  
  // Reduced motion detection
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add('reduced-motion')
  }
  
  // Color scheme detection
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode')
  }
}

// Apply initial preferences
detectPreferences()

// Listen for preference changes
if (window.matchMedia) {
  window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
    document.body.classList.toggle('high-contrast-mode', e.matches)
  })
  
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    document.body.classList.toggle('reduced-motion', e.matches)
  })
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    document.body.classList.toggle('dark-mode', e.matches)
  })
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <MuiThemeProvider theme={tradingTheme}>
        <CssBaseline />
        <CustomThemeProvider>
          <TradingDataProvider initialSymbol="AAPL" initialMarket="stocks" initialInterval="5">
            <ExperimentalApp />
          </TradingDataProvider>
        </CustomThemeProvider>
      </MuiThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
