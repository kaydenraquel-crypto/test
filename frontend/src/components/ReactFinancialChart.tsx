import React from 'react'
import { Chart, ChartCanvas } from 'react-financial-charts'
import { XAxis, YAxis } from 'react-financial-charts'
import { CandlestickSeries } from 'react-financial-charts'
import { scaleTime } from 'd3-scale'
import { timeFormat } from 'd3-time-format'

// Debug the imports
console.log('📊 React Financial Charts imports:', {
  Chart: typeof Chart,
  ChartCanvas: typeof ChartCanvas,
  XAxis: typeof XAxis,
  YAxis: typeof YAxis,
  CandlestickSeries: typeof CandlestickSeries,
  scaleTime: typeof scaleTime,
  timeFormat: typeof timeFormat
})

interface CandlestickData {
  time: number | Date
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface ReactFinancialChartProps {
  data: CandlestickData[]
  symbol: string
  height?: number
  width?: string
}

export default function ReactFinancialChart({
  data,
  symbol,
  height = 500,
  width = '100%'
}: ReactFinancialChartProps) {
  
  // Debug logging
  console.log('📊 ReactFinancialChart received:', {
    symbol,
    dataLength: data?.length,
    firstItem: data?.[0],
    lastItem: data?.[data?.length - 1]
  })
  
  if (!data || data.length === 0) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#888',
        border: '1px solid #333',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
          <div>No chart data available for {symbol}</div>
        </div>
      </div>
    )
  }

  // Convert data format with validation
  const chartData = data
    .filter(item => 
      item && 
      typeof item.open === 'number' && 
      typeof item.high === 'number' && 
      typeof item.low === 'number' && 
      typeof item.close === 'number' &&
      (item.time || item.ts)
    )
    .map((item, index) => ({
      date: typeof item.time === 'number' ? new Date(item.time * 1000) : 
            typeof item.ts === 'number' ? new Date(item.ts * 1000) : 
            item.time instanceof Date ? item.time : new Date(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume || 0
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  // Debug the processed data
  console.log('📊 Processed chartData:', {
    originalLength: data.length,
    filteredLength: chartData.length,
    firstProcessed: chartData[0],
    lastProcessed: chartData[chartData.length - 1]
  })

  // Check if we have valid data after filtering
  if (chartData.length === 0) {
    return (
      <div style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#888',
        border: '1px solid #333',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
          <div>No valid chart data available for {symbol}</div>
          <div style={{ fontSize: '0.8rem', marginTop: '5px', opacity: 0.7 }}>
            {data.length > 0 ? `${data.length} raw data points, but none are valid` : 'No data provided'}
          </div>
        </div>
      </div>
    )
  }

  const xAccessor = (d: any) => d?.date
  const xExtents = chartData.length > 0 ? [
    chartData[0].date,
    chartData[chartData.length - 1].date
  ] : [new Date(), new Date()]

  try {
    return (
      <div style={{
        width,
        height,
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'white',
          fontWeight: 'bold',
          zIndex: 10
        }}>
          {symbol} - React Financial Charts
        </div>
        
        <ChartCanvas
          height={height}
          width={parseInt(width.toString().replace(/[^0-9]/g, '')) || 800}
          ratio={1}
          margin={{ left: 50, right: 50, top: 40, bottom: 50 }}
          data={chartData}
          seriesName={`${symbol}_series`}
          xAccessor={xAccessor}
          xScale={scaleTime()}
          xExtents={xExtents}
        >
          <Chart id={1} yExtents={(d: any) => [d.high, d.low]}>
            <XAxis 
              axisAt="bottom" 
              orient="bottom" 
              tickFormat={timeFormat("%m/%d")}
              stroke="#666"
            />
            <YAxis 
              axisAt="right" 
              orient="right"
              stroke="#666"
            />
            <CandlestickSeries 
              wickStroke="#666"
              fill={(d: any) => d.close > d.open ? "#4caf50" : "#f44336"}
              stroke={(d: any) => d.close > d.open ? "#4caf50" : "#f44336"}
            />
          </Chart>
        </ChartCanvas>
        
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          fontSize: '12px',
          color: '#888'
        }}>
          {chartData.length} candles
        </div>
      </div>
    )
  } catch (error) {
    console.error('React Financial Charts error:', error)
    
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
        padding: '20px',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Chart Error</div>
        <div style={{ fontSize: '0.9rem', textAlign: 'center' }}>
          React Financial Charts failed to render<br />
          Error: {error.message}
        </div>
      </div>
    )
  }
}