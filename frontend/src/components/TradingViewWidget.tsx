import React, { useEffect, useRef } from 'react'

interface TradingViewWidgetProps {
  data: any[]
  symbol: string
  height?: number
  width?: string
}

export default function TradingViewWidget({
  data,
  symbol,
  height = 500,
  width = '100%'
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear container
    containerRef.current.innerHTML = ''

    console.log('📊 Creating TradingView widget for', symbol)

    // Create TradingView widget
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "1D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor: "rgba(26, 26, 26, 1)",
      gridColor: "rgba(51, 51, 51, 0.5)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: "tradingview_widget",
      studies: [
        "RSI@tv-basicstudies",
        "MACD@tv-basicstudies"
      ],
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650"
    })

    // Create container with proper ID
    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container'
    widgetContainer.style.height = '100%'
    widgetContainer.style.width = '100%'
    
    const widgetDiv = document.createElement('div')
    widgetDiv.id = 'tradingview_widget'
    widgetDiv.style.height = 'calc(100% - 32px)'
    widgetDiv.style.width = '100%'
    
    const copyrightDiv = document.createElement('div')
    copyrightDiv.className = 'tradingview-widget-copyright'
    copyrightDiv.innerHTML = `
      <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
        <span class="blue-text">Track all markets on TradingView</span>
      </a>
    `
    copyrightDiv.style.height = '32px'
    copyrightDiv.style.lineHeight = '32px'
    copyrightDiv.style.textAlign = 'center'
    copyrightDiv.style.width = '100%'
    copyrightDiv.style.backgroundColor = '#1a1a1a'
    copyrightDiv.style.fontSize = '13px'
    
    widgetContainer.appendChild(widgetDiv)
    widgetContainer.appendChild(copyrightDiv)
    widgetContainer.appendChild(script)
    
    containerRef.current.appendChild(widgetContainer)

    console.log('✅ TradingView widget initialized for', symbol)

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [symbol])

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
        TradingView Professional ✓ {symbol}
      </div>
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '10px',
        fontSize: '12px',
        color: '#888',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '2px 6px',
        borderRadius: '3px'
      }}>
        {data?.length || 0} local candles
      </div>
    </div>
  )
}