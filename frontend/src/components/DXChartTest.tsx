// src/components/DXChartTest.tsx
// Test component to verify DXcharts Lite integration
import React, { useState, useEffect } from 'react'
import DXChart, { DXCandle } from './DXChart'
import { 
  generateSampleDXData, 
  convertToDXCandles, 
  getLatestPrice, 
  getPriceChange 
} from '../utils/dxChartsConverter'

interface DXChartTestProps {
  useRealData?: boolean
  symbol?: string
  market?: 'crypto' | 'stocks'
}

export default function DXChartTest({ 
  useRealData = false, 
  symbol = 'BTCUSDT',
  market = 'crypto' 
}: DXChartTestProps) {
  const [chartData, setChartData] = useState<DXCandle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'sample' | 'api'>('sample')

  // Load sample data
  const loadSampleData = () => {
    console.log('📊 Loading sample data for DXChart test')
    setIsLoading(true)
    setError(null)
    setDataSource('sample')
    
    setTimeout(() => {
      try {
        const sampleData = generateSampleDXData(200) // 200 candles
        setChartData(sampleData)
        setIsLoading(false)
        console.log('✅ Sample data loaded:', sampleData.length, 'candles')
      } catch (err) {
        console.error('❌ Sample data generation failed:', err)
        setError('Failed to generate sample data')
        setIsLoading(false)
      }
    }, 500) // Simulate loading delay
  }

  // Load real API data
  const loadRealData = async () => {
    console.log('🌐 Loading real API data for DXChart test')
    setIsLoading(true)
    setError(null)
    setDataSource('api')

    try {
      const response = await fetch(
        `http://localhost:8000/api/history?symbol=${symbol}&market=${market}&interval=60&days=1`
      )
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('🔍 API Response:', data)
      
      if (!data.ohlc || !Array.isArray(data.ohlc)) {
        throw new Error('Invalid API response format')
      }
      
      const convertedData = convertToDXCandles(data.ohlc)
      
      if (convertedData.length === 0) {
        throw new Error('No valid candle data received')
      }
      
      setChartData(convertedData)
      setIsLoading(false)
      console.log('✅ Real data loaded:', convertedData.length, 'candles')
      
    } catch (err) {
      console.error('❌ Real data loading failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to load real data')
      setIsLoading(false)
    }
  }

  // Load sample data on component mount
  useEffect(() => {
    if (useRealData) {
      loadRealData()
    } else {
      loadSampleData()
    }
  }, [useRealData, symbol, market])

  // Calculate price statistics
  const latestPrice = getLatestPrice(chartData)
  const priceChange = getPriceChange(chartData)

  return (
    <div style={{ padding: '20px', backgroundColor: '#0f0f0f', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px', color: 'white' }}>
        <h1 style={{ color: '#4fc3f7', marginBottom: '10px' }}>
          🚀 DXCharts Lite Test - NovaSignal
        </h1>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <strong>Symbol:</strong> {symbol} ({market})
          </div>
          
          {latestPrice && (
            <div>
              <strong>Price:</strong> ${latestPrice.toLocaleString()}
            </div>
          )}
          
          {priceChange && (
            <div style={{ color: priceChange.isPositive ? '#4caf50' : '#f44336' }}>
              <strong>Change:</strong> {priceChange.isPositive ? '+' : ''}
              {priceChange.change} ({priceChange.changePercent}%)
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
      <DXChart
        data={chartData}
        symbol={symbol}
        market={market}
        interval={60}
        style={{ height: '500px' }}
        onCandleClick={(candle) => {
          console.log('Candle clicked:', candle)
          alert(`Clicked candle: ${new Date(candle.timestamp * 1000).toLocaleString()}\nPrice: $${candle.close}`)
        }}
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
            <div>First Candle: {chartData[0] ? new Date(chartData[0].timestamp * 1000).toLocaleString() : 'N/A'}</div>
            <div>Last Candle: {chartData.length > 0 && chartData[chartData.length - 1] ? new Date((chartData[chartData.length - 1] as any).timestamp * 1000).toLocaleString() : 'N/A'}</div>
            <div>Price Range: ${Math.min(...chartData.map(c => c.low)).toFixed(2)} - ${Math.max(...chartData.map(c => c.high)).toFixed(2)}</div>
          </>
        )}
      </div>
    </div>
  )
}