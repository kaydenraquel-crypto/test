import React, { useState, useEffect, useCallback } from 'react'
import { Settings, Palette, Monitor, Type, Download, Upload, RefreshCw, BarChart3, TrendingUp, Activity, BarChart2 } from 'lucide-react'

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
  borderColor: string
}

export interface TechnicalIndicators {
  showSMA20: boolean
  showSMA50: boolean
  showEMA20: boolean
  showEMA50: boolean
  showBollingerBands: boolean
  showRSI: boolean
  showMACD: boolean
  showVolume: boolean
  showVWAP: boolean
}

export interface ChartSettings {
  theme: ChartTheme
  chartType: 'candlestick' | 'line' | 'area' | 'bars'
  indicators: TechnicalIndicators
  showGrid: boolean
  showCrosshair: boolean
  showWatermark: boolean
  timeFormat: '12h' | '24h'
  priceFormat: 'auto' | '2' | '4' | '6' | '8'
  fontSize: number
  lineWidth: number
  autoScale: boolean
  logScale: boolean
  animationsEnabled: boolean
  priceLineVisible: boolean
  borderVisible: boolean
  timeScaleVisible: boolean
  rightPriceScaleVisible: boolean
}

const NOVA_THEMES: ChartTheme[] = [
  {
    name: 'NovaSignal Dark',
    backgroundColor: '#0a0a0a',
    textColor: '#ffffff',
    gridColor: '#1a1a1a',
    upColor: '#00d4aa',
    downColor: '#ff6b6b',
    wickUpColor: '#00d4aa',
    wickDownColor: '#ff6b6b',
    smaColor: '#60a5fa',
    emaColor: '#fbbf24',
    rsiColor: '#a855f7',
    macdColor: '#f97316',
    volumeColor: '#6b7280',
    borderColor: '#333333'
  },
  {
    name: 'Professional Dark',
    backgroundColor: '#1a1a1a',
    textColor: '#e5e7eb',
    gridColor: '#2a2a2a',
    upColor: '#10b981',
    downColor: '#ef4444',
    wickUpColor: '#10b981',
    wickDownColor: '#ef4444',
    smaColor: '#3b82f6',
    emaColor: '#f59e0b',
    rsiColor: '#8b5cf6',
    macdColor: '#06b6d4',
    volumeColor: '#6b7280',
    borderColor: '#374151'
  },
  {
    name: 'TradingView Dark',
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
    volumeColor: '#5d606b',
    borderColor: '#4a5568'
  },
  {
    name: 'Terminal Green',
    backgroundColor: '#000000',
    textColor: '#00ff41',
    gridColor: '#001a00',
    upColor: '#00ff41',
    downColor: '#ff0000',
    wickUpColor: '#00ff41',
    wickDownColor: '#ff0000',
    smaColor: '#00cccc',
    emaColor: '#ffff00',
    rsiColor: '#ff00ff',
    macdColor: '#ffa500',
    volumeColor: '#404040',
    borderColor: '#004400'
  },
  {
    name: 'High Contrast',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    gridColor: '#f0f0f0',
    upColor: '#008000',
    downColor: '#ff0000',
    wickUpColor: '#008000',
    wickDownColor: '#ff0000',
    smaColor: '#0000ff',
    emaColor: '#ff8c00',
    rsiColor: '#800080',
    macdColor: '#dc143c',
    volumeColor: '#696969',
    borderColor: '#cccccc'
  },
  {
    name: 'Retro Blue',
    backgroundColor: '#001122',
    textColor: '#00ffff',
    gridColor: '#003344',
    upColor: '#00ff88',
    downColor: '#ff4444',
    wickUpColor: '#00ff88',
    wickDownColor: '#ff4444',
    smaColor: '#4488ff',
    emaColor: '#ffaa00',
    rsiColor: '#ff44ff',
    macdColor: '#00aaff',
    volumeColor: '#666666',
    borderColor: '#004455'
  }
]

const DEFAULT_INDICATORS: TechnicalIndicators = {
  showSMA20: false,
  showSMA50: false,
  showEMA20: false,
  showEMA50: false,
  showBollingerBands: false,
  showRSI: false,
  showMACD: false,
  showVolume: true,
  showVWAP: false
}

const DEFAULT_SETTINGS: ChartSettings = {
  theme: NOVA_THEMES[0]!,
  chartType: 'candlestick',
  indicators: DEFAULT_INDICATORS,
  showGrid: true,
  showCrosshair: true,
  showWatermark: true,
  timeFormat: '24h',
  priceFormat: 'auto',
  fontSize: 12,
  lineWidth: 2,
  autoScale: true,
  logScale: false,
  animationsEnabled: true,
  priceLineVisible: true,
  borderVisible: true,
  timeScaleVisible: true,
  rightPriceScaleVisible: true
}

const CHART_TYPES = [
  { value: 'candlestick', label: 'Candlestick', icon: BarChart3 },
  { value: 'line', label: 'Line', icon: TrendingUp },
  { value: 'area', label: 'Area', icon: Activity },
  { value: 'bars', label: 'OHLC Bars', icon: BarChart2 }
]

interface ChartCustomizationProps {
  onSettingsChange: (settings: ChartSettings) => void
  initialSettings?: Partial<ChartSettings>
}

const ChartCustomizationEnhanced: React.FC<ChartCustomizationProps> = ({ 
  onSettingsChange, 
  initialSettings 
}) => {
  const [settings, setSettings] = useState<ChartSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...initialSettings
  }))
  
  const [activeTab, setActiveTab] = useState<'themes' | 'display' | 'indicators' | 'format'>('themes')
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    onSettingsChange(settings)
  }, [settings, onSettingsChange])

  const updateSettings = useCallback((updates: Partial<ChartSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const updateIndicators = useCallback((updates: Partial<TechnicalIndicators>) => {
    setSettings(prev => ({ 
      ...prev, 
      indicators: { ...prev.indicators, ...updates }
    }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  const exportSettings = useCallback(() => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'novasignal-chart-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [settings])

  const importSettings = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [])

  const getChartTypeIcon = (type: string) => {
    const chartType = CHART_TYPES.find(ct => ct.value === type)
    return chartType?.icon || BarChart3
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #333',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ 
              color: '#64748b', 
              margin: '0 0 4px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Settings style={{ width: '18px', height: '18px' }} />
              Chart Customization
            </h3>
            <div style={{ 
              color: '#888', 
              fontSize: '12px'
            }}>
              Customize your trading charts with themes, indicators, and display options
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              style={{
                backgroundColor: previewMode ? '#64748b' : '#2a2a2a',
                border: `1px solid ${previewMode ? '#64748b' : '#444'}`,
                borderRadius: '6px',
                padding: '6px',
                color: previewMode ? 'white' : '#888',
                cursor: 'pointer'
              }}
            >
              <Monitor style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #333',
        backgroundColor: '#0a0a0a'
      }}>
        {[
          { key: 'themes', label: 'Themes', icon: Palette },
          { key: 'display', label: 'Display', icon: Monitor },
          { key: 'indicators', label: 'Indicators', icon: BarChart3 },
          { key: 'format', label: 'Format', icon: Type }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: activeTab === tab.key ? '#64748b' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#888',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal'
              }}
            >
              <Icon style={{ width: '14px', height: '14px' }} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div style={{
        padding: '20px',
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        {/* Themes Tab */}
        {activeTab === 'themes' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                color: 'white', 
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Theme Presets
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px'
              }}>
                {NOVA_THEMES.map(theme => (
                  <div
                    key={theme.name}
                    onClick={() => updateSettings({ theme })}
                    style={{
                      background: theme.backgroundColor,
                      border: `2px solid ${settings.theme.name === theme.name ? '#64748b' : theme.borderColor}`,
                      borderRadius: '8px',
                      padding: '12px 8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      color: theme.textColor,
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '8px'
                    }}>
                      {theme.name}
                    </div>
                    
                    {/* Theme Preview */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'end',
                      gap: '2px',
                      height: '20px'
                    }}>
                      <div style={{
                        width: '3px',
                        height: '12px',
                        backgroundColor: theme.upColor,
                        borderRadius: '1px'
                      }} />
                      <div style={{
                        width: '3px',
                        height: '16px',
                        backgroundColor: theme.downColor,
                        borderRadius: '1px'
                      }} />
                      <div style={{
                        width: '3px',
                        height: '8px',
                        backgroundColor: theme.upColor,
                        borderRadius: '1px'
                      }} />
                      <div style={{
                        width: '3px',
                        height: '14px',
                        backgroundColor: theme.upColor,
                        borderRadius: '1px'
                      }} />
                      <div style={{
                        width: '3px',
                        height: '10px',
                        backgroundColor: theme.downColor,
                        borderRadius: '1px'
                      }} />
                    </div>

                    {settings.theme.name === theme.name && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#64748b',
                        borderRadius: '50%'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <h4 style={{ 
                color: 'white', 
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Custom Colors
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px'
              }}>
                {[
                  { key: 'backgroundColor', label: 'Background' },
                  { key: 'upColor', label: 'Bullish' },
                  { key: 'downColor', label: 'Bearish' },
                  { key: 'smaColor', label: 'SMA' },
                  { key: 'emaColor', label: 'EMA' },
                  { key: 'volumeColor', label: 'Volume' }
                ].map(color => (
                  <div key={color.key}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '4px', 
                      fontSize: '11px',
                      color: '#888'
                    }}>
                      {color.label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="color"
                        value={(settings.theme as any)[color.key]}
                        onChange={(e) => {
                          const updates = { [color.key]: e.target.value }
                          if (color.key === 'upColor') {
                            updates.wickUpColor = e.target.value
                          } else if (color.key === 'downColor') {
                            updates.wickDownColor = e.target.value
                          }
                          updateSettings({ 
                            theme: { ...settings.theme, ...updates }
                          })
                        }}
                        style={{
                          width: '100%',
                          height: '32px',
                          border: '1px solid #333',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Display Tab */}
        {activeTab === 'display' && (
          <div>
            {/* Chart Type */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ 
                color: 'white', 
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Chart Type
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '8px'
              }}>
                {CHART_TYPES.map(type => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      onClick={() => updateSettings({ chartType: type.value as any })}
                      style={{
                        backgroundColor: settings.chartType === type.value ? '#64748b' : '#2a2a2a',
                        color: settings.chartType === type.value ? 'white' : '#888',
                        border: `1px solid ${settings.chartType === type.value ? '#64748b' : '#333'}`,
                        borderRadius: '8px',
                        padding: '12px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px'
                      }}
                    >
                      <Icon style={{ width: '16px', height: '16px' }} />
                      {type.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Display Options */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ 
                color: 'white', 
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Display Options
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {[
                  { key: 'showGrid', label: 'Show Grid' },
                  { key: 'showCrosshair', label: 'Show Crosshair' },
                  { key: 'showWatermark', label: 'Show Watermark' },
                  { key: 'autoScale', label: 'Auto Scale' },
                  { key: 'logScale', label: 'Logarithmic Scale' },
                  { key: 'animationsEnabled', label: 'Enable Animations' },
                  { key: 'priceLineVisible', label: 'Show Price Line' },
                  { key: 'borderVisible', label: 'Show Border' },
                  { key: 'timeScaleVisible', label: 'Show Time Scale' },
                  { key: 'rightPriceScaleVisible', label: 'Show Price Scale' }
                ].map(option => (
                  <label
                    key={option.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#ccc'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={(settings as any)[option.key]}
                      onChange={(e) => updateSettings({ [option.key]: e.target.checked })}
                      style={{ accentColor: '#64748b' }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Numeric Settings */}
            <div>
              <h4 style={{ 
                color: 'white', 
                margin: '0 0 12px 0',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Sizing & Appearance
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    Font Size: {settings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="16"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                    style={{ 
                      width: '100%',
                      accentColor: '#64748b'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '4px', 
                    fontSize: '12px',
                    color: '#888'
                  }}>
                    Line Width: {settings.lineWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={settings.lineWidth}
                    onChange={(e) => updateSettings({ lineWidth: parseInt(e.target.value) })}
                    style={{ 
                      width: '100%',
                      accentColor: '#64748b'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Indicators Tab */}
        {activeTab === 'indicators' && (
          <div>
            <h4 style={{ 
              color: 'white', 
              margin: '0 0 12px 0',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              Technical Indicators
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {[
                { key: 'showSMA20', label: 'SMA 20', color: settings.theme.smaColor },
                { key: 'showSMA50', label: 'SMA 50', color: settings.theme.smaColor },
                { key: 'showEMA20', label: 'EMA 20', color: settings.theme.emaColor },
                { key: 'showEMA50', label: 'EMA 50', color: settings.theme.emaColor },
                { key: 'showBollingerBands', label: 'Bollinger Bands', color: '#8b5cf6' },
                { key: 'showRSI', label: 'RSI (14)', color: settings.theme.rsiColor },
                { key: 'showMACD', label: 'MACD', color: settings.theme.macdColor },
                { key: 'showVolume', label: 'Volume', color: settings.theme.volumeColor },
                { key: 'showVWAP', label: 'VWAP', color: '#f59e0b' }
              ].map(indicator => (
                <div
                  key={indicator.key}
                  style={{
                    backgroundColor: (settings.indicators as any)[indicator.key] ? '#2a2a2a' : '#1a1a1a',
                    border: `1px solid ${(settings.indicators as any)[indicator.key] ? indicator.color : '#333'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => updateIndicators({ [indicator.key]: !(settings.indicators as any)[indicator.key] })}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: (settings.indicators as any)[indicator.key] ? indicator.color : '#444',
                      borderRadius: '2px'
                    }} />
                    <span style={{
                      color: (settings.indicators as any)[indicator.key] ? 'white' : '#888',
                      fontSize: '13px',
                      fontWeight: (settings.indicators as any)[indicator.key] ? 'bold' : 'normal'
                    }}>
                      {indicator.label}
                    </span>
                    <div style={{
                      marginLeft: 'auto',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: (settings.indicators as any)[indicator.key] ? indicator.color : '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {(settings.indicators as any)[indicator.key] && (
                        <span style={{ color: 'white', fontSize: '10px' }}>✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Format Tab */}
        {activeTab === 'format' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  Time Format
                </label>
                <select
                  value={settings.timeFormat}
                  onChange={(e) => updateSettings({ timeFormat: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                >
                  <option value="24h">24 Hour Format</option>
                  <option value="12h">12 Hour Format</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  Price Precision
                </label>
                <select
                  value={settings.priceFormat}
                  onChange={(e) => updateSettings({ priceFormat: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #333',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '13px'
                  }}
                >
                  <option value="auto">Auto Detection</option>
                  <option value="2">2 Decimal Places</option>
                  <option value="4">4 Decimal Places</option>
                  <option value="6">6 Decimal Places</option>
                  <option value="8">8 Decimal Places</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #333',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={resetToDefaults}
            style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <RefreshCw style={{ width: '14px', height: '14px' }} />
            Reset
          </button>
          
          <button
            onClick={exportSettings}
            style={{
              backgroundColor: '#64748b',
              border: '1px solid #64748b',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <Download style={{ width: '14px', height: '14px' }} />
            Export
          </button>
          
          <label
            style={{
              backgroundColor: '#10b981',
              border: '1px solid #10b981',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <Upload style={{ width: '14px', height: '14px' }} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div style={{
          fontSize: '11px',
          color: '#666'
        }}>
          {Object.values(settings.indicators).filter(Boolean).length} indicators active
        </div>
      </div>
    </div>
  )
}

export default ChartCustomizationEnhanced

// Hook for persisting chart settings
export function useChartSettings(key = 'novasignalChartSettings') {
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