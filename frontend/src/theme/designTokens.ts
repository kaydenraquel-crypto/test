// Design Tokens - Single Source of Truth for NovaSignal Design System
// Phase 1 of MUI Design System Standardization

import { createTheme, Theme } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles/createPalette';

// Core Design Tokens
export const designTokens = {
  // Trading-specific colors (NovaSignal brand)
  colors: {
    trading: {
      buy: '#00c853',        // NovaSignal green
      sell: '#f44336',       // Error red  
      neutral: '#757575',    // Grey
      profit: '#4caf50',     // Success green
      loss: '#ff5252',       // Loss red
    },
    chart: {
      bullish: '#4caf50',
      bearish: '#f44336', 
      grid: 'rgba(255, 255, 255, 0.1)',
      background: '#0b1220',
      panelDark: '#111827',
    },
    status: {
      connected: '#00c853',
      connecting: '#ff9800',
      reconnecting: '#ff6d00',
      error: '#ff5252',
      failed: '#d32f2f',
      disconnected: '#757575',
    }
  },
  
  // Spacing system (4px base unit)
  spacing: {
    xs: 4,
    sm: 8, 
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
  },
  
  // Typography scale
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px 
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      xxl: '1.5rem',    // 24px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  
  // Shadow elevation system
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Z-index scale
  zIndex: {
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  }
};

// Theme Variants for all 5 existing themes
export const themeVariants = {
  light: {
    name: 'Light',
    palette: {
      mode: 'light',
      primary: {
        main: '#3182ce',
        light: '#63b3ed',
        dark: '#2c5aa0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#718096',
        light: '#a0aec0',
        dark: '#4a5568',
        contrastText: '#ffffff',
      },
      success: {
        main: designTokens.colors.trading.buy,
        light: '#66bb6a',
        dark: '#388e3c',
      },
      error: {
        main: designTokens.colors.trading.sell,
        light: '#ef5350',
        dark: '#c62828',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      background: {
        default: '#ffffff',
        paper: '#f8f9fa',
      },
      text: {
        primary: '#1a202c',
        secondary: '#4a5568',
        disabled: '#718096',
      },
      divider: '#e2e8f0',
    } as PaletteOptions,
  },
  
  dark: {
    name: 'Dark',
    palette: {
      mode: 'dark',
      primary: {
        main: '#60a5fa',
        light: '#93c5fd',
        dark: '#3b82f6',
        contrastText: '#1e293b',
      },
      secondary: {
        main: '#9ca3af',
        light: '#d1d5db',
        dark: '#6b7280',
        contrastText: '#1e293b',
      },
      success: {
        main: designTokens.colors.trading.buy,
        light: '#4ade80',
        dark: '#16a34a',
      },
      error: {
        main: designTokens.colors.trading.sell,
        light: '#f87171',
        dark: '#dc2626',
      },
      warning: {
        main: '#ffcc02',
        light: '#fde047',
        dark: '#ca8a04',
      },
      info: {
        main: '#64b5f6',
        light: '#90caf9',
        dark: '#42a5f5',
      },
      background: {
        default: designTokens.colors.chart.background,
        paper: designTokens.colors.chart.panelDark,
      },
      text: {
        primary: '#e5e7eb',
        secondary: '#9ca3af',
        disabled: '#6b7280',
      },
      divider: '#374151',
    } as PaletteOptions,
  },
  
  tradingview: {
    name: 'TradingView',
    palette: {
      mode: 'dark',
      primary: {
        main: '#2962ff',
        light: '#5983ff',
        dark: '#1e4ed8',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#787b86',
        light: '#b2b5be',
        dark: '#5a5d68',
        contrastText: '#ffffff',
      },
      success: {
        main: '#089981',
        light: '#10b981',
        dark: '#047857',
      },
      error: {
        main: '#f23645',
        light: '#f87171',
        dark: '#dc2626',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      info: {
        main: '#2962ff',
        light: '#5983ff',
        dark: '#1e4ed8',
      },
      background: {
        default: '#131722',
        paper: '#1e222d',
      },
      text: {
        primary: '#d1d4dc',
        secondary: '#b2b5be',
        disabled: '#787b86',
      },
      divider: '#363c4e',
    } as PaletteOptions,
  },
  
  matrix: {
    name: 'Matrix',
    palette: {
      mode: 'dark',
      primary: {
        main: '#00ff00',
        light: '#4ade80',
        dark: '#00cc00',
        contrastText: '#000000',
      },
      secondary: {
        main: '#008800',
        light: '#00cc00',
        dark: '#006600',
        contrastText: '#000000',
      },
      success: {
        main: '#00ff00',
        light: '#4ade80',
        dark: '#00cc00',
      },
      error: {
        main: '#ff0000',
        light: '#ff4444',
        dark: '#cc0000',
      },
      warning: {
        main: '#ffff00',
        light: '#ffff44',
        dark: '#cccc00',
      },
      info: {
        main: '#00ff00',
        light: '#4ade80',
        dark: '#00cc00',
      },
      background: {
        default: '#000000',
        paper: '#001100',
      },
      text: {
        primary: '#00ff00',
        secondary: '#00cc00',
        disabled: '#008800',
      },
      divider: '#003300',
    } as PaletteOptions,
  },
  
  minimalist: {
    name: 'Minimalist',
    palette: {
      mode: 'light',
      primary: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#9e9e9e',
        light: '#bdbdbd',
        dark: '#757575',
        contrastText: '#ffffff',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      error: {
        main: '#f44336',
        light: '#e57373',
        dark: '#d32f2f',
      },
      warning: {
        main: '#ff9800',
        light: '#ffb74d',
        dark: '#f57c00',
      },
      info: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
      },
      text: {
        primary: '#424242',
        secondary: '#616161',
        disabled: '#9e9e9e',
      },
      divider: '#e0e0e0',
    } as PaletteOptions,
  }
} as const;

// Create MUI theme with design tokens
export function createNovaSignalTheme(variant: keyof typeof themeVariants): Theme {
  const selectedVariant = themeVariants[variant];
  
  return createTheme({
    palette: selectedVariant.palette,
    
    typography: {
      fontFamily: designTokens.typography.fontFamily,
      h1: {
        fontSize: '2.5rem',
        fontWeight: designTokens.typography.fontWeight.bold,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: designTokens.typography.fontWeight.bold,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: designTokens.typography.fontWeight.semibold,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: designTokens.typography.fontWeight.semibold,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: designTokens.typography.fontWeight.medium,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: designTokens.typography.fontWeight.medium,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: designTokens.typography.fontSize.md,
        lineHeight: 1.6,
      },
      body2: {
        fontSize: designTokens.typography.fontSize.sm,
        lineHeight: 1.5,
      },
      caption: {
        fontSize: designTokens.typography.fontSize.xs,
        lineHeight: 1.4,
      },
    },
    
    spacing: designTokens.spacing.sm, // 8px base unit for MUI
    
    shape: {
      borderRadius: designTokens.borderRadius.medium,
    },
    
    components: {
      // Button variants
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: designTokens.typography.fontWeight.medium,
            borderRadius: designTokens.borderRadius.medium,
            padding: `${designTokens.spacing.sm}px ${designTokens.spacing.md}px`,
          },
          containedPrimary: {
            boxShadow: designTokens.shadows.sm,
            '&:hover': {
              boxShadow: designTokens.shadows.md,
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
        variants: [
          {
            props: { variant: 'trading' } as any,
            style: {
              backgroundColor: designTokens.colors.trading.buy,
              color: 'white',
              '&:hover': {
                backgroundColor: designTokens.colors.trading.profit,
              },
            },
          },
          {
            props: { variant: 'sell' } as any,
            style: {
              backgroundColor: designTokens.colors.trading.sell,
              color: 'white',
              '&:hover': {
                backgroundColor: designTokens.colors.trading.loss,
              },
            },
          },
        ],
      },
      
      // Card components
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.borderRadius.large,
            boxShadow: designTokens.shadows.sm,
            '&:hover': {
              boxShadow: designTokens.shadows.md,
            },
          },
        },
      },
      
      // Paper components
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.borderRadius.medium,
          },
        },
      },
      
      // TextField components
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: designTokens.borderRadius.medium,
            },
          },
        },
        variants: [
          {
            props: { variant: 'symbol' } as any,
            style: {
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontWeight: designTokens.typography.fontWeight.semibold,
                '&.Mui-focused': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: designTokens.colors.trading.buy,
                    borderWidth: 2,
                  },
                },
              },
            },
          },
        ],
      },
      
      // Chip components
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: designTokens.typography.fontWeight.medium,
            borderRadius: designTokens.borderRadius.large,
          },
        },
        variants: [
          {
            props: { variant: 'trading-positive' } as any,
            style: {
              backgroundColor: designTokens.colors.trading.buy,
              color: 'white',
              fontWeight: designTokens.typography.fontWeight.bold,
            },
          },
          {
            props: { variant: 'trading-negative' } as any,
            style: {
              backgroundColor: designTokens.colors.trading.sell,
              color: 'white',
              fontWeight: designTokens.typography.fontWeight.bold,
            },
          },
        ],
      },
    },
  });
}

// CSS custom properties helper for runtime theme switching
export function generateCssVariables(theme: Theme) {
  return {
    '--mui-primary-main': theme.palette.primary.main,
    '--mui-primary-dark': theme.palette.primary.dark,
    '--mui-primary-light': theme.palette.primary.light,
    '--mui-secondary-main': theme.palette.secondary.main,
    '--mui-background-default': theme.palette.background.default,
    '--mui-background-paper': theme.palette.background.paper,
    '--mui-text-primary': theme.palette.text.primary,
    '--mui-text-secondary': theme.palette.text.secondary,
    '--mui-divider': theme.palette.divider,
    '--mui-success-main': theme.palette.success.main,
    '--mui-error-main': theme.palette.error.main,
    '--mui-warning-main': theme.palette.warning.main,
    '--mui-info-main': theme.palette.info.main,
    
    // Trading-specific variables
    '--trading-buy': designTokens.colors.trading.buy,
    '--trading-sell': designTokens.colors.trading.sell,
    '--trading-neutral': designTokens.colors.trading.neutral,
    '--trading-profit': designTokens.colors.trading.profit,
    '--trading-loss': designTokens.colors.trading.loss,
    
    // Spacing variables
    '--spacing-xs': `${designTokens.spacing.xs}px`,
    '--spacing-sm': `${designTokens.spacing.sm}px`,
    '--spacing-md': `${designTokens.spacing.md}px`,
    '--spacing-lg': `${designTokens.spacing.lg}px`,
    '--spacing-xl': `${designTokens.spacing.xl}px`,
    '--spacing-xxl': `${designTokens.spacing.xxl}px`,
    
    // Border radius variables  
    '--border-radius-sm': `${designTokens.borderRadius.small}px`,
    '--border-radius-md': `${designTokens.borderRadius.medium}px`,
    '--border-radius-lg': `${designTokens.borderRadius.large}px`,
    '--border-radius-xl': `${designTokens.borderRadius.xlarge}px`,
  };
}

// Export default theme (Dark)
export const defaultTheme = createNovaSignalTheme('dark');