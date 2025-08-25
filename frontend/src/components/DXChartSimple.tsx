// Simple DXCharts component using the working test approach
import React, { useEffect, useRef, useState } from 'react'

// Import like the working test component
let createChartFunction: any = null
try {
  const dxcharts = require('@devexperts/dxcharts-lite')
  createChartFunction = dxcharts.createChart || dxcharts.default?.createChart || dxcharts
  console.log('📊 DXCharts available:', !!createChartFunction)
} catch (error) {
  console.error('❌ DXCharts import failed:', error)
}

interface DXChartSimpleProps {
  data: any[]
  symbol: string
  height?: number
  width?: string
}

export default function DXChartSimple({
  data,
  symbol,
  height = 500,
  width = '100%'
}: DXChartSimpleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current || !createChartFunction) return

    try {
      console.log('🚀 Creating simple DXChart for', symbol)
      
      // Clear container
      containerRef.current.innerHTML = ''

      // Create chart using the function from require
      const chart = createChartFunction(containerRef.current, {
        // Basic configuration
      })

      chartRef.current = chart
      setIsReady(true)
      setError(null)
      
      console.log('✅ Simple DXChart initialized')

    } catch (err) {
      const error = err as Error
      console.error('❌ Simple DXChart failed:', error)
      setError(`Chart initialization failed: ${error.message}`)
    }
  }, [symbol])

  // Update data
  useEffect(() => {
    if (!chartRef.current || !isReady || !data || data.length === 0) return

    try {
      console.log(`📊 Setting data for ${symbol}:`, data.length, 'points')
      
      // Basic data format for DXCharts
      const chartData = data.map(item => ({
        time: item.time || item.ts,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume || 0
      })).filter(item => 
        item.time && 
        typeof item.open === 'number' &&
        typeof item.high === 'number' &&
        typeof item.low === 'number' &&
        typeof item.close === 'number'
      )

      if (chartData.length === 0) {
        console.warn('No valid chart data')
        return
      }

      // Try different data setting methods
      if (chartRef.current.setData) {
        chartRef.current.setData({ candles: chartData })
      } else if (chartRef.current.updateData) {
        chartRef.current.updateData(chartData)
      } else if (chartRef.current.data) {
        chartRef.current.data = chartData
      }

      console.log('✅ Simple DXChart data set')

    } catch (err) {
      const error = err as Error
      console.error('❌ Simple DXChart data update failed:', error)
      setError(`Data update failed: ${error.message}`)
    }
  }, [data, symbol, isReady])

  // Cleanup
  useEffect(() => {
    return () => {
      if (chartRef.current && chartRef.current.remove) {
        try {
          chartRef.current.remove()
        } catch (err) {
          console.warn('Chart cleanup warning:', err)
        }
      }
    }
  }, [])

  if (!createChartFunction) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#f44336',
        border: '2px solid #f44336',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>❌</div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>DXCharts Not Available</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            @devexperts/dxcharts-lite could not be loaded
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#f44336',
        border: '2px solid #f44336',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>DXCharts Error</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      style={{ 
        width,
        height,
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  )
}