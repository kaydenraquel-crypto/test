import React, { useEffect, useRef, useState } from 'react'

// For now, let's just create a simple placeholder that shows we're bypassing the import issues
// This will help us verify the rest of the app works while we figure out DXCharts

export default function DXChartBypassed({
  data = [],
  symbol = 'TEST',
  height = 300,
  width = '100%'
}: {
  data?: any[]
  symbol?: string
  height?: number
  width?: string
}) {
  const [dataInfo, setDataInfo] = useState<string>('')

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setDataInfo(`${data.length} data points loaded for ${symbol}`)
    }
  }, [data, symbol])

  return (
    <div style={{
      width,
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white',
      border: '2px solid #4fc3f7',
      borderRadius: '8px',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '15px' }}>📊</div>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>
        Chart Placeholder
      </div>
      <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
        Symbol: {symbol}
      </div>
      <div style={{ fontSize: '0.9rem', marginBottom: '15px', opacity: 0.8 }}>
        {dataInfo || 'No data available'}
      </div>
      
      {/* Show sample data if available */}
      {data && data.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(79, 195, 247, 0.1)',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          textAlign: 'center',
          maxWidth: '80%'
        }}>
          <div><strong>Latest Price:</strong> ${data[data.length - 1]?.close?.toFixed(2) || 'N/A'}</div>
          <div><strong>Data Range:</strong> {data.length} candles</div>
          {data[0] && data[data.length - 1] && (
            <div>
              <strong>Time Range:</strong> {' '}
              {new Date((data[0].time || data[0].ts) * 1000).toLocaleDateString()} 
              {' to '}
              {new Date((data[data.length - 1].time || data[data.length - 1].ts) * 1000).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        fontSize: '0.7rem',
        opacity: 0.5
      }}>
        DXCharts integration in progress...
      </div>
    </div>
  )
}