// src/utils/dxChartsConverter.ts
// Data conversion utilities for DXcharts Lite integration

import { DXCandle } from '../components/DXChart'

// Your existing candle data format from lightweight-charts
export interface LightweightCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

// API response format from your backend
export interface APICandle {
  ts?: number        // timestamp (some APIs use 'ts')
  time?: number      // timestamp (some APIs use 'time')  
  timestamp?: number // timestamp (some APIs use 'timestamp')
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

/**
 * Convert your existing API data to DXcharts format
 */
export function convertToDXCandles(data: APICandle[]): DXCandle[] {
  if (!Array.isArray(data)) {
    console.warn('convertToDXCandles: data is not an array:', data)
    return []
  }

  const converted: DXCandle[] = []
  let invalidCount = 0

  for (const item of data) {
    // Extract timestamp from various possible field names
    const timestamp = item.ts || item.time || item.timestamp
    
    if (!timestamp) {
      invalidCount++
      continue
    }

    // Validate OHLC values
    const { open, high, low, close } = item
    if (!Number.isFinite(open) || !Number.isFinite(high) || 
        !Number.isFinite(low) || !Number.isFinite(close)) {
      invalidCount++
      continue
    }

    // Validate price logic (high >= low, etc.)
    if (high < low || high < Math.max(open, close) || low > Math.min(open, close)) {
      invalidCount++
      continue
    }

    // All validation passed - convert to DX format
    converted.push({
      timestamp: Number(timestamp),
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: item.volume ? Number(item.volume) : undefined
    })
  }

  if (invalidCount > 0) {
    console.warn(`convertToDXCandles: Filtered out ${invalidCount} invalid candles from ${data.length}`)
  }

  // Sort by timestamp
  return converted.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Convert lightweight-charts data to DXcharts format
 */
export function convertLightweightToDX(data: LightweightCandle[]): DXCandle[] {
  return data.map(candle => ({
    timestamp: candle.time as number,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume
  }))
}

/**
 * Merge historical data with live WebSocket data
 */
export function mergeHistoryAndLive(
  historical: DXCandle[], 
  live: DXCandle[]
): DXCandle[] {
  // Use a Map to deduplicate by timestamp (live data overrides historical)
  const map = new Map<number, DXCandle>()
  
  // Add historical data
  for (const candle of historical) {
    map.set(candle.timestamp, candle)
  }
  
  // Add live data (will override historical if same timestamp)
  for (const candle of live) {
    map.set(candle.timestamp, candle)
  }
  
  // Convert back to array and sort
  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Generate sample data for testing DXcharts
 */
export function generateSampleDXData(count: number = 100): DXCandle[] {
  const data: DXCandle[] = []
  const basePrice = 45000 // Sample BTC price
  const baseTimestamp = Math.floor(Date.now() / 1000) - (count * 300) // 5 minutes apart
  
  let price = basePrice
  
  for (let i = 0; i < count; i++) {
    const timestamp = baseTimestamp + (i * 300) // 5-minute intervals
    
    // Generate realistic price movement
    const change = (Math.random() - 0.5) * 1000 // Random change up to ±$500
    const open = price
    const close = Math.max(1000, open + change) // Ensure positive price
    const high = Math.max(open, close) + Math.random() * 200
    const low = Math.min(open, close) - Math.random() * 200
    const volume = Math.random() * 100
    
    data.push({
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Number(volume.toFixed(4))
    })
    
    price = close // Next candle starts where this one ended
  }
  
  return data
}

/**
 * Validate DX candle data
 */
export function validateDXCandles(data: DXCandle[]): boolean {
  if (!Array.isArray(data) || data.length === 0) return false
  
  for (const candle of data) {
    if (!Number.isFinite(candle.timestamp) || 
        !Number.isFinite(candle.open) || 
        !Number.isFinite(candle.high) || 
        !Number.isFinite(candle.low) || 
        !Number.isFinite(candle.close)) {
      return false
    }
    
    if (candle.high < candle.low || 
        candle.high < Math.max(candle.open, candle.close) || 
        candle.low > Math.min(candle.open, candle.close)) {
      return false
    }
  }
  
  return true
}

/**
 * Get the latest price from DX candle data
 */
export function getLatestPrice(data: DXCandle[]): number | null {
  if (!data || data.length === 0) return null
  
  const lastCandle = data[data.length - 1]
  if (!lastCandle || typeof lastCandle.close !== 'number') {
    console.warn('Invalid candle data for latest price calculation')
    return null
  }
  
  return lastCandle.close
}

/**
 * Get price change and percentage from DX candle data
 */
export function getPriceChange(data: DXCandle[]): { 
  change: number, 
  changePercent: number, 
  isPositive: boolean 
} | null {
  if (!data || data.length < 2) return null
  
  const latest = data[data.length - 1]?.close
  const previous = data[data.length - 2]?.close
  
  if (typeof latest !== 'number' || typeof previous !== 'number') {
    console.warn('Invalid price data for change calculation')
    return null
  }
  
  const change = latest - previous
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0
  
  return {
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    isPositive: change >= 0
  }
}

export function getLatestClose(data: any[]): number {
  if (!data || data.length === 0) {
    console.warn('No data available for latest close calculation')
    return 0
  }
  
  const lastItem = data[data.length - 1]
  if (!lastItem || typeof lastItem.close !== 'number') {
    console.warn('Invalid data format for latest close calculation')
    return 0
  }
  
  return lastItem.close
}

export function calculatePriceChange(data: any[]): { change: number; changePercent: number } {
  if (!data || data.length < 2) {
    console.warn('Insufficient data for price change calculation')
    return { change: 0, changePercent: 0 }
  }
  
  const latest = data[data.length - 1]?.close
  const previous = data[data.length - 2]?.close
  
  if (typeof latest !== 'number' || typeof previous !== 'number') {
    console.warn('Invalid price data for change calculation')
    return { change: 0, changePercent: 0 }
  }
  
  const change = latest - previous
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0
  
  return { change, changePercent }
}