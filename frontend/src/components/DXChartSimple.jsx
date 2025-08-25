// src/components/DXChartSimple.jsx
// Simple DXcharts Lite Integration (JavaScript)
import React, { useEffect, useRef, useState } from 'react'

export default function DXChartSimple({ 
  data = [], 
  symbol = 'BTCUSDT', 
  market = 'crypto', 
  interval = 60,
  style = {}
}) {
  const containerRef = useRef(null)
  const chartInstanceRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Convert data to DXcharts format
  const convertToDXFormat = (candles) => {
    if (!Array.isArray(candles)) return []
    
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

    const initChart = async () => {
      try {
        console.log('🚀 Initializing DXChart for', symbol)
        setIsLoading(true)
        setError(null)

        // Dynamic import to handle potential issues
        const DXChart = await import('@devexperts/dxcharts-lite')
        
        // Create chart instance with minimal config
        const chart = DXChart.createChart(containerRef.current, {
          // Minimal configuration
          theme: 'dark'
        })

        chartInstanceRef.current = chart
        setIsLoading(false)
        
        console.log('✅ DXChart initialized successfully')

      } catch (err) {
        console.error('❌ DXChart initialization failed:', err)
        setError(err.message || 'Chart initialization failed')
        setIsLoading(false)
      }
    }

    initChart()

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
  }, [symbol])

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
          timestamp: data[data.length - 1].timestamp,
          date: new Date(data[data.length - 1].timestamp * 1000).toLocaleString(),
          close: data[data.length - 1].close
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
      setError(err.message || 'Data update failed')
    }
  }, [data, symbol])

  // Handle loading state
  if (isLoading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '400px',
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          flexDirection: 'column',
          ...style 
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🚀</div>
        <div style={{ marginBottom: '10px' }}>Loading DXChart...</div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #4fc3f7', 
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div 
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
        <div style={{ marginBottom: '10px' }}>DXChart Error:</div>
        <div style={{ marginBottom: '10px', textAlign: 'center', maxWidth: '80%' }}>{error}</div>
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

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          height: '400px',
          backgroundColor: '#1e1e1e',
          ...style
        }}
      />
    </>
  )
}