import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Activity, BarChart2, Palette } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export interface ChartTheme {
  name: string
  backgroundColor: string
  textColor: string
  gridColor: string
  upColor: string
  downColor: string
  wickUpColor: string
  wickDownColor: string
  smaColor: string
  emaColor: string
  rsiColor: string
  macdColor: string
  volumeColor: string
}

export interface ChartSettings {
  theme: ChartTheme
  chartType: 'candlestick' | 'line' | 'area' | 'bars'
  showVolume: boolean
  showGrid: boolean
  timeFormat: '12h' | '24h'
  priceFormat: 'auto' | '2' | '4' | '6'
  fontSize: number
  lineWidth: number
  autoScale: boolean
  logScale: boolean
}

// Predefined chart themes
export const CHART_THEMES: ChartTheme[] = [
  {
    name: 'Light',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    gridColor: '#f5f5f5',
    upColor: '#26a69a',
    downColor: '#ef5350',
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
    smaColor: '#2196F3',
    emaColor: '#FF6D00',
    rsiColor: '#9C27B0',
    macdColor: '#FF9800',
    volumeColor: '#78909C'
  },
  {
    name: 'Dark',
    backgroundColor: '#1e1e1e',
    textColor: '#ffffff',
    gridColor: '#333333',
    upColor: '#00e676',
    downColor: '#ff5252',
    wickUpColor: '#00e676',
    wickDownColor: '#ff5252',
    smaColor: '#64b5f6',
    emaColor: '#ffb74d',
    rsiColor: '#ba68c8',
    macdColor: '#ffcc02',
    volumeColor: '#90a4ae'
  },
  {
    name: 'TradingView',
    backgroundColor: '#131722',
    textColor: '#d1d4dc',
    gridColor: '#363c4e',
    upColor: '#089981',
    downColor: '#f23645',
    wickUpColor: '#089981',
    wickDownColor: '#f23645',
    smaColor: '#2962ff',
    emaColor: '#ff6d00',
    rsiColor: '#9c27b0',
    macdColor: '#ff9800',
    volumeColor: '#5d606b'
  },
  {
    name: 'Matrix',
    backgroundColor: '#000000',
    textColor: '#00ff00',
    gridColor: '#003300',
    upColor: '#00ff00',
    downColor: '#ff0000',
    wickUpColor: '#00ff00',
    wickDownColor: '#ff0000',
    smaColor: '#00ffff',
    emaColor: '#ffff00',
    rsiColor: '#ff00ff',
    macdColor: '#ffa500',
    volumeColor: '#666666'
  },
  {
    name: 'Minimalist',
    backgroundColor: '#fafafa',
    textColor: '#424242',
    gridColor: '#e0e0e0',
    upColor: '#4caf50',
    downColor: '#f44336',
    wickUpColor: '#4caf50',
    wickDownColor: '#f44336',
    smaColor: '#2196f3',
    emaColor: '#ff9800',
    rsiColor: '#9c27b0',
    macdColor: '#607d8b',
    volumeColor: '#9e9e9e'
  }
]

// Chart type options
export const CHART_TYPES = [
  {
    value: 'candlestick',
    label: 'Candlestick',
    icon: BarChart3
  },
  {
    value: 'line',
    label: 'Line',
    icon: TrendingUp
  },
  {
    value: 'area',
    label: 'Area',
    icon: Activity
  },
  {
    value: 'bars',
    label: 'Bars',
    icon: BarChart2
  }
]

const DEFAULT_SETTINGS: ChartSettings = {
  theme: CHART_THEMES[0]!, // Light theme by default
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

interface ChartCustomizationProps {
  onSettingsChange: (settings: ChartSettings) => void
  initialSettings?: Partial<ChartSettings>
}

export default function ChartCustomization({ onSettingsChange, initialSettings }: ChartCustomizationProps) {
  const { theme, chartSettings, setChartSettings, applyThemeToChart } = useTheme()
  
  const [settings, setSettings] = useState<ChartSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
    ...chartSettings
  }))
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'theme' | 'display' | 'format' | 'global'>('theme')

  useEffect(() => {
    onSettingsChange(settings)
    // Also update the global theme context
    setChartSettings(settings)
  }, [settings, onSettingsChange, setChartSettings])

  const updateSettings = (updates: Partial<ChartSettings>) => {
    const newSettings = { ...settings, ...updates }
    setSettings(newSettings)
    
    // If theme changed, update global theme
    if (updates.theme) {
      applyThemeToChart(updates.theme)
    }
  }

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chart-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setSettings({ ...DEFAULT_SETTINGS, ...imported })
      } catch (error) {
        console.error('Failed to import settings:', error)
        alert('Invalid settings file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="panel" style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>Chart Customization</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ 
            background: 'transparent', 
            border: '1px solid var(--border)', 
            color: 'var(--text)',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <div>
          {/* Tab Navigation */}
          <div className="controls-row" style={{ marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
            {(['global', 'theme', 'display', 'format'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? 'var(--accent)' : 'transparent',
                  color: activeTab === tab ? 'white' : 'var(--text)',
                  border: '1px solid var(--border)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Global Theme Tab */}
          {activeTab === 'global' && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Palette className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  <label style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    Global Application Theme
                  </label>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Choose a theme that will be applied to the entire application, including charts, panels, and components.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                  {CHART_THEMES.map(themeOption => (
                    <button
                      key={themeOption.name}
                      onClick={() => {
                        updateSettings({ theme: themeOption })
                        applyThemeToChart(themeOption)
                      }}
                      style={{
                        background: theme.name === themeOption.name ? 'var(--success)' : themeOption.backgroundColor,
                        color: theme.name === themeOption.name ? 'white' : themeOption.textColor,
                        border: `2px solid ${theme.name === themeOption.name ? 'var(--success)' : themeOption.gridColor}`,
                        padding: '12px 8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'center',
                        fontWeight: theme.name === themeOption.name ? 'bold' : 'normal',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        minHeight: '80px',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{themeOption.name}</div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>
                        {themeOption.name === 'Light' && '☀️ Bright & Clean'}
                        {themeOption.name === 'Dark' && '🌙 Modern & Sleek'}
                        {themeOption.name === 'TradingView' && '📊 Professional'}
                        {themeOption.name === 'Matrix' && '🔋 Retro Tech'}
                        {themeOption.name === 'Minimalist' && '✨ Simple & Pure'}
                      </div>
                      {theme.name === themeOption.name && (
                        <div style={{ fontSize: '12px', color: 'var(--success)' }}>✓ Active</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ 
                background: 'var(--panel-bg-secondary)', 
                border: '1px solid var(--panel-border)',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '16px'
              }}>
                <h4 style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontSize: '14px' }}>Current Theme Preview</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      backgroundColor: theme.backgroundColor,
                      border: '1px solid var(--panel-border)',
                      borderRadius: '4px',
                      margin: '0 auto 4px'
                    }}></div>
                    <div style={{ color: 'var(--text-secondary)' }}>Background</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      backgroundColor: theme.upColor,
                      border: '1px solid var(--panel-border)',
                      borderRadius: '4px',
                      margin: '0 auto 4px'
                    }}></div>
                    <div style={{ color: 'var(--text-secondary)' }}>Bullish</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      backgroundColor: theme.downColor,
                      border: '1px solid var(--panel-border)',
                      borderRadius: '4px',
                      margin: '0 auto 4px'
                    }}></div>
                    <div style={{ color: 'var(--text-secondary)' }}>Bearish</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      backgroundColor: theme.newsPanelBackground,
                      border: '1px solid var(--panel-border)',
                      borderRadius: '4px',
                      margin: '0 auto 4px'
                    }}></div>
                    <div style={{ color: 'var(--text-secondary)' }}>News Panel</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }}>
                  Theme Presets
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                  {CHART_THEMES.map(theme => (
                    <button
                      key={theme.name}
                      onClick={() => updateSettings({ theme })}
                      style={{
                        background: settings.theme.name === theme.name ? 'var(--accent)' : theme.backgroundColor,
                        color: settings.theme.name === theme.name ? 'white' : theme.textColor,
                        border: `2px solid ${settings.theme.name === theme.name ? 'var(--accent)' : theme.gridColor}`,
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textAlign: 'center'
                      }}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '12px' }}>Background</label>
                  <input
                    type="color"
                    value={settings.theme.backgroundColor}
                    onChange={(e) => updateSettings({ 
                      theme: { ...settings.theme, backgroundColor: e.target.value }
                    })}
                    style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '12px' }}>Up Color</label>
                  <input
                    type="color"
                    value={settings.theme.upColor}
                    onChange={(e) => updateSettings({ 
                      theme: { ...settings.theme, upColor: e.target.value, wickUpColor: e.target.value }
                    })}
                    style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '12px' }}>Down Color</label>
                  <input
                    type="color"
                    value={settings.theme.downColor}
                    onChange={(e) => updateSettings({ 
                      theme: { ...settings.theme, downColor: e.target.value, wickDownColor: e.target.value }
                    })}
                    style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '12px' }}>SMA Color</label>
                  <input
                    type="color"
                    value={settings.theme.smaColor}
                    onChange={(e) => updateSettings({ 
                      theme: { ...settings.theme, smaColor: e.target.value }
                    })}
                    style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: '12px' }}>EMA Color</label>
                  <input
                    type="color"
                    value={settings.theme.emaColor}
                    onChange={(e) => updateSettings({ 
                      theme: { ...settings.theme, emaColor: e.target.value }
                    })}
                    style={{ width: '100%', height: '32px', border: 'none', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }}>
                  Chart Type
                </label>
                <select
                  value={settings.chartType}
                  onChange={(e) => updateSettings({ chartType: e.target.value as any })}
                  style={{ width: '100%' }}
                >
                  <option value="candlestick">Candlestick</option>
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                  <option value="bars">Bars</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }}>
                  Font Size
                </label>
                <input
                  type="range"
                  min="8"
                  max="16"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{settings.fontSize}px</div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }}>
                  Line Width
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={settings.lineWidth}
                  onChange={(e) => updateSettings({ lineWidth: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{settings.lineWidth}px</div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={settings.showVolume}
                    onChange={(e) => updateSettings({ showVolume: e.target.checked })}
                  />
                  Show Volume
                </label>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={settings.showGrid}
                    onChange={(e) => updateSettings({ showGrid: e.target.checked })}
                  />
                  Show Grid
                </label>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={settings.autoScale}
                    onChange={(e) => updateSettings({ autoScale: e.target.checked })}
                  />
                  Auto Scale
                </label>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={settings.logScale}
                    onChange={(e) => updateSettings({ logScale: e.target.checked })}
                  />
                  Log Scale
                </label>
              </div>
            </div>
          )}

          {/* Format Tab */}
          {activeTab === 'format' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }}>
                  Time Format
                </label>
                <select
                  value={settings.timeFormat}
                  onChange={(e) => updateSettings({ timeFormat: e.target.value as any })}
                  style={{ width: '100%' }}
                >
                  <option value="24h">24 Hour</option>
                  <option value="12h">12 Hour</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: '14px', fontWeight: 'bold' }}>
                  Price Precision
                </label>
                <select
                  value={settings.priceFormat}
                  onChange={(e) => updateSettings({ priceFormat: e.target.value as any })}
                  style={{ width: '100%' }}
                >
                  <option value="auto">Auto</option>
                  <option value="2">2 Decimals</option>
                  <option value="4">4 Decimals</option>
                  <option value="6">6 Decimals</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="controls-row" style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <button
              onClick={resetToDefaults}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Reset
            </button>
            <button
              onClick={exportSettings}
              style={{
                background: 'var(--accent)',
                border: '1px solid var(--accent)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              💾 Export
            </button>
            <label
              style={{
                background: 'var(--green)',
                border: '1px solid var(--green)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-block'
              }}
            >
              📁 Import
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for persisting chart settings
export function useChartSettings(key = 'chartSettings') {
  const [settings, setSettings] = useState<ChartSettings>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(settings))
  }, [settings, key])

  return [settings, setSettings] as const
}