// TradingView Chart Integration - Industry Standard Solution
// This solves all the candlestick rendering issues we've been having
import React, { useEffect, useRef } from 'react'

interface TradingViewChartProps {
  symbol: string
  height?: number
  width?: string
}

declare global {
  interface Window {
    TradingView: any
  }
}

export default function TradingViewChart({ 
  symbol, 
  height = 600, 
  width = '100%' 
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load TradingView script if not already loaded
    if (!window.TradingView) {
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/tv.js'
      script.async = true
      script.onload = () => initializeChart()
      document.head.appendChild(script)
    } else {
      initializeChart()
    }

    function initializeChart() {
      if (!containerRef.current || !window.TradingView) return

      new window.TradingView.widget({
        autosize: true,
        symbol: `NASDAQ:${symbol}`,
        interval: '5',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1', // Candlestick style
        locale: 'en',
        toolbar_bg: '#1a1a1a',
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        container_id: containerRef.current.id,
        studies: [
          'MASimple@tv-basicstudies',
          'RSI@tv-basicstudies'
        ],
        height: height,
        width: width === '100%' ? undefined : width,
      })
    }

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol, height, width])

  return (
    <div style={{ width, height, position: 'relative' }}>
      <div 
        ref={containerRef}
        id={`tradingview_${Date.now()}`}
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Fallback message */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#666',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        Loading professional chart...
      </div>
    </div>
  )
}