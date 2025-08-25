// src/components/DXTestSimple.jsx
// Simple DXcharts test component
import React, { useState, useEffect } from 'react'
import DXChartSimple from './DXChartSimple'

// Generate sample candle data
const generateSampleData = (count = 100) => {
  const data = []
  const basePrice = 45000
  const baseTimestamp = Math.floor(Date.now() / 1000) - (count * 300)
  
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
      timestamp,
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

export default function DXTestSimple() {
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState('none')

  // Load sample data
  const loadSampleData = () => {
    console.log('📊 Loading sample data for DXChart test')
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
    console.log('🌐 Loading real API data for DXChart test')
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
      
      // Convert API data format to our format
      const convertedData = data.ohlc.map(item => ({
        timestamp: item.ts || item.time || item.timestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume || 0
      })).filter(item => item.timestamp && item.open && item.high && item.low && item.close)
      
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

  const latestPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : null
  const priceChange = chartData.length > 1 ? {
    change: chartData[chartData.length - 1].close - chartData[chartData.length - 2].close,
    isPositive: chartData[chartData.length - 1].close >= chartData[chartData.length - 2].close
  } : null

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f0f0f', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px', color: 'white' }}>
        <h1 style={{ color: '#4fc3f7', marginBottom: '10px' }}>
          🚀 DXCharts Lite Test - NovaSignal (Simple)
        </h1>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
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
              {priceChange.change.toFixed(2)}
            </div>
          )}
          
          <div>
            <strong>Data:</strong> {chartData.length} candles ({dataSource})
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
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
            🔄 Reload Page
          </button>
        </div>

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

      {/* DXChart Component */}
      <DXChartSimple
        data={chartData}
        symbol="BTCUSDT"
        market="crypto"
        interval={60}
        style={{ height: '500px', border: '1px solid #333' }}
      />

      {/* Debug Information */}
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
        <div>Error: {error || 'None'}</div>
        {chartData.length > 0 && (
          <>
            <div>First Candle: {new Date(chartData[0].timestamp * 1000).toLocaleString()}</div>
            <div>Last Candle: {new Date(chartData[chartData.length - 1].timestamp * 1000).toLocaleString()}</div>
            <div>Price Range: ${Math.min(...chartData.map(c => c.low)).toFixed(2)} - ${Math.max(...chartData.map(c => c.high)).toFixed(2)}</div>
          </>
        )}
      </div>
    </div>
  )
}