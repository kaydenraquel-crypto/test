// src/components/DXChart.tsx  
// DXcharts Lite Integration for NovaSignal
import React, { useEffect, useRef, useState } from 'react'
import { createChart } from '@devexperts/dxcharts-lite'

export interface DXCandle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface DXChartProps {
  data: DXCandle[]
  symbol: string
  market: 'crypto' | 'stocks'
  interval: number
  onCandleClick?: (candle: DXCandle) => void
  className?: string
  style?: React.CSSProperties
}

export default function DXChart({ 
  data, 
  symbol, 
  market, 
  interval, 
  onCandleClick, 
  className = '',
  style = {}
}: DXChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Convert our candle data to DXcharts format
  const convertToDXFormat = (candles: DXCandle[]) => {
    return candles.map(candle => ({
      timestamp: candle.timestamp * 1000, // DXcharts expects milliseconds
      open: candle.open,
      high: candle.high, 
      low: candle.low,
      close: candle.close,
      volume: candle.volume || 0
    }))
  }

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return

    try {
      console.log('🚀 Initializing DXChart for', symbol)
      setIsLoading(true)
      setError(null)

      // Create chart instance
      const chart = createChart(containerRef.current, {
        components: {
          volumes: {
            visible: true
          }
        }
      })

      chartInstanceRef.current = chart
      setIsLoading(false)
      
      console.log('✅ DXChart initialized successfully')

    } catch (err) {
      console.error('❌ DXChart initialization failed:', err)
      setError(err instanceof Error ? err.message : 'Chart initialization failed')
      setIsLoading(false)
    }

    // Cleanup
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy?.()
          chartInstanceRef.current = null
        } catch (err) {
          console.warn('⚠️ Chart cleanup warning:', err)
        }
      }
    }
  }, [symbol]) // Re-initialize when symbol changes

  // Update chart data
  useEffect(() => {
    if (!chartInstanceRef.current || !data || data.length === 0) return

    try {
      console.log(`📊 Updating DXChart data for ${symbol}:`, {
        dataLength: data.length,
        firstCandle: data[0] ? {
          timestamp: data[0].timestamp,
          date: new Date(data[0].timestamp * 1000).toLocaleString(),
          close: data[0].close
        } : null,
        lastCandle: data[data.length - 1] ? {
          timestamp: data[data.length - 1]?.timestamp || 0,
          date: new Date((data[data.length - 1]?.timestamp || 0) * 1000).toLocaleString(),
          close: data[data.length - 1]?.close || 0
        } : null
      })

      const dxData = convertToDXFormat(data)
      
      // Set candle data
      chartInstanceRef.current.setData({ 
        candles: dxData 
      })

      console.log('✅ DXChart data updated successfully')

    } catch (err) {
      console.error('❌ DXChart data update failed:', err)
      setError(err instanceof Error ? err.message : 'Data update failed')
    }
  }, [data, symbol])

  // Handle loading state
  if (isLoading) {
    return (
      <div 
        className={`dx-chart-container ${className}`}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '400px',
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          ...style 
        }}
      >
        <div>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            🚀 Loading DXChart...
          </div>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #4fc3f7', 
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div 
        className={`dx-chart-container ${className}`}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '400px',
          backgroundColor: '#1e1e1e',
          color: '#f44336',
          flexDirection: 'column',
          ...style 
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
        <div>DXChart Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#4fc3f7',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .dx-chart-container {
            position: relative;
            width: 100%;
            height: 400px;
            background-color: #1e1e1e;
          }
        `}
      </style>
      <div 
        ref={containerRef}
        className={`dx-chart-container ${className}`}
        style={{
          width: '100%',
          height: '400px',
          ...style
        }}
      />
    </>
  )
}

// Export types for use in parent components
// Types are now exported through the main types/index.ts file