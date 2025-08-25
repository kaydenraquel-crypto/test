// src/components/DXChartComponent.jsx
// Working DXcharts React Component for NovaSignal
import React, { useEffect, useRef, useState } from 'react'

export default function DXChartComponent({ 
  data = [], 
  symbol = 'BTCUSDT', 
  market = 'crypto',
  interval = 60,
  height = 500,
  onReady = null,
  className = ''
}) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize DXcharts
  useEffect(() => {
    let mounted = true

    const initChart = async () => {
      if (!containerRef.current || !mounted) return

      try {
        setIsLoading(true)
        setError(null)
        console.log('🚀 Initializing DXcharts for', symbol)

        // Dynamic import of DXcharts
        const { createChart } = await import('@devexperts/dxcharts-lite')
        
        if (!mounted) return

        // Create chart with professional configuration
        const chartInstance = createChart(containerRef.current, {
          // Theme configuration
          layout: {
            background: {
              color: '#1a1a1a'
            },
            textColor: '#ffffff'
          },
          grid: {
            vertLines: {
              color: '#2a2a2a',
              style: 1,
              visible: true
            },
            horzLines: {
              color: '#2a2a2a', 
              style: 1,
              visible: true
            }
          },
          crosshair: {
            mode: 0, // Normal crosshair
            vertLine: {
              color: '#4fc3f7',
              width: 1,
              style: 0
            },
            horzLine: {
              color: '#4fc3f7',
              width: 1, 
              style: 0
            }
          },
          timeScale: {
            borderColor: '#4a5568',
            timeVisible: true,
            secondsVisible: false
          },
          rightPriceScale: {
            borderColor: '#4a5568',
            scaleMargins: {
              top: 0.1,
              bottom: 0.1
            }
          },
          overlays: true,
          handleScale: {
            axisPressedMouseMove: true,
            mouseWheel: true,
            pinch: true
          },
          handleScroll: {
            mouseWheel: true,
            pressedMouseMove: true,
            horzTouchDrag: true,
            vertTouchDrag: true
          }
        })

        chartRef.current = chartInstance
        setIsReady(true)
        setIsLoading(false)

        console.log('✅ DXcharts initialized successfully')
        
        if (onReady) {
          onReady(chartInstance)
        }

      } catch (err) {
        if (!mounted) return
        console.error('❌ DXcharts initialization failed:', err)
        setError(`Chart initialization failed: ${err.message}`)
        setIsLoading(false)
      }
    }

    initChart()

    return () => {
      mounted = false
      if (chartRef.current) {
        try {
          chartRef.current.remove()
          chartRef.current = null
        } catch (err) {
          console.warn('Chart cleanup warning:', err)
        }
      }
    }
  }, [symbol])

  // Update chart data
  useEffect(() => {
    if (!chartRef.current || !isReady || !data || data.length === 0) return

    try {
      console.log(`📊 Updating DXcharts data for ${symbol}:`, {
        dataLength: data.length,
        firstCandle: data[0],
        lastCandle: data[data.length - 1]
      })

      // Convert data to DXcharts format
      const dxData = data.map(item => ({
        time: (item.time || item.timestamp) * (item.time > 1e10 ? 1 : 1000), // Handle seconds vs milliseconds
        open: Number(item.open),
        high: Number(item.high),
        low: Number(item.low),
        close: Number(item.close),
        volume: item.volume ? Number(item.volume) : 0
      }))

      // Sort by time
      dxData.sort((a, b) => a.time - b.time)

      // Update chart data
      chartRef.current.setData({
        candles: dxData
      })

      console.log('✅ DXcharts data updated successfully')

    } catch (err) {
      console.error('❌ DXcharts data update failed:', err)
      setError(`Data update failed: ${err.message}`)
    }
  }, [data, symbol, isReady])

  // Loading state
  if (isLoading) {
    return (
      <div 
        className={`dx-chart-loading ${className}`}
        style={{ 
          height,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          flexDirection: 'column',
          border: '1px solid #333'
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🚀</div>
        <div style={{ marginBottom: '10px' }}>Initializing DXcharts...</div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #4fc3f7', 
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`
            @keyframes spin {
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
          height,
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          color: '#f44336',
          flexDirection: 'column',
          border: '1px solid #f44336',
          padding: '20px'
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>DXcharts Error</div>
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>{error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
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

  // Main chart
  return (
    <div 
      ref={containerRef}
      className={`dx-chart-container ${className}`}
      style={{ 
        width: '100%', 
        height,
        backgroundColor: '#1a1a1a',
        border: '1px solid #333'
      }}
    />
  )
}