// Alpha Vantage Chart Integration Test
// Tests the integration between Alpha Vantage data service and LightweightChart component
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import LightweightChart from './LightweightChartFixed'
import ChartControls from './ChartControls'
import alphaVantageService from '../services/alphaVantageService'

interface ChartTestProps {
  initialSymbol?: string
}

export default function AlphaVantageChartTest({ initialSymbol = 'AAPL' }: ChartTestProps) {
  const [symbol, setSymbol] = useState(initialSymbol)
  const [chartData, setChartData] = useState([])
  const [indicators, setIndicators] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(null)
  const [scalePriceOnly, setScalePriceOnly] = useState(true)  // Toggle for price-only scaling
  // New chart controls state
  const [selectedOverlays, setSelectedOverlays] = useState<string[]>(['sma_20', 'ema_20'])
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['rsi'])
  const [selectedSignals, setSelectedSignals] = useState<string[]>([])

  const loadChartData = useCallback(async (targetSymbol: string) => {
    if (!targetSymbol) return

    setLoading(true)
    setError('')

    try {
      console.log(`🔄 Loading chart data for ${targetSymbol}...`)
      console.log('📊 Alpha Vantage service status:', alphaVantageService.getStatus())
      
      // Get daily OHLC data from Alpha Vantage (use full for more data points)
      const dailyData = await alphaVantageService.getDailyData(targetSymbol, 'full')
      
      console.log('📊 Raw Alpha Vantage response:', dailyData)
      
      if (dailyData && dailyData.formatted && dailyData.formatted.length > 0) {
        console.log(`✅ Got ${dailyData.formatted.length} data points for ${targetSymbol}`)
        console.log('📅 Date range:', {
          first: dailyData.formatted[0]?.timestamp,
          last: dailyData.formatted[dailyData.formatted.length - 1]?.timestamp
        })
        setChartData(dailyData.formatted)
        setLastUpdate(new Date())
        
        // Get technical indicators using available methods
        try {
          const [rsiData, smaData, emaData] = await Promise.all([
            alphaVantageService.getRSI(targetSymbol, 'daily', 14),
            alphaVantageService.getSMA(targetSymbol, 'daily', 20),
            alphaVantageService.getEMA(targetSymbol, 'daily', 20)
          ])
          
          const indicatorData = {
            rsi: rsiData?.formatted || [],
            sma20: smaData?.formatted?.[0]?.value || null,
            ema20: emaData?.formatted?.[0]?.value || null,
            bollinger: null // Will add later if needed
          }
          
          setIndicators(indicatorData)
          console.log('✅ Technical indicators loaded:', Object.keys(indicatorData))
        } catch (indicatorError) {
          console.warn('Could not load indicators:', indicatorError.message)
          setIndicators({}) // Set empty indicators on error
        }
      } else {
        setError('No chart data available')
        console.warn('❌ No chart data received')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error loading chart data'
      setError(errorMsg)
      console.error('❌ Error loading chart data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load initial data
  useEffect(() => {
    loadChartData(symbol)
  }, [loadChartData, symbol])

  const handleSymbolChange = useCallback((newSymbol: string) => {
    const upperSymbol = newSymbol.toUpperCase()
    setSymbol(upperSymbol)
    loadChartData(upperSymbol)
  }, [loadChartData])

  // Memoize indicators outside of conditional rendering to avoid hook order issues
  const memoizedIndicators = useMemo(() => ({
    rsi: indicators.rsi?.map(r => r.value) || [],
    sma: indicators.sma20 ? Array(chartData.length).fill(indicators.sma20) : [],
    ema: indicators.ema20 ? Array(chartData.length).fill(indicators.ema20) : [],
    bb_high: indicators.bollinger ? Array(chartData.length).fill(indicators.bollinger.upper) : [],
    bb_low: indicators.bollinger ? Array(chartData.length).fill(indicators.bollinger.lower) : []
  }), [indicators, chartData.length])

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        border: '2px solid #4caf50'
      }}>
        <h2 style={{ margin: '0 0 15px 0', color: '#2e7d32' }}>
          📈 Alpha Vantage Chart Integration Test
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <label htmlFor="symbol-input" style={{ fontWeight: 'bold' }}>Symbol:</label>
          <input
            id="symbol-input"
            type="text"
            value={symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            placeholder="Enter stock symbol (e.g., AAPL)"
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px',
              width: '150px'
            }}
          />
          <button
            onClick={() => loadChartData(symbol)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#ccc' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Chart Controls */}
        <div style={{ marginTop: '16px' }}>
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

        {lastUpdate && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        {error && (
          <div style={{ 
            color: '#d32f2f', 
            backgroundColor: '#ffebee', 
            padding: '8px', 
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          fontSize: '16px',
          color: '#666'
        }}>
          <div style={{ marginBottom: '10px' }}>🔄 Loading chart data for {symbol}...</div>
          <div style={{ fontSize: '14px' }}>This may take a few moments</div>
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <h3 style={{ margin: 0 }}>{symbol} Stock Chart</h3>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {chartData.length} data points
            </div>
          </div>
          
          <LightweightChart
            data={chartData}
            symbol={symbol}
            height={600}
            indicators={memoizedIndicators}
            scalePriceOnly={scalePriceOnly}
          />

          {/* Chart Data Debug Info */}
          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              🔍 Debug Info (Click to expand)
            </summary>
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '10px', 
              borderRadius: '4px',
              marginTop: '10px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              <div><strong>Symbol:</strong> {symbol}</div>
              <div><strong>Data Points:</strong> {chartData.length}</div>
              {chartData.length > 0 && (
                <>
                  <div><strong>First Candle:</strong> {JSON.stringify(chartData[0], null, 2)}</div>
                  <div><strong>Last Candle:</strong> {JSON.stringify(chartData[chartData.length - 1], null, 2)}</div>
                </>
              )}
              <div><strong>Indicators:</strong> {JSON.stringify(indicators, null, 2)}</div>
            </div>
          </details>
        </div>
      )}

      {!loading && chartData.length === 0 && !error && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          No chart data available for {symbol}
        </div>
      )}
    </div>
  )
}