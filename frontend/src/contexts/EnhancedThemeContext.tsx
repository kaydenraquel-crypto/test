// Enhanced Theme Context with MUI Integration
// Phase 1 of MUI Design System Standardization

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider as MuiThemeProvider, Theme as MuiTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createNovaSignalTheme, generateCssVariables, themeVariants } from '../theme/designTokens'
import { ChartTheme, ChartSettings, CHART_THEMES } from '../components/ChartCustomization'
import { AppTheme, APP_THEMES } from './ThemeContext'

interface EnhancedThemeContextType {
  // Legacy theme support (for backward compatibility)
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  
  // New MUI theme support
  muiTheme: MuiTheme
  currentThemeVariant: keyof typeof themeVariants
  setThemeVariant: (variant: keyof typeof themeVariants) => void
  
  // Chart settings
  chartSettings: ChartSettings
  setChartSettings: (settings: ChartSettings) => void
  applyThemeToChart: (chartTheme: ChartTheme) => void
  
  // Theme utilities
  isDarkMode: boolean
  toggleTheme: () => void
  availableThemes: string[]
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined)

export function useEnhancedTheme() {
  const context = useContext(EnhancedThemeContext)
  if (!context) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider')
  }
  return context
}

interface EnhancedThemeProviderProps {
  children: React.ReactNode
}

export function EnhancedThemeProvider({ children }: EnhancedThemeProviderProps) {
  // Current theme variant (maps to design tokens)
  const [currentThemeVariant, setCurrentThemeVariant] = useState<keyof typeof themeVariants>(() => {
    try {
      const saved = localStorage.getItem('novaSignal_themeVariant')
      if (saved && saved in themeVariants) {
        return saved as keyof typeof themeVariants
      }
    } catch {}
    return 'dark' // Default to dark theme
  })
  
  // Legacy app theme (for backward compatibility)
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const variantToLegacyMap: Record<keyof typeof themeVariants, number> = {
      'light': 0,
      'dark': 1,
      'tradingview': 2,
      'matrix': 3,
      'minimalist': 4
    }
    return APP_THEMES[variantToLegacyMap[currentThemeVariant]]
  })
  
  // MUI theme based on current variant
  const [muiTheme, setMuiTheme] = useState<MuiTheme>(() => 
    createNovaSignalTheme(currentThemeVariant)
  )
  
  // Chart settings
  const [chartSettings, setChartSettingsState] = useState<ChartSettings>(() => {
    try {
      const saved = localStorage.getItem('chartSettings')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {}
    return {
      theme: theme,
      chartType: 'candlestick',
      showVolume: true,
      showGrid: true,
      timeFormat: '24h',
      priceFormat: 'auto',
      fontSize: 12,
      lineWidth: 2,
      autoScale: true,
      logScale: false
    }
  })

  // Update MUI theme when variant changes
  useEffect(() => {
    const newMuiTheme = createNovaSignalTheme(currentThemeVariant)
    setMuiTheme(newMuiTheme)
    
    // Also update legacy theme for backward compatibility
    const variantToLegacyMap: Record<keyof typeof themeVariants, number> = {
      'light': 0,
      'dark': 1,
      'tradingview': 2,
      'matrix': 3,
      'minimalist': 4
    }
    setThemeState(APP_THEMES[variantToLegacyMap[currentThemeVariant]])
    
    // Save to localStorage
    localStorage.setItem('novaSignal_themeVariant', currentThemeVariant)
  }, [currentThemeVariant])

  // Update CSS custom properties when MUI theme changes
  useEffect(() => {
    const root = document.documentElement
    const cssVars = generateCssVariables(muiTheme)
    
    // Apply all CSS custom properties
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })
    
    // Legacy CSS variables for existing components
    root.style.setProperty('--chart-bg', theme.backgroundColor)
    root.style.setProperty('--chart-text', theme.textColor)
    root.style.setProperty('--chart-grid', theme.gridColor)
    root.style.setProperty('--chart-up', theme.upColor)
    root.style.setProperty('--chart-down', theme.downColor)
    root.style.setProperty('--panel-bg-primary', theme.panelBackgroundPrimary)
    root.style.setProperty('--panel-bg-secondary', theme.panelBackgroundSecondary)
    root.style.setProperty('--panel-border', theme.panelBorder)
    root.style.setProperty('--text-primary', theme.textPrimary)
    root.style.setProperty('--text-secondary', theme.textSecondary)
    root.style.setProperty('--text-muted', theme.textMuted)
    
    console.log(`🎨 Theme applied: ${currentThemeVariant} (MUI + Legacy support)`)
  }, [muiTheme, theme, currentThemeVariant])

  // Update chart settings when they change
  useEffect(() => {
    localStorage.setItem('chartSettings', JSON.stringify(chartSettings))
  }, [chartSettings])

  // Theme management functions
  const setThemeVariant = (variant: keyof typeof themeVariants) => {
    setCurrentThemeVariant(variant)
  }

  const setTheme = (newTheme: AppTheme) => {
    // Find corresponding variant for legacy theme
    const legacyToVariantMap: Record<string, keyof typeof themeVariants> = {
      'Light': 'light',
      'Dark': 'dark', 
      'TradingView': 'tradingview',
      'Matrix': 'matrix',
      'Minimalist': 'minimalist'
    }
    
    const correspondingVariant = legacyToVariantMap[newTheme.name]
    if (correspondingVariant) {
      setCurrentThemeVariant(correspondingVariant)
    }
    
    setThemeState(newTheme)
    setChartSettingsState(prev => ({ ...prev, theme: newTheme }))
  }

  const setChartSettings = (settings: ChartSettings) => {
    setChartSettingsState(settings)
    if (settings.theme.name !== theme.name) {
      const matchingAppTheme = APP_THEMES.find(t => t.name === settings.theme.name)
      if (matchingAppTheme) {
        setTheme(matchingAppTheme)
      }
    }
  }

  const applyThemeToChart = (chartTheme: ChartTheme) => {
    const matchingAppTheme = APP_THEMES.find(t => t.name === chartTheme.name)
    if (matchingAppTheme) {
      setTheme(matchingAppTheme)
    }
  }

  const toggleTheme = () => {
    const variants = Object.keys(themeVariants) as (keyof typeof themeVariants)[]
    const currentIndex = variants.indexOf(currentThemeVariant)
    const nextIndex = (currentIndex + 1) % variants.length
    setCurrentThemeVariant(variants[nextIndex])
  }

  const value: EnhancedThemeContextType = {
    theme,
    setTheme,
    muiTheme,
    currentThemeVariant,
    setThemeVariant,
    chartSettings,
    setChartSettings,
    applyThemeToChart,
    isDarkMode: muiTheme.palette.mode === 'dark',
    toggleTheme,
    availableThemes: Object.keys(themeVariants)
  }

  return (
    <EnhancedThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </EnhancedThemeContext.Provider>
  )
}

// Backward compatibility export
export const useTheme = useEnhancedTheme