import React, { useEffect, useRef, useState } from 'react'

// Declare global DXCharts types
declare global {
  interface Window {
    DXCharts?: any
  }
}

interface DXChartStandaloneProps {
  data: any[]
  symbol: string
  height?: number
  width?: string
}

export default function DXChartStandalone({
  data,
  symbol,
  height = 500,
  width = '100%'
}: DXChartStandaloneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const [status, setStatus] = useState('Loading DXCharts...')
  const [isReady, setIsReady] = useState(false)

  // Load DXCharts standalone script
  useEffect(() => {
    const loadDXCharts = async () => {
      try {
        // Check if already loaded
        if (window.DXCharts) {
          setIsReady(true)
          setStatus('DXCharts Ready')
          return
        }

        console.log('📊 Loading DXCharts standalone build...')
        
        // Create script element to load the standalone build
        const script = document.createElement('script')
        script.src = '/node_modules/@devexperts/dxcharts-lite/dist/dxchart.min.js'
        script.async = true
        
        script.onload = () => {
          console.log('✅ DXCharts standalone loaded successfully')
          
          // The standalone build should expose DXCharts globally
          if (window.DXCharts || (window as any).createChart) {
            window.DXCharts = window.DXCharts || { createChart: (window as any).createChart }
            setIsReady(true)
            setStatus('DXCharts Ready')
          } else {
            console.error('❌ DXCharts not found on window object')
            setStatus('DXCharts load error')
          }
        }
        
        script.onerror = (error) => {
          console.error('❌ Failed to load DXCharts script:', error)
          setStatus('Failed to load DXCharts')
        }
        
        document.head.appendChild(script)
        
      } catch (error) {
        console.error('❌ Error loading DXCharts:', error)
        setStatus('Error loading DXCharts')
      }
    }

    loadDXCharts()
    
    // Cleanup script on unmount
    return () => {
      const scripts = document.querySelectorAll('script[src*="dxchart.min.js"]')
      scripts.forEach(script => script.remove())
    }
  }, [])

  // Initialize chart when DXCharts is ready
  useEffect(() => {
    if (!isReady || !containerRef.current || chartRef.current) return

    try {
      console.log('🚀 Creating DXChart for', symbol)
      
      // Clear container
      containerRef.current.innerHTML = ''
      
      // Try different ways the standalone build might expose the API
      let createChart = window.DXCharts?.createChart || 
                       (window as any).createChart || 
                       window.DXCharts
      
      if (typeof createChart !== 'function') {
        console.error('❌ createChart function not found')
        setStatus('createChart function not available')
        return
      }
      
      // Create chart with basic configuration
      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: height
      })
      
      chartRef.current = chart
      setStatus('Chart Created Successfully')
      
      console.log('✅ DXChart created:', chart)
      
    } catch (error) {
      console.error('❌ Chart creation failed:', error)
      setStatus(`Chart creation failed: ${error.message}`)
    }
  }, [isReady, symbol, height])

  // Update data when available
  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return

    try {
      console.log(`📊 Setting data for ${symbol}:`, data.length, 'points')
      
      // Convert data to DXCharts format
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
        console.warn('❌ No valid chart data after filtering')
        return
      }

      // Try to set data using different methods
      if (chartRef.current.setData) {
        chartRef.current.setData({ candles: chartData })
      } else if (chartRef.current.updateData) {
        chartRef.current.updateData(chartData)
      } else {
        console.warn('⚠️ Unknown data method for DXCharts')
      }

      console.log('✅ DXChart data updated:', chartData.length, 'candles')

    } catch (error) {
      console.error('❌ Data update failed:', error)
      setStatus(`Data update failed: ${error.message}`)
    }
  }, [data, symbol])

  // Cleanup chart
  useEffect(() => {
    return () => {
      if (chartRef.current && chartRef.current.remove) {
        try {
          chartRef.current.remove()
        } catch (error) {
          console.warn('Chart cleanup warning:', error)
        }
      }
    }
  }, [])

  if (!isReady) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#2196f3',
        border: '2px solid #2196f3',
        borderRadius: '8px',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '15px' }}>🚀</div>
        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}>
          {status}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.8, textAlign: 'center' }}>
          Loading DXCharts standalone build...<br />
          Professional financial charting for {symbol}
        </div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid #333',
          borderTop: '3px solid #2196f3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginTop: '15px'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      width,
      height,
      position: 'relative'
    }}>
      <div 
        ref={containerRef}
        style={{ 
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(33, 150, 243, 0.9)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        DX Charts ✓ {symbol}
      </div>
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        fontSize: '12px',
        color: '#888',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '2px 6px',
        borderRadius: '3px'
      }}>
        {data?.length || 0} candles
      </div>
    </div>
  )
}