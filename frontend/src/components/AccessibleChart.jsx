/**
 * Accessible Chart Component
 * Enhanced chart component with comprehensive accessibility features
 */

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { createChart } from 'lightweight-charts'
import useAccessibility from '../hooks/useAccessibility'
import {
  generateChartDescription,
  createChartDataTable,
  formatNumberForScreenReader,
  formatPercentageForScreenReader
} from '../utils/accessibility'

const AccessibleChart = ({
  data = [],
  symbol = '',
  timeframe = '1h',
  width = 800,
  height = 400,
  className = '',
  onPriceChange,
  loading = false,
  error = null
}) => {
  // ============================================================================
  // Hooks & State
  // ============================================================================

  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const [chartReady, setChartReady] = useState(false)
  const [lastPrice, setLastPrice] = useState(null)
  const [priceChange, setPriceChange] = useState(null)

  const {
    announce,
    announceDataUpdate,
    announceError,
    announceLoading,
    formatPrice,
    formatNumber,
    formatPercentage,
    generateId,
    isHighContrast,
    shouldAnimate
  } = useAccessibility()

  // ============================================================================
  // Chart Initialization
  // ============================================================================

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current || loading) return

    try {
      const chart = createChart(chartContainerRef.current, {
        width,
        height,
        layout: {
          backgroundColor: isHighContrast ? '#000000' : '#1a1a1a',
          textColor: isHighContrast ? '#ffffff' : '#d1d5db',
          fontSize: 12,
          fontFamily: 'Arial, sans-serif'
        },
        grid: {
          vertLines: {
            color: isHighContrast ? '#ffffff' : '#2a2a2a',
            style: 1,
            visible: true
          },
          horzLines: {
            color: isHighContrast ? '#ffffff' : '#2a2a2a',
            style: 1,
            visible: true
          }
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: isHighContrast ? '#ffffff' : '#4b5563',
          tickMarkFormatter: (time) => {
            const date = new Date(time * 1000)
            return date.toLocaleTimeString()
          }
        },
        rightPriceScale: {
          borderColor: isHighContrast ? '#ffffff' : '#4b5563',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1
          }
        },
        crosshair: {
          mode: 1, // Normal crosshair
          vertLine: {
            color: isHighContrast ? '#ffffff' : '#6b7280',
            width: 1,
            style: 2
          },
          horzLine: {
            color: isHighContrast ? '#ffffff' : '#6b7280',
            width: 1,
            style: 2
          }
        }
      })

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: isHighContrast ? '#ffffff' : '#00d4aa',
        downColor: isHighContrast ? '#000000' : '#ff6b6b',
        borderDownColor: isHighContrast ? '#ffffff' : '#ff6b6b',
        borderUpColor: isHighContrast ? '#000000' : '#00d4aa',
        wickDownColor: isHighContrast ? '#ffffff' : '#ff6b6b',
        wickUpColor: isHighContrast ? '#000000' : '#00d4aa'
      })

      chartRef.current = chart
      seriesRef.current = candlestickSeries
      setChartReady(true)

      // Handle resize
      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight
          })
        }
      }

      window.addEventListener('resize', handleResize)

      // Subscribe to crosshair move for price announcements
      chartRef.current.subscribeCrosshairMove((param) => {
        if (param.time && param.seriesPrices && param.seriesPrices.size > 0) {
          const price = param.seriesPrices.get(candlestickSeries)
          if (price && price.close && price.close !== lastPrice) {
            setLastPrice(price.close)
            if (onPriceChange) {
              onPriceChange(price.close)
            }
          }
        }
      })

      announce(`Chart initialized for ${symbol}`, 'polite')

      return () => {
        window.removeEventListener('resize', handleResize)
        if (chartRef.current) {
          chartRef.current.remove()
          chartRef.current = null
          seriesRef.current = null
          setChartReady(false)
        }
      }
    } catch (error) {
      console.error('Chart initialization error:', error)
      announceError('Failed to initialize chart')
    }
  }, [loading, isHighContrast, width, height, symbol, announce, announceError, formatPrice, lastPrice])

  // ============================================================================
  // Data Updates
  // ============================================================================

  useEffect(() => {
    if (!chartReady || !seriesRef.current || !data.length) return

    try {
      seriesRef.current.setData(data)
      
      // Calculate price change
      if (data.length >= 2) {
        const current = data[data.length - 1].close
        const previous = data[data.length - 2].close
        const change = current - previous
        const percentChange = ((change / previous) * 100)
        
        setLastPrice(current)
        setPriceChange(percentChange)
        
        // Announce data update
        const updateMessage = `Chart updated. Current price: ${formatNumber(current)}. ` +
                             `Change: ${formatPercentage(percentChange)}`
        announceDataUpdate(updateMessage)
        
        // Notify parent component
        if (onPriceChange) {
          onPriceChange(current, change, percentChange)
        }
      }
    } catch (error) {
      console.error('Chart data update error:', error)
      announceError('Failed to update chart data')
    }
  }, [data, chartReady, announceDataUpdate, formatNumber, formatPercentage, onPriceChange])

  // ============================================================================
  // Loading & Error Handling
  // ============================================================================

  useEffect(() => {
    if (loading) {
      announceLoading('Loading chart data')
    }
  }, [loading, announceLoading])

  useEffect(() => {
    if (error) {
      announceError(error)
    }
  }, [error, announceError])

  // ============================================================================
  // Chart Description Generation
  // ============================================================================

  const chartDescription = useCallback(() => {
    if (!data.length) return 'No chart data available'
    
    const description = generateChartDescription(data, 'candlestick')
    const currentPrice = lastPrice ? ` Current price: ${formatNumber(lastPrice)}.` : ''
    const change = priceChange !== null ? ` Price change: ${formatPercentage(priceChange)}.` : ''
    
    return `${description}${currentPrice}${change}`
  }, [data, lastPrice, priceChange, formatNumber, formatPercentage])

  // ============================================================================
  // Keyboard Handlers
  // ============================================================================

  const handleKeyDown = useCallback((event) => {
    if (!chartRef.current) return

    const { key } = event
    
    switch (key) {
      case 'ArrowLeft':
        event.preventDefault()
        // Pan left
        const timeScale = chartRef.current.timeScale()
        const visibleRange = timeScale.getVisibleRange()
        if (visibleRange) {
          const range = visibleRange.to - visibleRange.from
          const newFrom = visibleRange.from - range * 0.1
          const newTo = visibleRange.to - range * 0.1
          timeScale.setVisibleRange({ from: newFrom, to: newTo })
        }
        announce('Chart panned left', 'polite')
        break

      case 'ArrowRight':
        event.preventDefault()
        // Pan right
        const timeScaleRight = chartRef.current.timeScale()
        const visibleRangeRight = timeScaleRight.getVisibleRange()
        if (visibleRangeRight) {
          const range = visibleRangeRight.to - visibleRangeRight.from
          const newFrom = visibleRangeRight.from + range * 0.1
          const newTo = visibleRangeRight.to + range * 0.1
          timeScaleRight.setVisibleRange({ from: newFrom, to: newTo })
        }
        announce('Chart panned right', 'polite')
        break

      case '+':
      case '=':
        event.preventDefault()
        // Zoom in
        const currentRange = chartRef.current.timeScale().getVisibleRange()
        if (currentRange) {
          const range = currentRange.to - currentRange.from
          const center = (currentRange.from + currentRange.to) / 2
          const newRange = range * 0.8
          chartRef.current.timeScale().setVisibleRange({
            from: center - newRange / 2,
            to: center + newRange / 2
          })
        }
        announce('Chart zoomed in', 'polite')
        break

      case '-':
        event.preventDefault()
        // Zoom out
        const currentRangeOut = chartRef.current.timeScale().getVisibleRange()
        if (currentRangeOut) {
          const range = currentRangeOut.to - currentRangeOut.from
          const center = (currentRangeOut.from + currentRangeOut.to) / 2
          const newRange = range * 1.2
          chartRef.current.timeScale().setVisibleRange({
            from: center - newRange / 2,
            to: center + newRange / 2
          })
        }
        announce('Chart zoomed out', 'polite')
        break

      case '0':
        event.preventDefault()
        // Reset zoom
        chartRef.current.timeScale().fitContent()
        announce('Chart zoom reset', 'polite')
        break

      case 'd':
        event.preventDefault()
        // Announce current data description
        announce(chartDescription(), 'polite')
        break
    }
  }, [announce, chartDescription])

  // ============================================================================
  // Generate IDs
  // ============================================================================

  const chartId = generateId('chart')
  const descriptionId = generateId('chart-description')
  const tableId = generateId('chart-table')

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div 
      className={`accessible-chart ${className}`}
      role="application"
      aria-label={`Trading chart for ${symbol}`}
    >
      {/* Chart Description for Screen Readers */}
      <div 
        id={descriptionId}
        className="sr-only"
        aria-live="polite"
      >
        {chartDescription()}
      </div>

      {/* Chart Container */}
      <div
        ref={chartContainerRef}
        id={chartId}
        className="chart-container"
        tabIndex="0"
        role="img"
        aria-labelledby={descriptionId}
        aria-describedby={`${descriptionId} ${tableId}`}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          height: height,
          outline: 'none',
          border: isHighContrast ? '2px solid #ffffff' : '1px solid #374151',
          borderRadius: '4px'
        }}
      />

      {/* Loading State */}
      {loading && (
        <div 
          className="chart-loading"
          role="status"
          aria-label="Loading chart data"
        >
          <div className="loading-spinner" aria-hidden="true" />
          <span className="sr-only">Loading chart data for {symbol}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div 
          className="chart-error"
          role="alert"
          aria-label={`Chart error: ${error}`}
        >
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>Error loading chart: {error}</span>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="chart-help sr-only">
        <h3>Chart Keyboard Shortcuts:</h3>
        <ul>
          <li>Arrow Left/Right: Pan chart</li>
          <li>Plus/Minus: Zoom in/out</li>
          <li>0: Reset zoom</li>
          <li>D: Describe chart data</li>
        </ul>
      </div>

      {/* Data Table Alternative */}
      <div id={tableId} className="sr-only">
        <h3>Chart Data Table</h3>
        {data.length > 0 && (
          <table 
            role="table"
            aria-label={`Trading data for ${symbol}`}
          >
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Open</th>
                <th scope="col">High</th>
                <th scope="col">Low</th>
                <th scope="col">Close</th>
                <th scope="col">Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-10).map((candle, index) => (
                <tr key={index}>
                  <td>{new Date(candle.time * 1000).toLocaleString()}</td>
                  <td>{formatNumber(candle.open)}</td>
                  <td>{formatNumber(candle.high)}</td>
                  <td>{formatNumber(candle.low)}</td>
                  <td>{formatNumber(candle.close)}</td>
                  <td>{candle.volume ? formatNumber(candle.volume) : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Styles (would typically be in a CSS file)
// ============================================================================

const chartStyles = `
.accessible-chart {
  position: relative;
  width: 100%;
}

.chart-container:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 16px;
  border-radius: 4px;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #374151;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.chart-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  color: #dc2626;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #fecaca;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High contrast mode styles */
.high-contrast-mode .chart-container {
  border: 3px solid #ffffff !important;
}

.high-contrast-mode .chart-loading {
  background: #000000 !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
}

.high-contrast-mode .chart-error {
  background: #000000 !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
  
  * {
    transition: none !important;
    animation: none !important;
  }
}
`

export default AccessibleChart