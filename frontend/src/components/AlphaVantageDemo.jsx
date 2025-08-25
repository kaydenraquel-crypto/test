// Simple Alpha Vantage Demo Component (for testing)
import React, { useState, useEffect } from 'react'
import alphaVantageService from '../services/alphaVantageService'

export default function AlphaVantageDemo() {
  const [status, setStatus] = useState('Loading...')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    testAlphaVantage()
  }, [])

  const testAlphaVantage = async () => {
    try {
      setStatus('Testing Alpha Vantage Service...')
      
      // Test basic functionality
      const dailyData = await alphaVantageService.getDailyData('AAPL')
      const rsiData = await alphaVantageService.getRSI('AAPL')
      
      setData({
        apiKey: alphaVantageService.apiKey,
        dailyData: dailyData.formatted?.slice(0, 3) || 'No data',
        rsiData: rsiData.formatted?.slice(0, 3) || 'No data',
        cacheSize: alphaVantageService.cache.size
      })
      
      setStatus('✅ Alpha Vantage Service Working!')
    } catch (err) {
      setError(err.message)
      setStatus('❌ Alpha Vantage Service Error')
    }
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#1a1a1a',
      color: 'white',
      borderRadius: '8px',
      margin: '20px',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ color: '#00d4aa', marginBottom: '16px' }}>
        🔥 Alpha Vantage Service Test
      </h3>
      
      <div style={{ marginBottom: '16px' }}>
        <strong>Status:</strong> {status}
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#991b1b', 
          padding: '12px', 
          borderRadius: '4px', 
          marginBottom: '16px' 
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div style={{ fontSize: '14px' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>API Key:</strong> {data.apiKey}
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong>Cache Size:</strong> {data.cacheSize} entries
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>Daily Data Sample:</strong>
            <pre style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '8px', 
              borderRadius: '4px',
              marginTop: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(data.dailyData, null, 2)}
            </pre>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong>RSI Data Sample:</strong>
            <pre style={{ 
              backgroundColor: '#2a2a2a', 
              padding: '8px', 
              borderRadius: '4px',
              marginTop: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {JSON.stringify(data.rsiData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '12px', 
        backgroundColor: '#2a2a2a', 
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <div>💡 <strong>Tips:</strong></div>
        <div>• Using 'demo' key with mock data</div>
        <div>• Get real API key from alphavantage.co</div>
        <div>• Add to .env: VITE_ALPHA_VANTAGE_KEY=your_key</div>
      </div>

      <button
        onClick={testAlphaVantage}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          backgroundColor: '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔄 Retest Service
      </button>
    </div>
  )
}