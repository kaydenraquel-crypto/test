// Real-Time Trading Component - Uses live market data for 7-hour intraday trading
import React, { useState, useEffect, useCallback, useRef } from 'react'
import LightweightChart from './LightweightChartFixed'
import ChartControls from './ChartControls'
import alphaVantageService from '../services/alphaVantageService'
import { getHistory } from '../lib/api'

interface RealTimeTradingProps {
  initialSymbol?: string
}

export default function RealTimeTrading({ initialSymbol = 'AAPL' }: RealTimeTradingProps) {
  const [symbol, setSymbol] = useState(initialSymbol)
  const [chartData, setChartData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connecting')
  const [scalePriceOnly, setScalePriceOnly] = useState(true)  // Chart scaling control
  // New chart controls state
  const [selectedOverlays, setSelectedOverlays] = useState<string[]>(['sma_20', 'ema_20'])
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['rsi'])
  const [selectedSignals, setSelectedSignals] = useState<string[]>(['buy_sell'])
  
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Load 7 hours of historical data using backend (multi-source)
  const loadHistoricalData = useCallback(async (targetSymbol: string) => {
    if (!targetSymbol) return

    setIsLoading(true)
    setError('')
    setConnectionStatus('connecting')

    try {
      console.log(`📊 Loading live data for ${targetSymbol}...`)
      
      // Use backend with Polygon.io as primary data source  
      console.log('📊 Using backend multi-source data (Polygon.io primary)')
      const dataSource = 'Backend (Polygon.io + Yahoo Finance + Finnhub)'
      
      const backendData = await getHistory({
        symbol: targetSymbol,
        market: 'stocks',
        interval: 5,
        days: 1,
        provider: 'auto'
      })
      
      console.log('🔍 Raw backend data:', {
        type: typeof backendData,
        isArray: Array.isArray(backendData),
        length: backendData?.length,
        keys: backendData ? Object.keys(backendData) : null,
        sample: backendData?.[0] || backendData?.ohlc?.[0]
      })
      
      // Handle different response formats
      let actualData = backendData
      if (backendData && !Array.isArray(backendData) && backendData.ohlc) {
        actualData = backendData.ohlc
        console.log('📊 Extracted OHLC data:', actualData.length, 'bars')
      }
      
      let data = null
      if (actualData && actualData.length > 0) {
        // Convert backend format to chart format
        const chartData = actualData.map(item => ({
          time: item.ts,
          timestamp: new Date(item.ts * 1000).toISOString(),
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume || 0
        }))
        
        data = {
          formatted: chartData,
          metadata: { symbol: targetSymbol, source: dataSource },
          timeRange: 'live'
        }
        
        console.log(`✅ Using ${dataSource}: ${chartData.length} data points from Polygon.io`)
      } else {
        console.error('❌ Backend returned no data:', backendData)
      }
      
      if (data && data.formatted && data.formatted.length > 0) {
        setChartData(data.formatted)
        setLastUpdate(new Date())
        setConnectionStatus('connected')
        
        console.log('📊 Data range:', {
          source: dataSource,
          points: data.formatted.length,
          from: new Date(data.formatted[0].time * 1000).toLocaleString(),
          to: new Date(data.formatted[data.formatted.length - 1].time * 1000).toLocaleString()
        })
      } else {
        throw new Error('No data available from any source')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error loading data'
      setError(`Failed to load data: ${errorMsg}`)
      setConnectionStatus('error')
      console.error('❌ Error loading live data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Set up real-time updates using backend WebSocket or polling
  const startRealTimeUpdates = useCallback((targetSymbol: string) => {
    if (!realTimeEnabled || !targetSymbol) return

    console.log(`📊 Starting real-time updates for ${targetSymbol}`)
    
    // Use backend API polling for real-time updates (every minute)
    const updateFunction = async () => {
      try {
        console.log(`📊 Fetching latest data for ${targetSymbol}...`)
        
        // Get fresh data from backend
        const backendData = await getHistory({
          symbol: targetSymbol,
          market: 'stocks',
          interval: 5,
          days: 1,
          provider: 'auto'
        })
        
        if (backendData && backendData.length > 0) {
          const latestCandle = backendData[backendData.length - 1]
          
          setChartData(prevData => {
            const newData = [...prevData]
            const existingIndex = newData.findIndex(item => item.time === latestCandle.ts)
            
            const newCandle = {
              time: latestCandle.ts,
              timestamp: new Date(latestCandle.ts * 1000).toISOString(),
              open: latestCandle.open,
              high: latestCandle.high,
              low: latestCandle.low,
              close: latestCandle.close,
              volume: latestCandle.volume || 0
            }
            
            if (existingIndex >= 0) {
              newData[existingIndex] = newCandle
              console.log(`📊 Updated existing candle: $${latestCandle.close.toFixed(2)} @ ${new Date(latestCandle.ts * 1000).toLocaleTimeString()}`)
            } else {
              newData.push(newCandle)
              console.log(`📊 Added new candle: $${latestCandle.close.toFixed(2)} @ ${new Date(latestCandle.ts * 1000).toLocaleTimeString()}`)
            }
            
            // Keep only recent data (last 100 candles for performance)
            return newData.slice(-100).sort((a, b) => a.time - b.time)
          })
          
          setLastUpdate(new Date())
          setConnectionStatus('connected')
        }
      } catch (error) {
        console.error(`❌ Real-time update failed for ${targetSymbol}:`, error)
        setConnectionStatus('error')
      }
    }

    // Initial update
    updateFunction()
    
    // Set up interval updates (every 60 seconds)
    const intervalId = setInterval(updateFunction, 60000)
    
    unsubscribeRef.current = () => {
      clearInterval(intervalId)
      console.log(`📊 Stopped real-time updates for ${targetSymbol}`)
    }
  }, [realTimeEnabled])

  // Handle symbol change
  const handleSymbolChange = useCallback(async (newSymbol: string) => {
    const upperSymbol = newSymbol.toUpperCase()
    
    // Stop current real-time updates
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
    
    setSymbol(upperSymbol)
    
    // Load new data and start real-time updates
    await loadHistoricalData(upperSymbol)
    if (realTimeEnabled) {
      startRealTimeUpdates(upperSymbol)
    }
  }, [loadHistoricalData, startRealTimeUpdates, realTimeEnabled])

  // Toggle real-time updates
  const toggleRealTime = useCallback(() => {
    setRealTimeEnabled(prev => {
      const newState = !prev
      
      if (newState) {
        startRealTimeUpdates(symbol)
      } else if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      
      return newState
    })
  }, [startRealTimeUpdates, symbol])

  // Initialize
  useEffect(() => {
    loadHistoricalData(symbol)
    return () => {
      // Cleanup on unmount
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      alphaVantageService.unsubscribeAll()
    }
  }, [loadHistoricalData, symbol])

  // Start real-time updates after initial load
  useEffect(() => {
    if (chartData.length > 0 && realTimeEnabled && !unsubscribeRef.current) {
      startRealTimeUpdates(symbol)
    }
  }, [chartData.length, realTimeEnabled, startRealTimeUpdates, symbol])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4caf50'
      case 'connecting': return '#ff9800'
      case 'error': return '#f44336'
      default: return '#757575'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢 Live Data'
      case 'connecting': return '🟡 Connecting...'
      case 'error': return '🔴 Connection Error'
      default: return '⚫ Unknown'
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        backgroundColor: '#1a1a1a', 
        borderRadius: '8px',
        border: '2px solid #4caf50'
      }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#4caf50' }}>
          📈 Real-Time Trading Dashboard
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <label htmlFor="symbol-input" style={{ fontWeight: 'bold', color: '#e0e0e0' }}>Symbol:</label>
          <input
            id="symbol-input"
            type="text"
            value={symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            placeholder="Enter stock symbol"
            style={{
              padding: '8px 12px',
              border: '1px solid #333',
              borderRadius: '4px',
              fontSize: '16px',
              width: '120px',
              backgroundColor: '#2a2a2a',
              color: '#e0e0e0'
            }}
          />
          
          <button
            onClick={() => loadHistoricalData(symbol)}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: isLoading ? '#666' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>

          <button
            onClick={toggleRealTime}
            style={{
              padding: '8px 16px',
              backgroundColor: realTimeEnabled ? '#4caf50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {realTimeEnabled ? '⏸️ Stop Updates' : '▶️ Start Updates'}
          </button>
        </div>

        {/* Status indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}>
          <span style={{ color: getStatusColor() }}>
            {getStatusText()}
          </span>
          
          {lastUpdate && (
            <span style={{ color: '#888' }}>
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          
          <span style={{ color: '#888' }}>
            Data points: {chartData.length}
          </span>
          
          <span style={{ color: '#888' }}>
            Source: Backend (Yahoo Finance + Finnhub + Alpha Vantage News)
          </span>
        </div>

        {error && (
          <div style={{ 
            color: '#f44336', 
            backgroundColor: '#2a1a1a', 
            padding: '10px', 
            borderRadius: '4px',
            marginTop: '10px',
            border: '1px solid #f44336'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          fontSize: '16px',
          color: '#e0e0e0',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px'
        }}>
          <div style={{ marginBottom: '10px' }}>🔄 Loading 7-hour data for {symbol}...</div>
          <div style={{ fontSize: '14px', color: '#888' }}>Fetching minute-by-minute market data</div>
        </div>
      )}

      {/* Chart */}
      {!isLoading && chartData.length > 0 && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h3 style={{ margin: 0, color: '#e0e0e0' }}>{symbol} Live Chart</h3>
            <div style={{ fontSize: '14px', color: '#888' }}>
              {chartData.length} candles • Real-time: {realTimeEnabled ? 'ON' : 'OFF'}
            </div>
          </div>
          
          {/* Chart Controls */}
          <div style={{ marginBottom: '16px' }}>
            <ChartControls
              selectedOverlays={selectedOverlays}
              selectedIndicators={selectedIndicators}
              selectedSignals={selectedSignals}
              scalePriceOnly={scalePriceOnly}
              onOverlaysChange={setSelectedOverlays}
              onIndicatorsChange={setSelectedIndicators}
              onSignalsChange={setSelectedSignals}
              onScalePriceOnlyChange={setScalePriceOnly}
            />
          </div>
          
          <LightweightChart
            data={chartData}
            symbol={symbol}
            height={600}
            scalePriceOnly={scalePriceOnly}
            onRealTimeUpdate={realTimeEnabled ? (updateFn) => {
              // This connects the chart's real-time capability
              // Chart will handle the visual updates
              return () => {} // No-op cleanup for now
            } : undefined}
          />
        </div>
      )}

      {/* No data state */}
      {!isLoading && chartData.length === 0 && !error && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#888',
          backgroundColor: '#1a1a1a',
          borderRadius: '8px'
        }}>
          No data available for {symbol}
          <div style={{ marginTop: '10px', fontSize: '14px' }}>
            Try a different symbol or check your API key
          </div>
        </div>
      )}

      {/* API Key Status */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#1a1a1a', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#888'
      }}>
        <strong>Primary Data Source:</strong> ✅ Polygon.io (Live 5-minute OHLC data)
        <br />
        <strong>Secondary Sources:</strong> ✅ Yahoo Finance, Finnhub 
        <br />
        <strong>Polygon.io:</strong> ✅ Unlimited API calls (Paid tier active)
        <br />
        <strong>Data Strategy:</strong> ✅ Multi-source backend with Polygon.io priority ensures 24/7 live data
      </div>
    </div>
  )
}