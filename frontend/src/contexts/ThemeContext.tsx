import React, { createContext, useContext, useEffect, useState } from 'react'
import { ChartTheme, ChartSettings, CHART_THEMES } from '../components/ChartCustomization'

// Extended theme interface for the entire application
export interface AppTheme extends ChartTheme {
  // Panel backgrounds
  panelBackgroundPrimary: string
  panelBackgroundSecondary: string
  panelBackgroundLight: string
  panelBorder: string
  
  // Text colors
  textPrimary: string
  textSecondary: string
  textMuted: string
  textInverse: string
  
  // Interactive elements
  buttonBackground: string
  buttonHover: string
  buttonText: string
  buttonBorder: string
  
  // Status colors
  successColor: string
  warningColor: string
  errorColor: string
  
  // News panel specific
  newsPanelBackground: string
  newsPanelText: string
  newsPanelBorder: string
  newsItemHover: string
  
  // Sentiment colors (enhanced)
  bullishBackground: string
  bearishBackground: string
  neutralBackground: string
  
  // Special effects
  shadowColor: string
  glowColor: string
}

// Extended theme presets
export const APP_THEMES: AppTheme[] = [
  {
    ...CHART_THEMES[0], // Light theme base
    name: 'Light',
    panelBackgroundPrimary: '#ffffff',
    panelBackgroundSecondary: '#f8f9fa',
    panelBackgroundLight: '#ffffff',
    panelBorder: '#e2e8f0',
    textPrimary: '#1a202c',
    textSecondary: '#4a5568',
    textMuted: '#718096',
    textInverse: '#ffffff',
    buttonBackground: '#3182ce',
    buttonHover: '#2c5aa0',
    buttonText: '#ffffff',
    buttonBorder: '#3182ce',
    successColor: '#16a34a',
    warningColor: '#ca8a04',
    errorColor: '#dc2626',
    newsPanelBackground: '#ffffff',
    newsPanelText: '#1a202c',
    newsPanelBorder: '#e2e8f0',
    newsItemHover: '#f7fafc',
    bullishBackground: 'rgba(34, 197, 94, 0.15)',
    bearishBackground: 'rgba(239, 68, 68, 0.15)',
    neutralBackground: 'rgba(75, 85, 99, 0.15)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    glowColor: 'rgba(49, 130, 206, 0.3)'
  },
  {
    ...CHART_THEMES[1], // Dark theme base  
    name: 'Dark',
    panelBackgroundPrimary: '#1a1a1a',
    panelBackgroundSecondary: '#2d2d2d',
    panelBackgroundLight: '#f8f9fa',
    panelBorder: '#333333',
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    textMuted: '#666666',
    textInverse: '#1a202c',
    buttonBackground: '#4a5568',
    buttonHover: '#2d3748',
    buttonText: '#ffffff',
    buttonBorder: '#4a5568',
    successColor: '#00e676',
    warningColor: '#ffcc02',
    errorColor: '#ff5252',
    newsPanelBackground: '#f8f9fa',
    newsPanelText: '#1a202c',
    newsPanelBorder: '#e2e8f0',
    newsItemHover: '#e2e8f0',
    bullishBackground: 'rgba(0, 230, 118, 0.2)',
    bearishBackground: 'rgba(255, 82, 82, 0.2)',
    neutralBackground: 'rgba(160, 160, 160, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    glowColor: 'rgba(100, 181, 246, 0.3)'
  },
  {
    ...CHART_THEMES[2], // TradingView theme base
    name: 'TradingView',
    panelBackgroundPrimary: '#131722',
    panelBackgroundSecondary: '#1e222d',
    panelBackgroundLight: '#ffffff',
    panelBorder: '#363c4e',
    textPrimary: '#d1d4dc',
    textSecondary: '#b2b5be',
    textMuted: '#787b86',
    textInverse: '#131722',
    buttonBackground: '#2962ff',
    buttonHover: '#1e4ed8',
    buttonText: '#ffffff',
    buttonBorder: '#2962ff',
    successColor: '#089981',
    warningColor: '#ff9800',
    errorColor: '#f23645',
    newsPanelBackground: '#ffffff',
    newsPanelText: '#131722',
    newsPanelBorder: '#e2e8f0',
    newsItemHover: '#f7fafc',
    bullishBackground: 'rgba(8, 153, 129, 0.2)',
    bearishBackground: 'rgba(242, 54, 69, 0.2)',
    neutralBackground: 'rgba(120, 123, 134, 0.2)',
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    glowColor: 'rgba(41, 98, 255, 0.3)'
  },
  {
    ...CHART_THEMES[3], // Matrix theme base
    name: 'Matrix',
    panelBackgroundPrimary: '#000000',
    panelBackgroundSecondary: '#001100',
    panelBackgroundLight: '#ffffff',
    panelBorder: '#003300',
    textPrimary: '#00ff00',
    textSecondary: '#00cc00',
    textMuted: '#008800',
    textInverse: '#000000',
    buttonBackground: '#00ff00',
    buttonHover: '#00cc00',
    buttonText: '#000000',
    buttonBorder: '#00ff00',
    successColor: '#00ff00',
    warningColor: '#ffff00',
    errorColor: '#ff0000',
    newsPanelBackground: '#ffffff',
    newsPanelText: '#000000',
    newsPanelBorder: '#cccccc',
    newsItemHover: '#f0f0f0',
    bullishBackground: 'rgba(0, 255, 0, 0.2)',
    bearishBackground: 'rgba(255, 0, 0, 0.2)',
    neutralBackground: 'rgba(255, 255, 0, 0.2)',
    shadowColor: 'rgba(0, 255, 0, 0.3)',
    glowColor: 'rgba(0, 255, 0, 0.5)'
  },
  {
    ...CHART_THEMES[4], // Minimalist theme base
    name: 'Minimalist',
    panelBackgroundPrimary: '#fafafa',
    panelBackgroundSecondary: '#ffffff',
    panelBackgroundLight: '#ffffff',
    panelBorder: '#e0e0e0',
    textPrimary: '#424242',
    textSecondary: '#616161',
    textMuted: '#9e9e9e',
    textInverse: '#ffffff',
    buttonBackground: '#2196f3',
    buttonHover: '#1976d2',
    buttonText: '#ffffff',
    buttonBorder: '#2196f3',
    successColor: '#4caf50',
    warningColor: '#ff9800',
    errorColor: '#f44336',
    newsPanelBackground: '#ffffff',
    newsPanelText: '#424242',
    newsPanelBorder: '#e0e0e0',
    newsItemHover: '#f5f5f5',
    bullishBackground: 'rgba(76, 175, 80, 0.15)',
    bearishBackground: 'rgba(244, 67, 54, 0.15)',
    neutralBackground: 'rgba(158, 158, 158, 0.15)',
    shadowColor: 'rgba(66, 66, 66, 0.1)',
    glowColor: 'rgba(33, 150, 243, 0.3)'
  }
]

interface ThemeContextType {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  chartSettings: ChartSettings
  setChartSettings: (settings: ChartSettings) => void
  applyThemeToChart: (chartTheme: ChartTheme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    // Load theme from localStorage or default to Dark theme (index 1)
    try {
      const saved = localStorage.getItem('appTheme')
      if (saved) {
        const savedTheme = JSON.parse(saved)
        return APP_THEMES.find(t => t.name === savedTheme.name) || APP_THEMES[1]
      }
    } catch {}
    return APP_THEMES[1] // Default to Dark theme
  })
  
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

  // Update CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement
    
    // Chart colors
    root.style.setProperty('--chart-bg', theme.backgroundColor)
    root.style.setProperty('--chart-text', theme.textColor)
    root.style.setProperty('--chart-grid', theme.gridColor)
    root.style.setProperty('--chart-up', theme.upColor)
    root.style.setProperty('--chart-down', theme.downColor)
    
    // Panel colors
    root.style.setProperty('--panel-bg-primary', theme.panelBackgroundPrimary)
    root.style.setProperty('--panel-bg-secondary', theme.panelBackgroundSecondary)
    root.style.setProperty('--panel-bg-light', theme.panelBackgroundLight)
    root.style.setProperty('--panel-border', theme.panelBorder)
    
    // Text colors
    root.style.setProperty('--text-primary', theme.textPrimary)
    root.style.setProperty('--text-secondary', theme.textSecondary)
    root.style.setProperty('--text-muted', theme.textMuted)
    root.style.setProperty('--text-inverse', theme.textInverse)
    
    // Button colors
    root.style.setProperty('--btn-bg', theme.buttonBackground)
    root.style.setProperty('--btn-hover', theme.buttonHover)
    root.style.setProperty('--btn-text', theme.buttonText)
    root.style.setProperty('--btn-border', theme.buttonBorder)
    
    // Status colors
    root.style.setProperty('--success', theme.successColor)
    root.style.setProperty('--warning', theme.warningColor)
    root.style.setProperty('--error', theme.errorColor)
    
    // News panel colors
    root.style.setProperty('--news-bg', theme.newsPanelBackground)
    root.style.setProperty('--news-text', theme.newsPanelText)
    root.style.setProperty('--news-border', theme.newsPanelBorder)
    root.style.setProperty('--news-hover', theme.newsItemHover)
    
    // Sentiment colors
    root.style.setProperty('--bullish-bg', theme.bullishBackground)
    root.style.setProperty('--bearish-bg', theme.bearishBackground)
    root.style.setProperty('--neutral-bg', theme.neutralBackground)
    
    // Effects
    root.style.setProperty('--shadow', theme.shadowColor)
    root.style.setProperty('--glow', theme.glowColor)
    
    // Save to localStorage
    localStorage.setItem('appTheme', JSON.stringify(theme))
  }, [theme])

  // Update chart settings when they change
  useEffect(() => {
    localStorage.setItem('chartSettings', JSON.stringify(chartSettings))
  }, [chartSettings])

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme)
    // Also update chart settings to match the new theme
    setChartSettingsState(prev => ({
      ...prev,
      theme: newTheme
    }))
  }

  const setChartSettings = (settings: ChartSettings) => {
    setChartSettingsState(settings)
    // If theme changed, update app theme as well
    if (settings.theme.name !== theme.name) {
      const matchingAppTheme = APP_THEMES.find(t => t.name === settings.theme.name)
      if (matchingAppTheme) {
        setThemeState(matchingAppTheme)
      }
    }
  }

  const applyThemeToChart = (chartTheme: ChartTheme) => {
    const matchingAppTheme = APP_THEMES.find(t => t.name === chartTheme.name)
    if (matchingAppTheme) {
      setTheme(matchingAppTheme)
    }
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    chartSettings,
    setChartSettings,
    applyThemeToChart
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}