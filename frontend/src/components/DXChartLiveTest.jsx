// src/components/DXChartLiveTest.jsx
// Live DXcharts test with real API data
import React, { useState, useEffect } from 'react'
import DXChartComponent from './DXChartComponent'

export default function DXChartLiveTest() {
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState('none')
  const [chartReady, setChartReady] = useState(false)

  // Generate realistic sample data
  const generateSampleData = (count = 200) => {
    const data = []
    const basePrice = 45000
    const baseTimestamp = Math.floor(Date.now() / 1000) - (count * 300) // 5 minutes apart
    
    let price = basePrice
    
    for (let i = 0; i < count; i++) {
      const timestamp = baseTimestamp + (i * 300)
      const change = (Math.random() - 0.5) * 1000
      const open = price
      const close = Math.max(1000, open + change)
      const high = Math.max(open, close) + Math.random() * 200
      const low = Math.min(open, close) - Math.random() * 200
      const volume = Math.random() * 100
      
      data.push({
        time: timestamp,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Number(volume.toFixed(4))
      })
      
      price = close
    }
    
    return data
  }

  // Load sample data
  const loadSampleData = () => {
    console.log('📊 Loading sample data for DXcharts...')
    setIsLoading(true)
    setError(null)
    setDataSource('sample')
    
    setTimeout(() => {
      try {
        const sampleData = generateSampleData(200)
        setChartData(sampleData)
        setIsLoading(false)
        console.log('✅ Sample data loaded:', sampleData.length, 'candles')
      } catch (err) {
        console.error('❌ Sample data generation failed:', err)
        setError('Failed to generate sample data')
        setIsLoading(false)
      }
    }, 500)
  }

  // Load real API data
  const loadRealData = async () => {
    console.log('🌐 Loading real API data for DXcharts...')
    setIsLoading(true)
    setError(null)
    setDataSource('api')

    try {
      const response = await fetch(
        'http://localhost:8000/api/history?symbol=BTCUSDT&market=crypto&interval=60&days=1'
      )
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('🔍 API Response:', data)
      
      if (!data.ohlc || !Array.isArray(data.ohlc)) {
        throw new Error('Invalid API response format')
      }
      
      // Convert API data format
      const convertedData = data.ohlc.map(item => ({
        time: item.ts || item.time || item.timestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume || 0
      })).filter(item => 
        item.time && 
        Number.isFinite(item.open) && 
        Number.isFinite(item.high) && 
        Number.isFinite(item.low) && 
        Number.isFinite(item.close)
      )
      
      if (convertedData.length === 0) {
        throw new Error('No valid candle data received')
      }
      
      setChartData(convertedData)
      setIsLoading(false)
      console.log('✅ Real data loaded:', convertedData.length, 'candles')
      
    } catch (err) {
      console.error('❌ Real data loading failed:', err)
      setError(err.message || 'Failed to load real data')
      setIsLoading(false)
    }
  }

  // Auto-load sample data on mount
  useEffect(() => {
    loadSampleData()
  }, [])

  // Calculate stats
  const latestPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : null
  const priceChange = chartData.length > 1 ? {
    change: chartData[chartData.length - 1].close - chartData[chartData.length - 2].close,
    isPositive: chartData[chartData.length - 1].close >= chartData[chartData.length - 2].close
  } : null

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f0f0f', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#4fc3f7', marginBottom: '10px' }}>
          🚀 DXcharts Live Integration - NovaSignal
        </h1>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          alignItems: 'center', 
          marginBottom: '15px',
          flexWrap: 'wrap'
        }}>
          <div>
            <strong>Symbol:</strong> BTCUSDT (crypto)
          </div>
          
          {latestPrice && (
            <div>
              <strong>Price:</strong> ${latestPrice.toLocaleString()}
            </div>
          )}
          
          {priceChange && (
            <div style={{ color: priceChange.isPositive ? '#4caf50' : '#f44336' }}>
              <strong>Change:</strong> {priceChange.isPositive ? '+' : ''}
              {priceChange.change.toFixed(2)} ({((priceChange.change / (latestPrice - priceChange.change)) * 100).toFixed(2)}%)
            </div>
          )}
          
          <div>
            <strong>Data:</strong> {chartData.length} candles ({dataSource})
          </div>
          
          <div>
            <strong>Chart:</strong> {chartReady ? '✅ Ready' : '⏳ Loading'}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={loadSampleData}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: dataSource === 'sample' ? '#4fc3f7' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            📊 Load Sample Data
          </button>
          
          <button
            onClick={loadRealData}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: dataSource === 'api' ? '#4fc3f7' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            🌐 Load Real Data
          </button>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Reload
          </button>
          
          <a
            href="/"
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            ← Back to Main App
          </a>
        </div>

        {/* Status */}
        {isLoading && (
          <div style={{ color: '#4fc3f7', marginBottom: '10px' }}>
            ⏳ Loading {dataSource === 'api' ? 'real' : 'sample'} data...
          </div>
        )}

        {error && (
          <div style={{ 
            color: '#f44336', 
            backgroundColor: '#2d1b1b', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Professional DXcharts Component */}
      <DXChartComponent
        data={chartData}
        symbol="BTCUSDT"
        market="crypto"
        interval={60}
        height={600}
        onReady={(chart) => {
          console.log('📊 DXcharts is ready!', chart)
          setChartReady(true)
        }}
      />

      {/* Comparison Section */}
      <div style={{
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        <div style={{
          backgroundColor: '#1b2d1b',
          padding: '15px',
          borderRadius: '4px',
          borderLeft: '4px solid #4caf50'
        }}>
          <h3 style={{ color: '#4caf50', marginBottom: '10px' }}>✅ DXcharts Advantages</h3>
          <ul>
            <li>Professional financial charting engine</li>
            <li>No spacing or rendering issues</li>
            <li>Built-in technical indicators</li>
            <li>Smooth zoom and pan</li>
            <li>Professional crosshair system</li>
            <li>Optimized for trading platforms</li>
            <li>Handles large datasets efficiently</li>
          </ul>
        </div>
        
        <div style={{
          backgroundColor: '#2d1b1b',
          padding: '15px',
          borderRadius: '4px',
          borderLeft: '4px solid #f44336'
        }}>
          <h3 style={{ color: '#f44336', marginBottom: '10px' }}>❌ Current Issues Fixed</h3>
          <ul>
            <li>Candlestick spacing problems ✅</li>
            <li>Data loading inconsistencies ✅</li>
            <li>Chart rendering bugs ✅</li>
            <li>Limited customization options ✅</li>
            <li>Performance issues with data ✅</li>
            <li>Time spent debugging charts ✅</li>
            <li>Unprofessional appearance ✅</li>
          </ul>
        </div>
      </div>

      {/* Debug Info */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#1a1a1a', 
        borderRadius: '4px',
        color: '#a0a0a0',
        fontSize: '14px'
      }}>
        <h3 style={{ color: '#4fc3f7', marginBottom: '10px' }}>🔍 Debug Info</h3>
        <div>Chart Data Length: {chartData.length}</div>
        <div>Data Source: {dataSource}</div>
        <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Chart Ready: {chartReady ? 'Yes' : 'No'}</div>
        <div>Error: {error || 'None'}</div>
        {chartData.length > 0 && (
          <>
            <div>First Candle: {new Date((chartData[0].time) * 1000).toLocaleString()}</div>
            <div>Last Candle: {new Date((chartData[chartData.length - 1].time) * 1000).toLocaleString()}</div>
            <div>Price Range: ${Math.min(...chartData.map(c => c.low)).toFixed(2)} - ${Math.max(...chartData.map(c => c.high)).toFixed(2)}</div>
          </>
        )}
      </div>
    </div>
  )
}