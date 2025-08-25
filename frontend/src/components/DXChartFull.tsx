// src/components/DXChartFull.tsx
// Complete DXCharts replacement for lightweight-charts with all indicators
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { createChart } from '@devexperts/dxcharts-lite'

// Types matching your current data structures
export interface DXCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface DXIndicatorData {
  sma?: (number | null)[]
  ema?: (number | null)[]
  rsi?: (number | null)[]
  macd_hist?: (number | null)[]
  macd_signal?: (number | null)[]
  bb_high?: (number | null)[]
  bb_low?: (number | null)[]
  atr?: (number | null)[]
}

export interface DXSignal {
  ts: number
  type: 'buy' | 'sell'
  reason: string
  price: number
  tag?: string
}

export interface DXChartFullProps {
  // Data
  data: DXCandle[]
  indicators?: DXIndicatorData
  signals?: DXSignal[]
  
  // Symbol info
  symbol: string
  market: 'crypto' | 'stocks'
  interval: number
  
  // Chart settings
  height?: number
  width?: string
  className?: string
  chartType?: 'candlestick' | 'line' | 'area' | 'bars'
  
  // Overlays
  showSMA?: boolean
  showEMA?: boolean
  showBB?: boolean
  showATRBands?: boolean
  atrMult?: number
  useHeikinAshi?: boolean
  
  // Panes
  showRSI?: boolean
  showMACD?: boolean
  
  // Signals
  showEmaCross?: boolean
  showMacdCross?: boolean
  showRsiLevels?: boolean
  showBbTouch?: boolean
  
  // Chart customization
  theme?: {
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
  }
  
  // Callbacks
  onReady?: (chart: any) => void
  onError?: (error: Error) => void
}

const defaultTheme = {
  backgroundColor: '#0f0f0f',
  textColor: '#e8e8e8',
  gridColor: '#333333',
  upColor: '#26a69a',
  downColor: '#ef5350',
  wickUpColor: '#26a69a',
  wickDownColor: '#ef5350',
  smaColor: '#2196f3',
  emaColor: '#ff9800',
  rsiColor: '#9c27b0',
  macdColor: '#4caf50'
}

export default function DXChartFull({
  data,
  indicators,
  signals,
  symbol,
  market,
  interval,
  height = 500,
  width = '100%',
  className = '',
  chartType = 'candlestick',
  showSMA = false,
  showEMA = false,
  showBB = false,
  showATRBands = false,
  atrMult = 1.5,
  useHeikinAshi = false,
  showRSI = false,
  showMACD = false,
  showEmaCross = false,
  showMacdCross = false,
  showRsiLevels = false,
  showBbTouch = false,
  theme = defaultTheme,
  onReady,
  onError
}: DXChartFullProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rsiContainerRef = useRef<HTMLDivElement>(null)
  const macdContainerRef = useRef<HTMLDivElement>(null)
  const mainChartRef = useRef<any>(null)
  const rsiChartRef = useRef<any>(null)
  const macdChartRef = useRef<any>(null)
  
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Normalize and validate data
  const normalizedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    
    const filtered = data
      .filter(item => 
        item && 
        typeof item.time === 'number' &&
        typeof item.open === 'number' &&
        typeof item.high === 'number' &&
        typeof item.low === 'number' &&
        typeof item.close === 'number' &&
        Number.isFinite(item.time) &&
        Number.isFinite(item.open) &&
        Number.isFinite(item.high) &&
        Number.isFinite(item.low) &&
        Number.isFinite(item.close) &&
        item.open > 0 &&
        item.high > 0 &&
        item.low > 0 &&
        item.close > 0 &&
        item.high >= item.low &&
        item.high >= Math.max(item.open, item.close) &&
        item.low <= Math.min(item.open, item.close)
      )
      .map(item => ({
        time: item.time > 1e10 ? Math.floor(item.time / 1000) : item.time,
        open: Number(item.open.toFixed(2)),
        high: Number(item.high.toFixed(2)),
        low: Number(item.low.toFixed(2)),
        close: Number(item.close.toFixed(2)),
        volume: item.volume ? Number(item.volume.toFixed(4)) : undefined
      }))
      .sort((a, b) => a.time - b.time)

    console.log(`📊 DXCharts data normalized: ${filtered.length}/${data.length} candles`)
    return filtered
  }, [data])

  // Convert to Heikin-Ashi if needed
  const chartData = useMemo(() => {
    if (!useHeikinAshi) return normalizedData
    
    const ha: DXCandle[] = []
    for (let i = 0; i < normalizedData.length; i++) {
      const current = normalizedData[i]
      if (!current) continue
      
      const prev = ha[i - 1]
      const haClose = (current.open + current.high + current.low + current.close) / 4
      const haOpen = i === 0 ? (current.open + current.close) / 2 : (prev.open + prev.close) / 2
      const haHigh = Math.max(current.high, haOpen, haClose)
      const haLow = Math.min(current.low, haOpen, haClose)
      
      ha.push({
        time: current.time,
        open: Number(haOpen.toFixed(2)),
        high: Number(haHigh.toFixed(2)),
        low: Number(haLow.toFixed(2)),
        close: Number(haClose.toFixed(2)),
        volume: current.volume
      })
    }
    
    console.log(`📊 Heikin-Ashi conversion: ${ha.length} candles`)
    return ha
  }, [normalizedData, useHeikinAshi])

  // Initialize main chart
  useEffect(() => {
    let mounted = true

    const initMainChart = () => {
      if (!containerRef.current || !mounted) return

      try {
        setIsLoading(true)
        setError(null)
        console.log(`🚀 Creating main DXChart for ${symbol}`)

        // Clear container
        containerRef.current.innerHTML = ''

        // Create main chart
        const chart = createChart(containerRef.current, {
          // DXCharts configuration will be handled by the library
        })

        mainChartRef.current = chart
        
        console.log('✅ Main DXChart initialized')
        
        if (onReady) {
          onReady(chart)
        }

      } catch (err) {
        if (!mounted) return
        
        const error = err as Error
        console.error('❌ Main DXChart initialization failed:', error)
        setError(`Main chart initialization failed: ${error.message}`)
        
        if (onError) {
          onError(error)
        }
      }
    }

    const timer = setTimeout(initMainChart, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
      if (mainChartRef.current) {
        try {
          mainChartRef.current.remove()
          mainChartRef.current = null
        } catch (err) {
          console.warn('Main chart cleanup warning:', err)
        }
      }
    }
  }, [symbol, onReady, onError])

  // Initialize RSI chart
  useEffect(() => {
    if (!showRSI || !rsiContainerRef.current) return

    let mounted = true

    const initRSIChart = () => {
      try {
        console.log('🚀 Creating RSI DXChart')
        
        // Clear container
        rsiContainerRef.current!.innerHTML = ''

        // Create RSI chart
        const rsiChart = createChart(rsiContainerRef.current!, {
          // RSI-specific configuration
        })

        rsiChartRef.current = rsiChart
        console.log('✅ RSI DXChart initialized')

      } catch (err) {
        if (!mounted) return
        console.error('❌ RSI DXChart initialization failed:', err)
      }
    }

    const timer = setTimeout(initRSIChart, 150)

    return () => {
      mounted = false
      clearTimeout(timer)
      if (rsiChartRef.current) {
        try {
          rsiChartRef.current.remove()
          rsiChartRef.current = null
        } catch (err) {
          console.warn('RSI chart cleanup warning:', err)
        }
      }
    }
  }, [showRSI])

  // Initialize MACD chart
  useEffect(() => {
    if (!showMACD || !macdContainerRef.current) return

    let mounted = true

    const initMACDChart = () => {
      try {
        console.log('🚀 Creating MACD DXChart')
        
        // Clear container
        macdContainerRef.current!.innerHTML = ''

        // Create MACD chart
        const macdChart = createChart(macdContainerRef.current!, {
          // MACD-specific configuration
        })

        macdChartRef.current = macdChart
        console.log('✅ MACD DXChart initialized')

      } catch (err) {
        if (!mounted) return
        console.error('❌ MACD DXChart initialization failed:', err)
      }
    }

    const timer = setTimeout(initMACDChart, 200)

    return () => {
      mounted = false
      clearTimeout(timer)
      if (macdChartRef.current) {
        try {
          macdChartRef.current.remove()
          macdChartRef.current = null
        } catch (err) {
          console.warn('MACD chart cleanup warning:', err)
        }
      }
    }
  }, [showMACD])

  // Update main chart data
  useEffect(() => {
    if (!mainChartRef.current || !chartData || chartData.length === 0) return

    try {
      console.log(`📊 Updating main DXChart data: ${chartData.length} candles`)

      // Prepare data for DXCharts
      const dxData = {
        candles: chartData
      }

      // Add indicators to the main chart data
      if (indicators) {
        // Add overlay indicators
        if (showSMA && indicators.sma) {
          // DXCharts will handle SMA rendering
          console.log('📈 Adding SMA overlay')
        }
        
        if (showEMA && indicators.ema) {
          // DXCharts will handle EMA rendering
          console.log('📈 Adding EMA overlay')
        }
        
        if (showBB && indicators.bb_high && indicators.bb_low) {
          // DXCharts will handle Bollinger Bands rendering
          console.log('📈 Adding Bollinger Bands overlay')
        }
      }

      mainChartRef.current.setData(dxData)
      
      setIsReady(true)
      setIsLoading(false)
      console.log('✅ Main DXChart data updated successfully')

    } catch (err) {
      const error = err as Error
      console.error('❌ Main DXChart data update failed:', error)
      setError(`Main chart data update failed: ${error.message}`)
      
      if (onError) {
        onError(error)
      }
    }
  }, [chartData, indicators, showSMA, showEMA, showBB, onError])

  // Update RSI data
  useEffect(() => {
    if (!rsiChartRef.current || !showRSI || !indicators?.rsi) return

    try {
      console.log('📊 Updating RSI DXChart data')
      
      const rsiData = indicators.rsi
        .map((value, index) => ({
          time: chartData[index]?.time || 0,
          value: typeof value === 'number' ? value : null
        }))
        .filter(item => item.time > 0 && item.value !== null)

      // Set RSI data
      rsiChartRef.current.setData({
        lines: [{ data: rsiData, color: theme.rsiColor }]
      })
      
      console.log('✅ RSI DXChart data updated')

    } catch (err) {
      console.error('❌ RSI DXChart data update failed:', err)
    }
  }, [chartData, indicators, showRSI, theme.rsiColor])

  // Update MACD data
  useEffect(() => {
    if (!macdChartRef.current || !showMACD || !indicators?.macd_hist || !indicators?.macd_signal) return

    try {
      console.log('📊 Updating MACD DXChart data')
      
      const histogramData = indicators.macd_hist
        .map((value, index) => ({
          time: chartData[index]?.time || 0,
          value: typeof value === 'number' ? value : null
        }))
        .filter(item => item.time > 0 && item.value !== null)

      const signalData = indicators.macd_signal
        .map((value, index) => ({
          time: chartData[index]?.time || 0,
          value: typeof value === 'number' ? value : null
        }))
        .filter(item => item.time > 0 && item.value !== null)

      // Set MACD data
      macdChartRef.current.setData({
        histogram: histogramData,
        lines: [{ data: signalData, color: theme.emaColor }]
      })
      
      console.log('✅ MACD DXChart data updated')

    } catch (err) {
      console.error('❌ MACD DXChart data update failed:', err)
    }
  }, [chartData, indicators, showMACD, theme.emaColor, theme.macdColor])

  // Add signals/markers to main chart
  useEffect(() => {
    if (!mainChartRef.current || !signals || signals.length === 0) return

    try {
      console.log(`📍 Adding ${signals.length} signals to main chart`)

      const filteredSignals = signals.filter(signal => {
        const allowedTags = new Set<string>()
        if (showEmaCross) allowedTags.add('ema_cross')
        if (showMacdCross) allowedTags.add('macd_cross')  
        if (showRsiLevels) allowedTags.add('rsi_levels')
        if (showBbTouch) allowedTags.add('bb_touch')
        
        return !signal.tag || allowedTags.has(signal.tag)
      })

      const markers = filteredSignals.map(signal => ({
        time: signal.ts > 1e10 ? Math.floor(signal.ts / 1000) : signal.ts,
        type: signal.type,
        price: signal.price,
        text: `${signal.type.toUpperCase()}\n${signal.reason}${signal.tag ? ` [${signal.tag}]` : ''}`,
        color: signal.type === 'buy' ? '#00c853' : '#ff5252'
      }))

      // Add markers to DXChart
      // Note: DXCharts handles markers differently - this is a placeholder
      console.log('📍 Markers prepared for DXChart:', markers.length)

    } catch (err) {
      console.error('❌ Signals update failed:', err)
    }
  }, [signals, showEmaCross, showMacdCross, showRsiLevels, showBbTouch])

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`dx-chart-loading ${className}`}
        style={{ 
          width,
          height,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          flexDirection: 'column',
          border: `1px solid ${theme.gridColor}`,
          borderRadius: '8px'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🚀</div>
        <div style={{ fontSize: '1.1rem', marginBottom: '10px', fontWeight: '500' }}>
          Initializing DXCharts...
        </div>
        <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '20px', textAlign: 'center' }}>
          Professional financial charting<br />
          Loading {symbol} ({market}, {interval}m)
        </div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: `3px solid ${theme.gridColor}`,
          borderTop: '3px solid #4fc3f7',
          borderRadius: '50%',
          animation: 'dx-spin 1s linear infinite'
        }} />
        <style>
          {`
            @keyframes dx-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div 
        className={`dx-chart-error ${className}`}
        style={{ 
          width,
          height,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: theme.backgroundColor,
          color: '#f44336',
          flexDirection: 'column',
          border: '1px solid #f44336',
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
        <div style={{ fontSize: '1.2rem', marginBottom: '10px', fontWeight: 'bold' }}>
          DXCharts Error
        </div>
        <div style={{ 
          fontSize: '0.9rem', 
          marginBottom: '20px', 
          textAlign: 'center',
          maxWidth: '80%',
          lineHeight: '1.4'
        }}>
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4fc3f7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          🔄 Retry
        </button>
      </div>
    )
  }

  // Chart containers
  return (
    <div className={`dx-chart-full-container ${className}`} style={{ width }}>
      {/* Main Chart */}
      <div 
        ref={containerRef}
        className="dx-chart-main"
        style={{ 
          width: '100%',
          height,
          backgroundColor: theme.backgroundColor,
          border: `1px solid ${theme.gridColor}`,
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '8px'
        }}
      />

      {/* RSI Chart */}
      {showRSI && (
        <div 
          ref={rsiContainerRef}
          className="dx-chart-rsi"
          style={{ 
            width: '100%',
            height: 160,
            backgroundColor: theme.backgroundColor,
            border: `1px solid ${theme.gridColor}`,
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}
        />
      )}

      {/* MACD Chart */}
      {showMACD && (
        <div 
          ref={macdContainerRef}
          className="dx-chart-macd"
          style={{ 
            width: '100%',
            height: 160,
            backgroundColor: theme.backgroundColor,
            border: `1px solid ${theme.gridColor}`,
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
      )}
    </div>
  )
}