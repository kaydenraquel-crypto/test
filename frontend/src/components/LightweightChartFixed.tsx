// CACHE BUST: 2025-08-24-15:33 - RENAMED FILE TO BREAK BROWSER CACHE - Assignment error fixed
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  CandlestickData,
  HistogramData,
  LineData
} from 'lightweight-charts'

interface LightweightChartProps {
  data: any[]
  symbol: string
  height?: number
  width?: string
  indicators?: {
    sma?: (number | null)[]
    ema?: (number | null)[]
    rsi?: (number | null)[]
    macd_hist?: (number | null)[]
    macd_signal?: (number | null)[]
    bb_high?: (number | null)[]
    bb_low?: (number | null)[]
  }
  signals?: Array<{
    ts: number
    type: 'buy' | 'sell'
    reason: string
    price: number
  }>
  onRealTimeUpdate?: (updateFunction: (newData: any) => void) => () => void
  scalePriceOnly?: boolean  // NEW: Option to scale price chart only, ignoring indicators
}

interface LegendInfo {
  time?: number
  open?: number
  high?: number
  low?: number
  close?: number
  volume?: number
}

export default function LightweightChart({
  data,
  symbol,
  height = 500,
  width = '100%',
  indicators,
  signals,
  onRealTimeUpdate,
  scalePriceOnly = true  // DEFAULT: Scale price only to prevent candlestick compression
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chart, setChart] = useState<IChartApi | null>(null)
  const [candleSeries, setCandleSeries] = useState<ISeriesApi<'Candlestick'> | null>(null)
  const [volumeSeries, setVolumeSeries] = useState<ISeriesApi<'Histogram'> | null>(null)
  const [indicatorSeries, setIndicatorSeries] = useState<ISeriesApi<'Line'>[]>([])
  const indicatorSeriesRef = useRef<ISeriesApi<'Line'>[]>([])
  const [legendInfo, setLegendInfo] = useState<LegendInfo>({})
  const [isInitializing, setIsInitializing] = useState(false)

  // Convert data to lightweight-charts format
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { candles: [], volume: [] }

    const candles: CandlestickData[] = []
    const volume: HistogramData[] = []

    console.log('🔍 Processing raw data for chart:', data.length, 'items')
    if (data.length > 0) {
      console.log('🔍 Sample data item:', data[0])
    }

    data.forEach((item, index) => {
      // Handle different timestamp formats from Alpha Vantage
      let time: number
      
      if (item.time && typeof item.time === 'number') {
        time = item.time
      } else if (item.ts && typeof item.ts === 'number') {
        time = item.ts
      } else if (item.timestamp && typeof item.timestamp === 'string') {
        time = new Date(item.timestamp).getTime() / 1000
      } else if (item.date && typeof item.date === 'string') {
        time = new Date(item.date).getTime() / 1000
      } else {
        console.warn(`⚠️ Invalid time data at index ${index}:`, item)
        return
      }

      // Validate OHLC data
      const open = parseFloat(item.open)
      const high = parseFloat(item.high) 
      const low = parseFloat(item.low)
      const close = parseFloat(item.close)
      
      // Check for valid numbers
      if (!isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(close)) {
        console.warn(`⚠️ Invalid OHLC data at index ${index}:`, { open, high, low, close })
        return
      }

      // Validate OHLC relationships (high >= low, high >= open, high >= close, low <= open, low <= close)
      if (high < low || high < open || high < close || low > open || low > close) {
        console.warn(`⚠️ Invalid OHLC relationships at index ${index}:`, { open, high, low, close })
        // Fix the relationships instead of skipping
        const maxPrice = Math.max(open, high, low, close)
        const minPrice = Math.min(open, high, low, close)
        candles.push({
          time,
          open,
          high: maxPrice,
          low: minPrice,
          close
        })
      } else {
        candles.push({
          time,
          open,
          high,
          low,
          close
        })
      }

      // Volume data
      const vol = parseFloat(item.volume) || 0
      volume.push({
        time,
        value: vol,
        color: open <= close ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'
      })
    })

    // Fixed: Changed const to let to allow reassignment for flat candle fixes
    let sortedCandles = candles.sort((a, b) => a.time - b.time)
    console.log('🔍 Processed candles:', sortedCandles.length)
    
    if (sortedCandles.length > 0) {
      const sample = sortedCandles[0]
      const ohlcRange = sample.high - sample.low
      const priceLevel = sample.close
      const rangePercent = (ohlcRange / priceLevel * 100).toFixed(4)
      console.log('🔍 First candle OHLC range:', {
        open: sample.open,
        high: sample.high,
        low: sample.low, 
        close: sample.close,
        range: ohlcRange.toFixed(4),
        rangePercent: `${rangePercent}%`
      })
      
      // Check for flat candles issue and fix them
      const flatCandles = sortedCandles.filter(c => c.high === c.low)
      if (flatCandles.length > 0) {
        console.warn(`⚠️ Found ${flatCandles.length} flat candles (high === low) - fixing...`)
        
        // Fix flat candles by adding small variance
        sortedCandles = sortedCandles.map(candle => {
          if (candle.high === candle.low) {
            // Add small variance (0.01% of price) to create visible candle
            const variance = candle.close * 0.0001 // 0.01%
            return {
              ...candle,
              high: candle.high + variance,
              low: candle.low - variance
            }
          }
          return candle
        })
        
        console.log(`✅ Fixed ${flatCandles.length} flat candles by adding 0.01% variance`)
      }
      
      // Check overall price range using fixed candles
      const allHighs = sortedCandles.map(c => c.high)
      const allLows = sortedCandles.map(c => c.low)
      const totalRange = Math.max(...allHighs) - Math.min(...allLows)
      console.log('📈 Overall price range (after fixing):', {
        min: Math.min(...allLows).toFixed(2),
        max: Math.max(...allHighs).toFixed(2),
        totalRange: totalRange.toFixed(4),
        avgCandleRange: (sortedCandles.reduce((sum, c) => sum + (c.high - c.low), 0) / sortedCandles.length).toFixed(4)
      })
    }

    return { candles: sortedCandles, volume }
  }, [data])

  // Handle crosshair move for legend - using ref to avoid dependency issues
  const handleCrosshairMove = useCallback((param: any) => {
    if (!param.point) {
      setLegendInfo({})
      return
    }

    // Get series references from current state instead of dependencies
    const currentCandleSeries = candleSeries
    const currentVolumeSeries = volumeSeries
    
    if (!currentCandleSeries) return
    
    const ohlc = param.seriesPrices.get(currentCandleSeries)
    const vol = param.seriesPrices.get(currentVolumeSeries)
    
    if (ohlc) {
      setLegendInfo({
        time: param.time,
        open: ohlc.open,
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        volume: vol?.value || 0
      })
    }
  }, []) // Remove dependencies to prevent recreation

  // Initialize chart - only recreate when symbol or height changes
  useEffect(() => {
    if (!chartContainerRef.current) return

    setIsInitializing(true)
    console.log('📊 Creating Lightweight Chart for', symbol)

    try {
      const newChart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          background: { type: ColorType.Solid, color: '#1a1a1a' },
          textColor: '#e0e0e0',
        },
        rightPriceScale: {
          scaleMargins: {
            top: 0.3,
            bottom: 0.25,
          },
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 12,
          barSpacing: 8,
          minBarSpacing: 4,
        },
        crosshair: {
          vertLine: {
            width: 1,
            color: '#4fc3f7',
            style: 3,
          },
          horzLine: {
            width: 1,
            color: '#4fc3f7',
            style: 3,
          },
        },
        grid: {
          vertLines: {
            color: '#333',
          },
          horzLines: {
            color: '#333',
          },
        },
      })

      // Add candlestick series with enhanced visibility settings
      const candleSeriesConfig = newChart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#26a69a',
        wickUpColor: '#ef5350',
        borderWidth: 1,
        wickWidth: 1,
        priceScaleId: 'right',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      })

      // Add volume series
      const volumeSeriesConfig = newChart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      })

      // Set state after everything is created successfully
      setChart(newChart)
      setCandleSeries(candleSeriesConfig)
      setVolumeSeries(volumeSeriesConfig)

      // Subscribe to crosshair moves with the stable callback
      newChart.subscribeCrosshairMove(handleCrosshairMove)

      console.log('📊 Chart initialized successfully for', symbol)
      setIsInitializing(false)

      return () => {
        try {
          newChart.unsubscribeCrosshairMove(handleCrosshairMove)
          newChart.remove()
          setChart(null)
          setCandleSeries(null)
          setVolumeSeries(null)
          setIndicatorSeries([])
          indicatorSeriesRef.current = []
          setIsInitializing(false)
        } catch (error) {
          console.error('Error during chart cleanup:', error)
        }
      }
    } catch (error) {
      console.error('Error initializing chart:', error)
      setIsInitializing(false)
    }
  }, [symbol, height]) // Removed handleCrosshairMove dependency

  // Handle resize
  useEffect(() => {
    if (!chart || !chartContainerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      chart.resize(width, height)
    })

    resizeObserver.observe(chartContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [chart])

  // Update data - stabilize with refs to prevent unnecessary updates
  const chartDataRef = useRef(chartData)
  const symbolRef = useRef(symbol)
  
  useEffect(() => {
    chartDataRef.current = chartData
    symbolRef.current = symbol
  }, [chartData, symbol])

  useEffect(() => {
    if (!candleSeries || !volumeSeries || !chartData.candles || chartData.candles.length === 0) {
      return
    }

    // Only log if this is actually a new update
    const dataChanged = chartDataRef.current !== chartData || symbolRef.current !== symbol
    if (dataChanged) {
      console.log(`📊 Setting data for ${symbol}:`, chartData.candles.length, 'candles')
      
      // Debug: Check OHLC ranges to see if values are too close
      if (chartData.candles.length > 0) {
        const sample = chartData.candles[0]
        const ohlcRange = sample.high - sample.low
        const priceLevel = sample.close
        const rangePercent = (ohlcRange / priceLevel * 100).toFixed(4)
        console.log(`📊 Sample candle OHLC range: ${ohlcRange.toFixed(4)} (${rangePercent}% of price)`)
        console.log(`📊 Sample values:`, {
          open: sample.open.toFixed(4),
          high: sample.high.toFixed(4), 
          low: sample.low.toFixed(4),
          close: sample.close.toFixed(4)
        })
      }
    }

    try {
      // Validate data before setting
      const validCandles = chartData.candles.filter(candle => 
        candle && 
        typeof candle.time === 'number' && 
        typeof candle.open === 'number' &&
        typeof candle.high === 'number' &&
        typeof candle.low === 'number' &&
        typeof candle.close === 'number'
      )

      const validVolume = chartData.volume.filter(vol => 
        vol && 
        typeof vol.time === 'number' && 
        typeof vol.value === 'number'
      )

      if (validCandles.length > 0) {
        candleSeries.setData(validCandles)
        if (dataChanged) console.log('✅ Candlestick data set successfully')
      }

      if (validVolume.length > 0) {
        volumeSeries.setData(validVolume)
        if (dataChanged) console.log('✅ Volume data set successfully')
      }

    } catch (error) {
      console.error('❌ Error setting chart data:', error)
    }
  }, [candleSeries, volumeSeries, chartData, symbol])

  // Add indicators - with proper lifecycle management
  useEffect(() => {
    if (!chart || !candleSeries || !volumeSeries || !indicators || !chartData.candles.length) {
      return
    }

    // Clear existing indicator series first
    indicatorSeriesRef.current.forEach(series => {
      try {
        chart.removeSeries(series)
      } catch (error) {
        console.warn('Error removing indicator series:', error)
      }
    })

    const newIndicatorSeries: ISeriesApi<'Line'>[] = []

    const addIndicators = () => {
      try {
        // Only add price-based indicators to main chart (skip oscillators like RSI)
        console.log('📊 Adding indicators to chart:', Object.keys(indicators))
        
        // Add SMA if available (price-compatible)
        if (indicators.sma && Array.isArray(indicators.sma)) {
          const smaData: LineData[] = []
          indicators.sma.forEach((value, index) => {
            if (value !== null && chartData.candles[index]) {
              smaData.push({
                time: chartData.candles[index].time,
                value: value
              })
            }
          })
          
          if (smaData.length > 0) {
            console.log('📊 Adding SMA with', smaData.length, 'points, scalePriceOnly:', scalePriceOnly)
            const smaSeries = chart.addLineSeries({
              color: '#ff9800',
              lineWidth: 2,
              title: 'SMA',
              priceScaleId: scalePriceOnly ? '' : 'right',  // Use separate scale if scalePriceOnly is enabled
              autoscaleInfoProvider: scalePriceOnly ? () => null : undefined  // Disable autoscaling for indicators when scalePriceOnly is true
            })
            smaSeries.setData(smaData)
            newIndicatorSeries.push(smaSeries)
          }
        }

        // Add EMA if available (price-compatible)
        if (indicators.ema && Array.isArray(indicators.ema)) {
          const emaData: LineData[] = []
          indicators.ema.forEach((value, index) => {
            if (value !== null && chartData.candles[index]) {
              emaData.push({
                time: chartData.candles[index].time,
                value: value
              })
            }
          })
          
          if (emaData.length > 0) {
            console.log('📊 Adding EMA with', emaData.length, 'points, scalePriceOnly:', scalePriceOnly)
            const emaSeries = chart.addLineSeries({
              color: '#9c27b0',
              lineWidth: 2,
              title: 'EMA',
              priceScaleId: scalePriceOnly ? '' : 'right',  // Use separate scale if scalePriceOnly is enabled
              autoscaleInfoProvider: scalePriceOnly ? () => null : undefined  // Disable autoscaling for indicators when scalePriceOnly is true
            })
            emaSeries.setData(emaData)
            newIndicatorSeries.push(emaSeries)
          }
        }

        // Skip RSI - it's an oscillator (0-100) that would compress price chart
        if (indicators.rsi && Array.isArray(indicators.rsi)) {
          console.log('📊 Skipping RSI (oscillator) - would compress price chart')
        }

        // Skip MACD - it's an oscillator with different scale that would compress price chart  
        if (indicators.macd || indicators.macd_hist || indicators.macd_signal) {
          console.log('📊 Skipping MACD (oscillator) - would compress price chart')
        }

        // Temporarily skip Bollinger Bands to test if they're affecting scale
        if (indicators.bb_high && indicators.bb_low && 
            Array.isArray(indicators.bb_high) && Array.isArray(indicators.bb_low)) {
          console.log('📊 Skipping Bollinger Bands temporarily to test candlestick scaling')
        }

        // Update the indicator series state and ref
        setIndicatorSeries(newIndicatorSeries)
        indicatorSeriesRef.current = newIndicatorSeries
      } catch (error) {
        console.error('Error adding indicators to chart:', error)
      }
    }

    // Add indicators with a small delay to ensure chart is ready
    const timeoutId = setTimeout(addIndicators, 100)
    
    return () => clearTimeout(timeoutId)
  }, [chart, candleSeries, volumeSeries, indicators, chartData])

  // Add trading signals
  useEffect(() => {
    if (!candleSeries || !signals) return

    signals.forEach(signal => {
      const marker = {
        time: signal.ts,
        position: signal.type === 'buy' ? 'belowBar' as const : 'aboveBar' as const,
        color: signal.type === 'buy' ? '#4caf50' : '#f44336',
        shape: signal.type === 'buy' ? 'arrowUp' as const : 'arrowDown' as const,
        text: signal.reason,
      }

      candleSeries.setMarkers([marker])
    })
  }, [candleSeries, signals])

  // Real-time update functionality
  useEffect(() => {
    if (!onRealTimeUpdate || !candleSeries || !volumeSeries) return

    const updateChart = (newData: any) => {
      if (!candleSeries || !volumeSeries) return

      // Update candlestick series
      candleSeries.update({
        time: newData.time,
        open: newData.open,
        high: newData.high,
        low: newData.low,
        close: newData.close
      })

      // Update volume series
      volumeSeries.update({
        time: newData.time,
        value: newData.volume,
        color: newData.close > newData.open ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'
      })

      console.log(`📊 Real-time update for ${symbol}:`, {
        time: new Date(newData.time * 1000).toLocaleTimeString(),
        price: newData.close.toFixed(2),
        volume: newData.volume.toLocaleString()
      })
    }

    // Set up real-time updates
    const stopUpdates = onRealTimeUpdate(updateChart)
    
    return stopUpdates
  }, [onRealTimeUpdate, candleSeries, volumeSeries, symbol])

  return (
    <div style={{
      width,
      height,
      position: 'relative'
    }}>
      {/* Loading overlay */}
      {isInitializing && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(26, 26, 26, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center', color: '#e0e0e0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #333',
              borderTop: '3px solid #4fc3f7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }} />
            <div style={{ fontSize: '14px' }}>Initializing Chart...</div>
          </div>
        </div>
      )}

      {/* Chart container */}
      <div 
        ref={chartContainerRef}
        style={{ 
          width: '100%',
          height: '100%',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px'
        }}
      />
      
      {/* Legend overlay */}
      {legendInfo.time && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <div><strong>{symbol}</strong></div>
          <div>O: {legendInfo.open?.toFixed(2)}</div>
          <div>H: {legendInfo.high?.toFixed(2)}</div>
          <div>L: {legendInfo.low?.toFixed(2)}</div>
          <div>C: {legendInfo.close?.toFixed(2)}</div>
          <div>V: {legendInfo.volume?.toLocaleString()}</div>
        </div>
      )}

      {/* Professional badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        Lightweight Charts ✓
      </div>

      {/* Data info */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        fontSize: '12px',
        color: '#888',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '2px 6px',
        borderRadius: '3px'
      }}>
        {data?.length || 0} candles
      </div>
    </div>
  )
}