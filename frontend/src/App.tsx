// src/App.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback, lazy, Suspense } from 'react'
import LightweightChart from './components/LightweightChartFixed' // OHLC Chart Foundation
import ChartControls from './components/ChartControls' // Professional chart controls
import StrategyBuilder from './components/StrategyBuilder' // Strategy Builder Modal
import BacktestResults from './components/BacktestResults' // Backtest Results Modal
import OptimizedLayout from './components/OptimizedLayout' // Optimized Layout Component
import AlphaVantageChartTest from './components/AlphaVantageChartTest' // Alpha Vantage Chart Test
import TradingViewChart from './components/TradingViewChart' // TradingView Chart (Industry Standard)
import RealTimeTrading from './components/RealTimeTrading' // Real-Time Trading with Alpha Vantage
// import DXChartsTest from './components/DXChartsTest' // Temporary test component
import { getIndicators, getPredictions, getNews, getHistory, BACKEND } from './lib/api'
import { useErrorHandler } from './lib/errorHandling'
import { tradingCache } from './lib/cache'
import { useReconnectingWebSocket } from './hooks/useReconnectingWebSocket'
import { useUserPreferences, useChartPreferences, useDisplayPreferences } from './hooks/useUserPreferences'
import { userPreferences } from './lib/userPreferences'
import { analytics, useAnalytics } from './lib/analytics'
import { logger, useLogger } from './lib/logger'
import ErrorBoundary from './components/ErrorBoundary'
import type { KeyboardShortcut } from './types'
import { ChartSkeleton, LoadingSpinner, DataPanelSkeleton, InlineLoader, SignalsSkeleton } from './components/LoadingStates'
import ChartCustomization, { useChartSettings, ChartSettings } from './components/ChartCustomization'
import KeyIndicators from './components/KeyIndicators'
// Removed DXChartWorkingTest - no longer needed

// Lazy-loaded components for better performance
const AiAssistantPanel = lazy(() => import('./components/AiAssistantPanel'))
const WatchlistPanel = lazy(() => import('./components/WatchlistPanel'))
const AlertsPanel = lazy(() => import('./components/AlertsPanel'))
const TimeframePanel = lazy(() => import('./components/TimeframePanel'))
const NewsFeed = lazy(() => import('./components/NewsFeed'))
const AdvancedIndicators = lazy(() => import('./components/AdvancedIndicators'))
const MarketScanner = lazy(() => import('./components/MarketScanner'))
const Settings = lazy(() => import('./components/Settings'))
const Portfolio = lazy(() => import('./components/Portfolio'))
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard'))
const DataExportPanel = lazy(() => import('./components/DataExportPanel'))
const PortfolioManager = lazy(() => import('./components/PortfolioManager'))
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import './styles.css'
import './styles/theme.css'


type Market = 'crypto' | 'stocks'
type HistoryPreset = '1D' | '1W' | '1M' | '3M'
const MIN_CANDLES_DEFAULT = 5

// Define types locally since we removed DXChartFull
interface CandlestickData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

interface IndicatorData {
  sma?: (number | null)[]
  ema?: (number | null)[]
  rsi?: (number | null)[]
  macd_hist?: (number | null)[]
  macd_signal?: (number | null)[]
  bb_high?: (number | null)[]
  bb_low?: (number | null)[]
  atr?: (number | null)[]
}

interface TradingSignal {
  ts: number
  type: 'buy' | 'sell'
  reason: string
  price: number
  tag?: string
}

// Data caching hook to prevent history loss when switching symbols
function useDataCache() {
  const [cache, setCache] = useState<Map<string, any>>(new Map())
  
  const getCacheKey = useCallback((symbol: string, market: string, interval: number, dataType: string) => 
    `${market}-${symbol}-${interval}-${dataType}`, [])
  
  const getCachedData = useCallback((symbol: string, market: string, interval: number, dataType: string) => {
    const key = getCacheKey(symbol, market, interval, dataType)
    const cached = cache.get(key)
    
    if (cached && cached.timestamp && Date.now() - cached.timestamp < 300000) { // 5 min cache
      console.log(`📦 Cache HIT for ${key}`)
      return cached.data
    }
    
    console.log(`📦 Cache MISS for ${key}`)
    return null
  }, [cache, getCacheKey])
  
  const setCachedData = useCallback((symbol: string, market: string, interval: number, dataType: string, data: any) => {
    const key = getCacheKey(symbol, market, interval, dataType)
    setCache(prev => new Map(prev).set(key, {
      data,
      timestamp: Date.now()
    }))
    console.log(`📦 Cached ${key} with ${Array.isArray(data) ? data.length : 'object'} items`)
  }, [getCacheKey])
  
  const clearCache = useCallback(() => {
    setCache(new Map())
    console.log('📦 Cache cleared')
  }, [])
  
  return { getCachedData, setCachedData, clearCache, cacheSize: cache.size }
}

// Symbol validation to prevent invalid API calls
function isValidSymbol(symbol: string, market: 'crypto' | 'stocks'): boolean {
  if (!symbol || symbol.length < 1) return false
  
  if (market === 'crypto') {
    const symbolUpper = symbol.toUpperCase()
    
    // Accept slash-separated format (ETH/USD, BTC/USDT)
    if (symbol.includes('/')) {
      const [base, quote] = symbol.split('/')
      if (!base || !quote) return false
      if (base.length < 2 || quote.length < 3) return false
      
      const validQuotePattern = /^(USD|EUR|BTC|ETH|USDT|USDC|BNB|ADA|DOT)$/i
      const validBasePattern = /^[A-Z]{2,10}$/i
      
      return validBasePattern.test(base.toUpperCase()) && validQuotePattern.test(quote.toUpperCase())
    }
    
    // Accept Binance-style format (BTCUSDT, ETHUSDT, ADAUSDT)
    if (/^[A-Z]{3,}(USDT|USDC|BTC|ETH|BNB|USD)$/.test(symbolUpper)) {
      return true
    }
    
    // Accept dash-separated format (BTC-USD)
    if (symbol.includes('-')) {
      const [base, quote] = symbol.split('-')
      if (!base || !quote) return false
      
      const validQuotePattern = /^(USD|EUR|BTC|ETH|USDT|USDC|BNB)$/i
      const validBasePattern = /^[A-Z]{2,10}$/i
      
      return validBasePattern.test(base.toUpperCase()) && validQuotePattern.test(quote.toUpperCase())
    }
    
    return false // Must match one of the above patterns
  } else {
    // Stock symbols: 1-5 characters, letters only
    const cleanSymbol = symbol.toUpperCase().trim()
    if (cleanSymbol.length < 1 || cleanSymbol.length > 5) return false
    
    // Accept any reasonable stock symbol pattern
    return /^[A-Z]{1,5}$/.test(cleanSymbol)
  }
}

// Debounce hook to prevent rapid API calls while typing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function presetToDays(p: HistoryPreset): number {
  switch (p) {
    case '1D': return 1
    case '1W': return 7
    case '1M': return 30
    case '3M': return 90
    default: return 7
  }
}

// Normalize arbitrary bar objects into CandlestickData format
function normalizeCandles(arr: any[]): CandlestickData[] {
  if (!Array.isArray(arr)) return []
  
  const out: CandlestickData[] = []
  let invalidCount = 0
  
  for (const r of arr) {
    const t = Number.isFinite(r?.time) ? Number(r.time) :
              Number.isFinite(r?.ts)   ? Number(r.ts)   : NaN
    const o = Number(r?.open), h = Number(r?.high), l = Number(r?.low), c = Number(r?.close)
    
    // Check for null/undefined values specifically
    if (r?.open === null || r?.high === null || r?.low === null || r?.close === null) {
      invalidCount++
      if (invalidCount <= 3) {
        console.warn('🚨 Null OHLC values detected:', r)
      }
      continue
    }
    
    // Validate that all OHLC values are finite numbers (simplified validation)
    if (Number.isFinite(t) && Number.isFinite(o) && Number.isFinite(h) && Number.isFinite(l) && Number.isFinite(c) &&
        o > 0 && h > 0 && l > 0 && c > 0) {
      
      // Simplified validation: just ensure high >= low (allow other edge cases)
      if (h >= l) {
        out.push({ time: t as any, open: o, high: h, low: l, close: c })
      } else {
        invalidCount++
        if (invalidCount <= 3) {
          console.warn('🚨 Invalid OHLC logic:', r, 'h>=l:', h >= l, 'h>=max(o,c):', h >= Math.max(o, c))
        }
      }
    } else {
      invalidCount++
      if (invalidCount <= 3) {
        console.warn('🚨 Non-finite OHLC values:', r)
      }
    }
  }
  
  if (invalidCount > 0) {
    console.warn(`🚨 Filtered out ${invalidCount} invalid candles from ${arr.length}`)
  }
  
  // de-dupe by time (keep last) & sort
  const map = new Map<number, CandlestickData>()
  for (const c of out) map.set(c.time as number, c)
  return Array.from(map.values()).sort((a,b) => (a.time as number) - (b.time as number))
}

// Heikin‑Ashi transform (display only)
function toHeikinAshi(candles: CandlestickData[]): CandlestickData[] {
  if (!candles?.length) return []
  const ha: CandlestickData[] = []
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i]
    if (!c) continue
    const prev = ha[i - 1]
    const haClose = (c.open + c.high + c.low + c.close) / 4
    const haOpen = i === 0 ? (c.open + c.close) / 2 : ((prev?.open as number) + (prev?.close as number)) / 2
    const haHigh = Math.max(c.high, haOpen, haClose)
    const haLow = Math.min(c.low, haOpen, haClose)
    ha.push({ time: c.time, open: haOpen, high: haHigh, low: haLow, close: haClose })
  }
  return ha
}

// Chart spacing is now handled automatically by DXCharts - no manual enforcement needed

// Enhanced WebSocket hook with reconnection and normalization
function useWebSocketOHLC(url: string) {
  const webSocketState = useReconnectingWebSocket(url, {
    maxRetries: 15,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 1.5,
    pingInterval: 25000,
    pongTimeout: 10000
  })

  // Process and normalize incoming WebSocket data - using useMemo instead of useEffect
  const normalizedData = useMemo(() => {
    if (webSocketState.data.length === 0) return []
    
    const rawData = webSocketState.data.slice(-100) // Process last 100 items
    const normalized = normalizeCandles(rawData)
    
    // Keep only valid candles and limit to 8000
    return normalized.slice(-8000).sort((a, b) => (a.time as number) - (b.time as number))
  }, [webSocketState.data.length]) // Only re-compute when data length changes

  return { 
    data: normalizedData, 
    connectionStatus: webSocketState.connectionStatus,
    reconnect: webSocketState.reconnect,
    disconnect: webSocketState.disconnect,
    error: webSocketState.error,
    reconnectAttempts: webSocketState.reconnectAttempts,
    lastConnected: webSocketState.lastConnected,
    isReconnecting: webSocketState.isReconnecting
  }
}

// Helper function to detect market type from symbol
function getMarketFromSymbol(symbol: string): Market {
  const symbolUpper = symbol.toUpperCase()
  
  // Crypto patterns - prioritize crypto detection
  if (symbol.includes('/') || symbol.includes('-') || 
      ['BTC', 'ETH', 'XBT', 'LTC', 'ADA', 'SOL', 'DOGE', 'USDT', 'USDC', 'USD'].some(crypto => symbolUpper.includes(crypto))) {
    return 'crypto'
  }
  
  // Binance-style crypto pairs (e.g., BTCUSDT, ETHUSDT)
  if (/^[A-Z]{3,}(USDT|USDC|BTC|ETH|BNB|USD)$/.test(symbolUpper)) {
    return 'crypto'
  }
  
  // Common stock symbols patterns (1-5 characters, no crypto indicators)
  if (/^[A-Z]{1,5}$/.test(symbolUpper) && !symbolUpper.includes('USD') && !symbolUpper.includes('BTC')) {
    return 'stocks'
  }
  
  // Default to crypto since this is primarily a crypto trading app
  return 'crypto'
}

export default function App() {
  console.log('🚀 APP.TSX STARTING - CHECKING FOR DXTEST MODE')
  
  // Test Mode - Set to true to test charts, false for normal app
  const [testMode, setTestMode] = useState(() => {
    // Check URL parameter for test mode
    const params = new URLSearchParams(window.location.search)
    const isDxTest = params.has('dxtest')
    const isAlphaTest = params.has('alphatest')
    const isRealTimeTest = params.has('realtime')
    const isTradingViewTest = params.has('tvtest')
    const testModeActive = isDxTest || isAlphaTest || isTradingViewTest || isRealTimeTest
    console.log('🔍 Test Mode Check:', {
      url: window.location.href,
      search: window.location.search,
      isDxTest,
      isAlphaTest,
      isRealTimeTest,
      isTradingViewTest,
      testModeActive,
      allParams: Array.from(params.entries())
    })
    console.log(testModeActive ? '🟢 TEST MODE ACTIVATED!' : '🔴 Regular app mode')
    return testModeActive ? (isAlphaTest ? 'alpha' : isRealTimeTest ? 'realtime' : isTradingViewTest ? 'tradingview' : 'dx') : false
  })

  // Also add useEffect to handle URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search)
      const isDxTest = params.has('dxtest')
      const isAlphaTest = params.has('alphatest')
      const isTradingViewTest = params.has('tvtest')
      const testModeActive = isDxTest || isAlphaTest || isTradingViewTest
      console.log('🔍 URL Changed - Test Mode:', { isDxTest, isAlphaTest, isTradingViewTest, testModeActive })
      setTestMode(testModeActive ? (isAlphaTest ? 'alpha' : isTradingViewTest ? 'tradingview' : 'dx') : false)
    }

    // Listen for popstate events (back/forward)
    window.addEventListener('popstate', handleUrlChange)
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
    }
  }, [])

  // Error handling state
  const errorHandler = useErrorHandler()
  
  // User preferences
  const { preferences, addRecentSymbol } = useUserPreferences()
  const chartPrefs = useChartPreferences()
  const displayPrefs = useDisplayPreferences()
  
  // Analytics and logging
  const analyticsHook = useAnalytics()
  const loggerHook = useLogger()
  
  // Modal states
  const [showSettings, setShowSettings] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  
  // Strategy Engine states
  const [showStrategyBuilder, setShowStrategyBuilder] = useState(false)
  const [showBacktestResults, setShowBacktestResults] = useState(false)
  const [showPortfolioManager, setShowPortfolioManager] = useState(false)
  const [backtestData, setBacktestData] = useState<any>(null)
  
  // Initialize state from preferences with proper market detection
  const initialSymbol = useMemo(() => {
    // Allow user to input any valid symbol, don't force crypto default
    return preferences.defaultSymbol || 'AAPL' // Start with a neutral stock symbol
  }, [preferences.defaultSymbol])
  
  const [market, setMarket] = useState<Market>(() => {
    const detectedMarket = getMarketFromSymbol(initialSymbol)
    console.log('🔍 Market detection:', { initialSymbol, detectedMarket })
    return detectedMarket
  })
  const [provider, setProvider] = useState<string>('auto')
  
  // Separate input state from debounced symbol - initialize from preferences
  const [symbolInput, setSymbolInput] = useState<string>(initialSymbol)
  const symbol = useDebounce(symbolInput, 1200) // Longer debounce to prevent rate limiting
  
  // Initialize symbol from preferences only on first load
  useEffect(() => {
    // Only set initial symbol if symbolInput is still the default
    if (symbolInput === initialSymbol && preferences.defaultSymbol && preferences.defaultSymbol !== symbolInput) {
      const newSymbol = preferences.defaultSymbol
      const newMarket = getMarketFromSymbol(newSymbol)
      
      console.log('🔄 Initial preferences loaded:', { 
        newSymbol, 
        newMarket, 
        currentSymbol: symbolInput,
        currentMarket: market
      })
      
      setSymbolInput(newSymbol)
      setMarket(newMarket)
      // Clear old cached data when symbol changes
      tradingCache.clearSymbolData(symbolInput, market)
    }
  }, [preferences.defaultSymbol, initialSymbol]) // Removed symbolInput and market from deps to prevent loops
  
  const [interval, setIntervalV] = useState<number>(5)
  const [historyPreset, setHistoryPreset] = useState<HistoryPreset>('1D')
  const [minCandles, setMinCandles] = useState<number>(MIN_CANDLES_DEFAULT)

  // Cache statistics for display
  const cacheSize = tradingCache.getStats().totalEntries

  // Chart customization settings - initialize from preferences
  const [chartSettings, setChartSettings] = useChartSettings()

  // Stabilize chart preferences to prevent infinite loops
  const stableChartPrefs = useMemo(() => ({
    type: chartPrefs.type,
    showGrid: chartPrefs.showGrid,
    showVolume: chartPrefs.showVolume,
  }), [chartPrefs.type, chartPrefs.showGrid, chartPrefs.showVolume])

  // Debug: Expose state variables to window object for debugging
  useEffect(() => {
    // @ts-ignore - Adding debugging variables to window
    window.debugState = {
      symbol,
      symbolInput, 
      market,
      provider,
      interval,
      historyPreset
    }
    // @ts-ignore
    window.symbol = symbol
    // @ts-ignore  
    window.market = market
    // @ts-ignore
    window.provider = provider
    // @ts-ignore - Add manual cache clear function
    window.clearAllCache = () => {
      console.log('🗑️ Manually clearing all caches...')
              tradingCache.getHistory = () => undefined // Force cache miss
      localStorage.clear()
      sessionStorage.clear()
      setHistory([])
      window.location.reload()
    }
    
    console.log('🔍 DEBUG STATE UPDATE:', {
      symbol,
      symbolInput,
      market, 
      provider,
      interval,
      historyPreset
    })
  }, [symbol, symbolInput, market, provider, interval, historyPreset])

  // Update chart settings when preferences change - with stable deps
  useEffect(() => {
    setChartSettings(prev => ({
      ...prev,
      chartType: stableChartPrefs.type as any,
      showGrid: stableChartPrefs.showGrid,
      showVolume: stableChartPrefs.showVolume,
    }))
  }, [stableChartPrefs.type, stableChartPrefs.showGrid, stableChartPrefs.showVolume])

  // Extract stable functions from hooks to prevent callback deps from changing
  const trackSymbolView = analyticsHook.trackSymbolView
  const logUser = loggerHook.user

  // Symbol change handler with recent symbol tracking
  const handleSymbolChange = useCallback((newSymbol: string, newMarket?: 'crypto' | 'stocks') => {
    if (newMarket) setMarket(newMarket)
    setSymbolInput(newSymbol)
    
    // Add to recent symbols and track analytics when a valid symbol is selected
    if (isValidSymbol(newSymbol, newMarket || market)) {
      addRecentSymbol(newSymbol)
      trackSymbolView(newSymbol, newMarket || market)
      logUser(`Symbol changed to ${newSymbol}`, { symbol: newSymbol, market: newMarket || market })
    }
  }, [market, addRecentSymbol, trackSymbolView, logUser])

  const handleWatchlistSymbolSelect = useCallback((symbol: string) => {
    // Auto-detect market from symbol since WatchlistPanel only passes symbol
    const detectedMarket = getMarketFromSymbol(symbol)
    handleSymbolChange(symbol, detectedMarket)
  }, [handleSymbolChange])

  // New consolidated chart controls state
  const [selectedOverlays, setSelectedOverlays] = useState<string[]>(() => {
    const overlays = []
    if (preferences.enabledIndicators.sma) overlays.push('sma_20')
    if (preferences.enabledIndicators.ema) overlays.push('ema_20')
    if (preferences.enabledIndicators.bollinger) overlays.push('bb_bands')
    return overlays
  })
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(() => {
    const indicators = []
    if (preferences.enabledIndicators.rsi) indicators.push('rsi')
    if (preferences.enabledIndicators.macd) indicators.push('macd')
    return indicators
  })
  const [selectedSignals, setSelectedSignals] = useState<string[]>(['ema_cross', 'macd_cross', 'rsi_levels', 'bb_touch'])
  const [scalePriceOnly, setScalePriceOnly] = useState(true)
  
  // Legacy state for compatibility (advanced options)
  const [atrMult, setAtrMult] = useState(1.5)

  // Helper functions to maintain compatibility with existing code
  const showSMA = selectedOverlays.includes('sma_20')
  const showEMA = selectedOverlays.includes('ema_20') 
  const showBB = selectedOverlays.includes('bb_bands')
  const showRSI = selectedIndicators.includes('rsi')
  const showMACD = selectedIndicators.includes('macd')
  const showEmaCross = selectedSignals.includes('ema_cross')
  const showMacdCross = selectedSignals.includes('macd_cross')
  const showRsiLevels = selectedSignals.includes('rsi_levels')
  const showBbTouch = selectedSignals.includes('bb_touch')
  
  // Update legacy state when new controls change
  const setShowATRBands = (enabled: boolean) => {
    if (enabled && !selectedOverlays.includes('atr_bands')) {
      setSelectedOverlays([...selectedOverlays, 'atr_bands'])
    } else if (!enabled && selectedOverlays.includes('atr_bands')) {
      setSelectedOverlays(selectedOverlays.filter(o => o !== 'atr_bands'))
    }
  }
  
  const setUseHeikinAshi = (enabled: boolean) => {
    if (enabled && !selectedOverlays.includes('heikin_ashi')) {
      setSelectedOverlays([...selectedOverlays, 'heikin_ashi'])
    } else if (!enabled && selectedOverlays.includes('heikin_ashi')) {
      setSelectedOverlays(selectedOverlays.filter(o => o !== 'heikin_ashi'))
    }
  }

  // Data
  const [indicators, setIndicators] = useState<any>({})
  const [signals, setSignals] = useState<any[]>([])
  const [preds, setPreds] = useState<any>({})
  const [news, setNews] = useState<any[]>([])

  // DXCharts ref
  const dxChartRef = useRef<any>(null)

  // History buffer
  const [history, setHistory] = useState<CandlestickData[]>([])
  
  // Loading states
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingIndicators, setIsLoadingIndicators] = useState(false)
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)
  const [isLoadingNews, setIsLoadingNews] = useState(false)

  // Functions that need to be defined before keyboard shortcuts
  const refreshData = useCallback(() => {
    // Refresh all data
    window.location.reload()
  }, [])

  // Chart manipulation functions for DXCharts
  const zoomIn = useCallback(() => {
    if (dxChartRef.current) {
      // DXCharts handles zoom differently
      console.log('🔍 DXCharts zoom in')
    }
  }, [])

  const zoomOut = useCallback(() => {
    if (dxChartRef.current) {
      // DXCharts handles zoom differently  
      console.log('🔍 DXCharts zoom out')
    }
  }, [])

  const resetZoom = useCallback(() => {
    if (dxChartRef.current) {
      // DXCharts handles fit content differently
      console.log('🔍 DXCharts reset zoom')
    }
  }, [])

  // Keyboard shortcuts constants
  const SHORTCUT_KEYS = {
    REFRESH: { keys: ['F5'], description: 'Refresh data' },
    SEARCH: { keys: ['Control', 'k'], description: 'Focus symbol search' },
    TIMEFRAME_1M: { keys: ['1'], description: 'Switch to 1m timeframe' },
    TIMEFRAME_5M: { keys: ['2'], description: 'Switch to 5m timeframe' },
    TIMEFRAME_15M: { keys: ['3'], description: 'Switch to 15m timeframe' },
    TIMEFRAME_1H: { keys: ['4'], description: 'Switch to 1h timeframe' },
    TIMEFRAME_4H: { keys: ['5'], description: 'Switch to 4h timeframe' },
    TIMEFRAME_1D: { keys: ['6'], description: 'Switch to 1d timeframe' },
    TOGGLE_SMA: { keys: ['s'], description: 'Toggle SMA indicator' },
    TOGGLE_EMA: { keys: ['e'], description: 'Toggle EMA indicator' },
    TOGGLE_BB: { keys: ['b'], description: 'Toggle Bollinger Bands' },
    TOGGLE_RSI: { keys: ['r'], description: 'Toggle RSI indicator' },
    TOGGLE_MACD: { keys: ['m'], description: 'Toggle MACD indicator' },
    OPEN_SETTINGS: { keys: ['Control', ','], description: 'Open settings' },
    SHOW_SHORTCUTS: { keys: ['Shift', '?'], description: 'Show keyboard shortcuts' },
    FIT_CONTENT: { keys: ['f'], description: 'Fit chart content' },
    ZOOM_IN: { keys: ['Control', '='], description: 'Zoom in chart' },
    ZOOM_OUT: { keys: ['Control', '-'], description: 'Zoom out chart' },
    RESET_ZOOM: { keys: ['Control', '0'], description: 'Reset chart zoom' }
  }

  // Keyboard shortcuts configuration
  const keyboardShortcuts: KeyboardShortcut[] = [
    // Navigation
    { 
      ...SHORTCUT_KEYS.REFRESH, 
      category: 'Navigation',
      handler: () => {
        refreshData()
        analyticsHook.track('keyboard_shortcut_used', { action: 'refresh' })
      }
    },
    {
      ...SHORTCUT_KEYS.SEARCH,
      category: 'Navigation', 
      handler: () => {
        const input = document.querySelector('input[placeholder*="symbol"]') as HTMLInputElement
        if (input) {
          input.focus()
          input.select()
        }
        analyticsHook.track('keyboard_shortcut_used', { action: 'search' })
      }
    },

    // Timeframes
    { ...SHORTCUT_KEYS.TIMEFRAME_1M, category: 'Timeframes', handler: () => setIntervalV(1) },
    { ...SHORTCUT_KEYS.TIMEFRAME_5M, category: 'Timeframes', handler: () => setIntervalV(5) },
    { ...SHORTCUT_KEYS.TIMEFRAME_15M, category: 'Timeframes', handler: () => setIntervalV(15) },
    { ...SHORTCUT_KEYS.TIMEFRAME_1H, category: 'Timeframes', handler: () => setIntervalV(60) },
    { ...SHORTCUT_KEYS.TIMEFRAME_4H, category: 'Timeframes', handler: () => setIntervalV(240) },
    { ...SHORTCUT_KEYS.TIMEFRAME_1D, category: 'Timeframes', handler: () => setIntervalV(1440) },

    // Indicators - updated for new control system
    { ...SHORTCUT_KEYS.TOGGLE_SMA, category: 'Indicators', handler: () => {
      if (selectedOverlays.includes('sma_20')) {
        setSelectedOverlays(prev => prev.filter(o => o !== 'sma_20'))
      } else {
        setSelectedOverlays(prev => [...prev, 'sma_20'])
      }
    }},
    { ...SHORTCUT_KEYS.TOGGLE_EMA, category: 'Indicators', handler: () => {
      if (selectedOverlays.includes('ema_20')) {
        setSelectedOverlays(prev => prev.filter(o => o !== 'ema_20'))
      } else {
        setSelectedOverlays(prev => [...prev, 'ema_20'])
      }
    }},
    { ...SHORTCUT_KEYS.TOGGLE_BB, category: 'Indicators', handler: () => {
      if (selectedOverlays.includes('bb_bands')) {
        setSelectedOverlays(prev => prev.filter(o => o !== 'bb_bands'))
      } else {
        setSelectedOverlays(prev => [...prev, 'bb_bands'])
      }
    }},
    { ...SHORTCUT_KEYS.TOGGLE_RSI, category: 'Indicators', handler: () => {
      if (selectedIndicators.includes('rsi')) {
        setSelectedIndicators(prev => prev.filter(i => i !== 'rsi'))
      } else {
        setSelectedIndicators(prev => [...prev, 'rsi'])
      }
    }},
    { ...SHORTCUT_KEYS.TOGGLE_MACD, category: 'Indicators', handler: () => {
      if (selectedIndicators.includes('macd')) {
        setSelectedIndicators(prev => prev.filter(i => i !== 'macd'))
      } else {
        setSelectedIndicators(prev => [...prev, 'macd'])
      }
    }},

    // Settings
    { ...SHORTCUT_KEYS.OPEN_SETTINGS, category: 'Settings', handler: () => setShowSettings(true) },
    
    // Help
    { 
      ...SHORTCUT_KEYS.SHOW_SHORTCUTS, 
      category: 'Help',
      handler: () => setShowKeyboardHelp(true)
    },

    // Chart controls
    {
      ...SHORTCUT_KEYS.FIT_CONTENT,
      category: 'Chart',
      handler: () => {
        resetZoom()
        analyticsHook.track('keyboard_shortcut_used', { action: 'fit_content' })
      }
    },
    {
      ...SHORTCUT_KEYS.ZOOM_IN,
      category: 'Chart',
      handler: () => {
        zoomIn()
        analyticsHook.track('keyboard_shortcut_used', { action: 'zoom_in' })
      }
    },
    {
      ...SHORTCUT_KEYS.ZOOM_OUT,
      category: 'Chart',
      handler: () => {
        zoomOut()
        analyticsHook.track('keyboard_shortcut_used', { action: 'zoom_out' })
      }
    },
    {
      ...SHORTCUT_KEYS.RESET_ZOOM,
      category: 'Chart',
      handler: () => {
        resetZoom()
        analyticsHook.track('keyboard_shortcut_used', { action: 'reset_zoom' })
      }
    },

    // Quick actions
    {
      keys: ['Escape'],
      category: 'General',
      description: 'Close modals',
      handler: () => {
        setShowSettings(false)
        setShowAnalytics(false)
        setShowKeyboardHelp(false)
      }
    },
    {
      keys: ['Control', 'Shift', 'e'],
      category: 'Export',
      description: 'Quick CSV export',
      handler: () => {
        // Trigger CSV export
        const exportBtn = document.querySelector('[title*="Export all data as CSV"]') as HTMLButtonElement
        if (exportBtn && !exportBtn.disabled) {
          exportBtn.click()
          analyticsHook.track('keyboard_shortcut_used', { action: 'quick_export' })
        }
      }
    }
  ]

  // Enable keyboard shortcuts
  useKeyboardShortcuts(keyboardShortcuts)
  
  // Simple help modal placeholder
  const HelpModal = () => (
    showKeyboardHelp ? (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '80%',
          maxHeight: '80%',
          overflow: 'auto'
        }}>
          <h3>Keyboard Shortcuts</h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {keyboardShortcuts.map((shortcut, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                <span>{shortcut.description}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {shortcut.keys.join(' + ')}
                </span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowKeyboardHelp(false)}
            style={{ marginTop: '16px', padding: '8px 16px' }}
          >
            Close
          </button>
        </div>
      </div>
    ) : null
  )

  // Enhanced WebSocket URL with validation
  const wsUrl = useMemo(() => {
    // Only create WebSocket URL for valid symbols
    if (!isValidSymbol(symbol, market)) return ''
    
    const base = BACKEND.replace('http','ws')
    if (market === 'crypto') {
      const p = provider || 'auto'
      return `${base}/ws/crypto/ohlc?symbol=${encodeURIComponent(symbol)}&interval=${interval}&provider=${p}`
    }
    const p = provider || 'auto'
    return `${base}/ws/stocks/ohlc?symbol=${encodeURIComponent(symbol)}&interval=${interval}&provider=${p}`
  }, [market, symbol, interval, provider])

  const { 
    data: live, 
    connectionStatus, 
    reconnect, 
    disconnect, 
    error: wsError, 
    reconnectAttempts, 
    lastConnected, 
    isReconnecting 
  } = useWebSocketOHLC(wsUrl)

  // Chart initialization is now handled by DXChartFull component

  // Enhanced history loading with validation and rate limiting
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | number

    async function loadHistory() {
      // Clear any existing timeout
      if (timeoutId) clearTimeout(timeoutId)
      
      // Validate symbol before making API calls
      if (!isValidSymbol(symbol, market)) {
        setHistory([])
        return
      }
      
      // Additional debouncing for API calls
      timeoutId = setTimeout(async () => {
        // Check intelligent cache first - DISABLED FOR DEBUGGING
        const days = presetToDays(historyPreset)
        const cached = null // Force cache miss to get fresh data
        console.log(`🔄 FORCING API CALL for ${symbol} - cache disabled for debugging`)
        
        // Fetch from API
        setIsLoadingHistory(true)
        try {
          console.log(`🌐 API call: History for ${symbol}`)
          const startTime = performance.now()
          const j = await getHistory({ symbol, market, interval, days, provider })
          const duration = performance.now() - startTime
          
          const arr = normalizeCandles(j?.ohlc || [])
          
          // Debug: Log API response details and sample raw data
          console.log(`🔍 API Response for ${symbol}: ${arr.length} normalized candles`)
          if (j?.ohlc?.[0]) {
            console.log('📊 Sample RAW candle:', j.ohlc[0])
          }
          if (arr[0]) {
            console.log('📊 First NORMALIZED candle:', {
              time: arr[0].time,
              date: new Date((arr[0].time as number) * 1000).toLocaleString(),
              open: arr[0].open,
              high: arr[0].high,
              low: arr[0].low,
              close: arr[0].close,
              range: (arr[0].high - arr[0].low).toFixed(4)
            })
          }
          if (arr.length > 1) {
            const last = arr[arr.length - 1]
            if (last) {
              console.log('📊 Last NORMALIZED candle:', {
                time: last.time,
                date: new Date((last.time as number) * 1000).toLocaleString(),
                open: last.open,
                high: last.high,
                low: last.low,
                close: last.close,
                range: (last.high - last.low).toFixed(4)
              })
            }
          }
          
          // Track API call
          loggerHook.logApiCall('GET', `history/${symbol}`, duration, 200, true, arr.length)
          analyticsHook.trackApiCall(`history/${symbol}`, duration, true)
          
          if (arr.length > 0) {
            setHistory(arr)
            // Cache with intelligent expiration
            tradingCache.setHistory(symbol, market, interval, days, arr)
            console.log(`💾 Cached history for ${symbol} (${arr.length} points)`)
          } else {
            setHistory([])
          }
          
          // Clear any previous errors on successful load
          errorHandler.clearError()
        } catch (error) {
          console.warn('Failed to load history:', error)
          loggerHook.logApiError(`history/${symbol}`, 'GET', error as Error)
          analyticsHook.trackApiCall(`history/${symbol}`, undefined, false)
          analyticsHook.trackError(error as Error, { context: 'history_loading', symbol, market })
          errorHandler.handleError(error as Error, `Loading history for ${symbol}`)
          setHistory([])
        } finally {
          setIsLoadingHistory(false)
        }
      }, 1000) // Extra 1 second delay for API calls
    }

    loadHistory()
    
    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [symbol, market, interval, provider, historyPreset]) // Removed cache functions from deps

  // Merge history + live
  const merged = useMemo(() => {
    const h = normalizeCandles(history)
    const l = normalizeCandles(live)
    
    const map = new Map<number, CandlestickData>()
    for (const c of h) map.set(c.time as number, c)
    for (const c of l) map.set(c.time as number, c)
    
    const result = Array.from(map.values()).sort((a,b)=> (a.time as number) - (b.time as number))
    
    // Only log significant changes to reduce spam
    if (result.length > 0) {
      console.log('📊 Chart data updated:', result.length, 'candles')
    }
    
    return result
  }, [history, live])

  // Convert indicators to chart format - dynamically based on selections
  const chartIndicators = useMemo((): IndicatorData => {
    const result: IndicatorData = {
      sma: [],
      ema: [],
      rsi: [],
      macd_hist: [],
      macd_signal: [],
      bb_high: [],
      bb_low: [],
      atr: []
    }

    // Only include overlays that are selected
    if (selectedOverlays.includes('sma_20') || selectedOverlays.includes('sma_50')) {
      result.sma = indicators?.sma || []
    }
    if (selectedOverlays.includes('ema_20') || selectedOverlays.includes('ema_50')) {
      result.ema = indicators?.ema || []
    }
    if (selectedOverlays.includes('bb_bands')) {
      result.bb_high = indicators?.bb_high || []
      result.bb_low = indicators?.bb_low || []
    }
    if (selectedOverlays.includes('atr_bands')) {
      result.atr = indicators?.atr || []
    }

    // Only include indicators that are selected
    if (selectedIndicators.includes('rsi')) {
      result.rsi = indicators?.rsi || []
    }
    if (selectedIndicators.includes('macd')) {
      result.macd_hist = indicators?.macd_hist || []
      result.macd_signal = indicators?.macd_signal || []
    }

    return result
  }, [indicators, selectedOverlays, selectedIndicators])

  // Convert signals to chart format
  const chartSignals = useMemo((): TradingSignal[] => {
    if (!signals || !Array.isArray(signals)) return []
    
    return signals
      .filter((signal: any) => signal && typeof signal === 'object')
      .map((signal: any): TradingSignal => ({
        ts: typeof signal.ts === 'number' ? signal.ts : 0,
        type: (signal.type === 'buy' || signal.type === 'sell') ? signal.type : 'buy',
        reason: signal.reason || '',
        price: typeof signal.price === 'number' ? signal.price : 0,
        tag: signal.tag
      }))
      .filter(signal => signal.ts > 0 && signal.price > 0)
  }, [signals])

  // Debug: Expose chart data to window object
  useEffect(() => {
    // @ts-ignore
    window.merged = merged
    // @ts-ignore - Use a different property name to avoid conflict with read-only window.history
    ;(window as any).chartHistory = history
    // @ts-ignore
    window.live = live
    // @ts-ignore
    window.wsUrl = wsUrl
    // @ts-ignore
    window.connectionStatus = connectionStatus
    // @ts-ignore
    window.lastConnected = lastConnected
    // @ts-ignore
    window.reconnectAttempts = reconnectAttempts

    if (merged.length > 0) {
      const first = merged[0]
      const last = merged[merged.length - 1]
      console.log('📊 CHART DATA UPDATE:', {
        mergedLength: merged.length,
        historyLength: history.length,
        liveLength: live.length,
        firstCandle: {
          time: first?.time,
          date: new Date((first?.time as number) * 1000).toLocaleString(),
          close: first?.close
        },
        lastCandle: {
          time: last?.time,
          date: new Date((last?.time as number) * 1000).toLocaleString(),
          close: last?.close
        },
        wsUrl,
        connectionStatus
      })
    }
  }, [merged, history, live, wsUrl, connectionStatus, lastConnected, reconnectAttempts])

  // Chart rendering is now handled by DXChartFull component

  // Enhanced indicators loading with validation
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | number

    async function loadIndicators() {
      // Clear any existing timeout
      if (timeoutId) clearTimeout(timeoutId)
      
      if (!merged?.length || merged.length < minCandles || !isValidSymbol(symbol, market)) {
        setIndicators({})
        setSignals([])
        return
      }
      
      // Additional debouncing for API calls
      timeoutId = setTimeout(async () => {
        // Check intelligent cache first
        const limit = 1000
        const cachedData = tradingCache.getIndicators(symbol, market, interval, limit)
        if (cachedData) {
          console.log(`📦 Cache HIT: Indicators for ${symbol}`)
          setIndicators(cachedData.indicators || {})
          setSignals(cachedData.signals || [])
          return
        }
        
        setIsLoadingIndicators(true)
        try {
          console.log(`🌐 API call: Indicators for ${symbol}`)
          const res = await getIndicators({ symbol, interval, limit, market, provider })
          const indicators = res.indicators || {}
          const signals = res.signals || []
          
          setIndicators(indicators)
          setSignals(signals)
          
          // Cache with intelligent expiration
          tradingCache.setIndicators(symbol, market, interval, limit, {
            indicators,
            signals
          })
          console.log(`💾 Cached indicators for ${symbol} (${Object.keys(indicators).length} indicators, ${signals.length} signals)`)
          
          // Clear any previous errors on successful load
          errorHandler.clearError()
          
          // REMOVED: Do not apply spacing after indicators load - this interferes with main chart
        } catch (error) {
          console.warn('Failed to load indicators:', error)
          errorHandler.handleError(error as Error, `Loading indicators for ${symbol}`)
          setIndicators({})
          setSignals([])
        } finally {
          setIsLoadingIndicators(false)
        }
      }, 1200) // Stagger this after history loading
    }

    loadIndicators()
    
    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [merged, symbol, interval, market, provider, minCandles]) // Removed cache functions from deps

  // All chart rendering (overlays, indicators, markers) is now handled by DXChartFull component

  // Enhanced predictions and news with intelligent caching
  const refreshPreds = useCallback(async () => {
    if (!isValidSymbol(symbol, market)) return
    
    // Check cache first
    const cached = tradingCache.getPredictions(symbol, market, interval)
    if (cached) {
      console.log(`📦 Cache HIT: Predictions for ${symbol}`)
      setPreds(cached)
      return
    }
    
    setIsLoadingPredictions(true)
    try {
      console.log(`🌐 API call: Predictions for ${symbol}`)
      const res = await getPredictions({ symbol, market, interval, horizons: ['5m','1h','1d'], lookback: 500, provider })
      const predictions = res.predictions || {}
      setPreds(predictions)
      tradingCache.setPredictions(symbol, market, interval, predictions)
      console.log(`💾 Cached predictions for ${symbol}`)
    } catch (error) {
      console.warn('Failed to refresh predictions:', error)
      setPreds({})
    } finally {
      setIsLoadingPredictions(false)
    }
  }, [symbol, market, interval, provider])
  
  const refreshNews = useCallback(async () => {
    if (!isValidSymbol(symbol, market)) return
    
    // Check cache first
    const cached = tradingCache.getNews(symbol, market)
    if (cached) {
      console.log(`📦 Cache HIT: News for ${symbol}`)
      setNews(cached)
      return
    }
    
    setIsLoadingNews(true)
    try {
      console.log(`🌐 API call: News for ${symbol}`)
      const r = await getNews(symbol, market)
      const news = r.news || []
      setNews(news)
      tradingCache.setNews(symbol, market, news)
      console.log(`💾 Cached news for ${symbol} (${news.length} items)`)
    } catch (error) {
      console.warn('Failed to refresh news:', error)
      setNews([])
    } finally {
      setIsLoadingNews(false)
    }
  }, [symbol, market])
  
  useEffect(() => { 
    refreshPreds();
    refreshNews(); 
  }, [refreshPreds, refreshNews])

  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#00c853'
      case 'connecting': return '#ff9800'
      case 'reconnecting': return '#ff6d00'
      case 'error': return '#ff5252'
      case 'failed': return '#d32f2f'
      default: return '#757575'
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return `Connected${lastConnected ? ` (${lastConnected.toLocaleTimeString()})` : ''}`
      case 'connecting': return 'Connecting...'
      case 'reconnecting': return `Reconnecting... (${reconnectAttempts}/${15})`
      case 'error': return wsError ? `Error: ${wsError.message}` : 'Connection Error'
      case 'failed': return 'Connection Failed'
      default: return 'Disconnected'
    }
  }

  // Test Mode - render test component instead of main app
  if (testMode) {
    const isAlphaTest = testMode === 'alpha'
    const isRealTimeTest = testMode === 'realtime'
    const isTradingViewTest = testMode === 'tradingview'
    const testTitle = isAlphaTest ? 'ALPHA VANTAGE' : isRealTimeTest ? 'REAL-TIME TRADING' : isTradingViewTest ? 'TRADINGVIEW' : 'LIGHTWEIGHT CHARTS'
    console.log(`🚀 ${testTitle} TEST MODE RENDERING!`)
    
    return (
      <ErrorBoundary>
        {isAlphaTest ? (
          <AlphaVantageChartTest initialSymbol="AAPL" />
        ) : isRealTimeTest ? (
          <RealTimeTrading initialSymbol="AAPL" />
        ) : isTradingViewTest ? (
          <TradingViewChart symbol="AAPL" height={600} />
        ) : (
          <LightweightChart 
            data={merged}
            symbol={symbol}
            height={600}
            indicators={chartIndicators}
            signals={chartSignals}
          />
        )}
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          zIndex: 1000 
        }}>
          <button
            onClick={() => {
              window.history.replaceState({}, '', window.location.pathname)
              setTestMode(false)
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ← Back to Main App
          </button>
        </div>
      </ErrorBoundary>
    )
  }

  console.log('🚀 MAIN.TSX LOADED - USING REGULAR LIGHTWEIGHT-CHARTS VERSION')

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <OptimizedLayout
        leftColumn={
          <>
            {/* Advanced Technical Indicators */}
            <div style={{ position: 'relative' }}>
              {isLoadingIndicators && Object.keys(indicators).length === 0 && (
                <DataPanelSkeleton rows={6} />
              )}
              <div style={{
                opacity: isLoadingIndicators && Object.keys(indicators).length === 0 ? 0 : 1,
                transition: 'opacity 0.3s ease'
              }}>
                <Suspense fallback={<DataPanelSkeleton rows={5} />}>
                  <AdvancedIndicators 
                    indicators={indicators} 
                    symbol={symbol} 
                  />
                </Suspense>
              </div>
            </div>
            
            {/* Signals list */}
            <div className="panel">
              <h3>🎯 Trading Signals {isLoadingIndicators && <InlineLoader text="Loading signals..." />}</h3>
              {isLoadingIndicators && signals.length === 0 ? (
                <SignalsSkeleton count={5} />
              ) : (
                <ul className="signals-list">
                  {signals.map((s, i) => (
                    <li key={i} className="signal-item">
                      <span className="signal-time">{new Date(Number(s.ts)*1000).toLocaleTimeString()}</span>
                      <span className={`signal-type ${s.type}`}>{s.type?.toUpperCase?.()}</span>
                      <span className="signal-price">${s.price}</span>
                      <span className="signal-reason">{s.reason} {s.tag ? `[${s.tag}]` : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        }
        chartArea={
          <>
            {/* Enhanced Top Controls */}
            <div className="panel controls-row" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <select value={market} onChange={e => { setMarket(e.target.value as Market); setProvider('auto'); }}>
                  <option value="crypto">Crypto</option>
                  <option value="stocks">Stocks</option>
                </select>
                
                {/* Enhanced symbol input */}
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    value={symbolInput} 
                    onChange={e => handleSymbolChange(e.target.value.toUpperCase())} 
                    placeholder={market==='crypto' ? 'e.g., ETH/USD' : 'e.g., AAPL'} 
                    style={{ 
                      width: 160,
                      borderColor: symbolInput && !isValidSymbol(symbolInput, market) ? '#ff5252' : '#555',
                      backgroundColor: '#2a2a2a',
                      color: 'white',
                      border: '1px solid #555',
                      borderRadius: '6px',
                      padding: '8px 12px'
                    }}
                  />
                  {symbolInput && !isValidSymbol(symbolInput, market) && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      fontSize: '12px',
                      color: '#ff5252',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #ff5252',
                      borderRadius: '3px',
                      padding: '4px 8px',
                      zIndex: 1000,
                      whiteSpace: 'nowrap'
                    }}>
                      {market === 'crypto' ? 'Format: SYMBOL/USD (e.g., ETH/USD)' : 'Invalid stock symbol'}
                    </div>
                  )}
                </div>
                
                {/* Connection status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: getConnectionStatusColor(),
                    animation: isReconnecting ? 'connPulse 1s infinite' : 'none'
                  }} title={getConnectionStatusText()} />
                  
                  {(connectionStatus === 'error' || connectionStatus === 'failed') && (
                    <button
                      onClick={reconnect}
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      title="Manually reconnect WebSocket"
                    >
                      🔄 Reconnect
                    </button>
                  )}
                  
                  {isReconnecting && (
                    <span style={{ fontSize: '12px', color: '#aaa' }}>
                      {reconnectAttempts}/15
                    </span>
                  )}
                </div>
                
                <select value={interval} onChange={e => setIntervalV(parseInt(e.target.value))} style={{ minWidth: 80 }}>
                  <optgroup label="Scalping">
                    <option value={1}>1m</option>
                    <option value={3}>3m</option>
                    <option value={5}>5m</option>
                  </optgroup>
                  <optgroup label="Intraday">
                    <option value={15}>15m</option>
                    <option value={30}>30m</option>
                    <option value={60}>1h</option>
                    <option value={240}>4h</option>
                  </optgroup>
                  <optgroup label="Swing">
                    <option value={480}>8h</option>
                    <option value={1440}>1d</option>
                    <option value={2880}>2d</option>
                  </optgroup>
                  <optgroup label="Position">
                    <option value={10080}>1w</option>
                    <option value={43200}>1M</option>
                  </optgroup>
                </select>
                
                <select value={historyPreset} onChange={e => setHistoryPreset(e.target.value as HistoryPreset)}>
                  <option value="1D">1D</option>
                  <option value="1W">1W</option>
                  <option value="1M">1M</option>
                  <option value="3M">3M</option>
                </select>
                
                <select 
                  value={chartSettings.chartType} 
                  onChange={e => setChartSettings(prev => ({ ...prev, chartType: e.target.value as any }))}
                  title="Chart Type"
                  style={{ width: 110 }}
                >
                  <option value="candlestick">🕯️ Candles</option>
                  <option value="line">📈 Line</option>
                  <option value="area">📊 Area</option>
                  <option value="bars">📉 Bars</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                <button onClick={refreshPreds} className="action-btn">🔮 Predict</button>
                <button onClick={refreshNews} className="action-btn">📰 News</button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="action-btn primary"
                  title="Open Settings (Ctrl + ,)"
                >
                  ⚙️ Settings
                </button>
                <span className="small muted">Cache: {cacheSize}</span>
                <button 
                  onClick={() => location.reload()}
                  className="icon-btn"
                  title="Clear cache"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Professional Chart Controls */}
            <ChartControls
              selectedOverlays={selectedOverlays}
              selectedIndicators={selectedIndicators}
              selectedSignals={selectedSignals}
              scalePriceOnly={scalePriceOnly}
              onOverlaysChange={(overlays) => {
                setSelectedOverlays(overlays)
                overlays.forEach(overlay => {
                  analyticsHook.trackIndicatorToggle(overlay.replace('_', ''), true)
                })
              }}
              onIndicatorsChange={(indicators) => {
                setSelectedIndicators(indicators)
                indicators.forEach(indicator => {
                  analyticsHook.trackIndicatorToggle(indicator, true)
                })
              }}
              onSignalsChange={setSelectedSignals}
              onScalePriceOnlyChange={setScalePriceOnly}
              onStrategyBuilderOpen={() => setShowStrategyBuilder(true)}
              onBacktestOpen={() => setShowBacktestResults(true)}
              onPortfolioOpen={() => setShowPortfolioManager(true)}
            />
            
            {/* ATR Bands Settings */}
            {selectedOverlays.includes('atr_bands') && (
              <div className="panel" style={{ marginBottom: 16 }}>
                <h4>ATR Bands Settings</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>Multiplier:</span>
                  <input 
                    type="number" 
                    value={atrMult} 
                    step={0.1} 
                    min={0.1} 
                    max={10} 
                    onChange={e=>setAtrMult(parseFloat(e.target.value || '1.0'))} 
                    style={{ width: 70 }} 
                  />
                </div>
              </div>
            )}

            {/* Main Chart */}
            <div style={{ position: 'relative', minHeight: '600px', marginBottom: '16px' }}>
              {isLoadingHistory && merged.length === 0 && (
                <ChartSkeleton />
              )}
              <LightweightChart
                data={merged}
                symbol={symbol}
                height={600}
                indicators={chartIndicators}
                signals={chartSignals}
                scalePriceOnly={scalePriceOnly}
              />
            </div>
            
            {/* Bottom Section - All Panels */}
            <div style={{ marginTop: '24px' }}>
              <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '16px', borderBottom: '2px solid #333', paddingBottom: '8px' }}>
                📊 Trading Tools & Analytics
              </h2>
              <div className="bottom-grid">
              {/* Predictions */}
              <div className="panel">
                <h3>🔮 AI Predictions {isLoadingPredictions && <InlineLoader text="Analyzing..." />}</h3>
                {isLoadingPredictions && Object.keys(preds).length === 0 ? (
                  <DataPanelSkeleton rows={3} />
                ) : (
                  <ul className="compact-list">
                    {Object.entries(preds).map(([k, v]: any) => 
                      <li key={k}>
                        <span className="label">{k}</span>
                        <span className="value">${v?.predicted_close?.toFixed?.(2)}</span>
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Chart Customization */}
              <ChartCustomization
                onSettingsChange={setChartSettings}
                initialSettings={chartSettings}
              />

              {/* News Feed */}
              <NewsFeed symbol={symbol} market={market} news={news} />

              {/* Watchlist */}
              <WatchlistPanel
                selectedSymbol={symbol}
                onSymbolSelect={handleWatchlistSymbolSelect}
              />

              {/* Portfolio */}
              <Portfolio
                currentSymbol={symbol}
                currentMarket={market}
                currentPrice={merged.length > 0 ? merged[merged.length - 1]?.close : undefined}
              />

              {/* Timeframe Panel */}
              <Suspense fallback={<DataPanelSkeleton rows={4} />}>
                <TimeframePanel
                  currentInterval={interval}
                  symbol={symbol}
                  market={market}
                  onIntervalChange={setIntervalV}
                />
              </Suspense>

              {/* Alerts Panel */}
              <Suspense fallback={<DataPanelSkeleton rows={4} />}>
                <AlertsPanel
                  currentSymbol={symbol}
                  currentMarket={market}
                  currentPrice={merged.length > 0 ? merged[merged.length - 1]?.close : undefined}
                  indicators={indicators}
                />
              </Suspense>

              {/* AI Assistant */}
              <Suspense fallback={<DataPanelSkeleton rows={4} />}>
                <AiAssistantPanel
                  symbol={symbol}
                  market={market}
                  interval={interval}
                  provider={provider}
                  indicators={indicators}
                  signals={signals}
                  news={news}
                />
              </Suspense>

              {/* Market Scanner */}
              <Suspense fallback={<DataPanelSkeleton rows={3} />}>
                <MarketScanner />
              </Suspense>

              {/* Data Export Panel */}
              <Suspense fallback={<DataPanelSkeleton rows={3} />}>
                <DataExportPanel
                  symbol={symbol}
                  market={market}
                  timeframe={`${interval}m`}
                  data={merged}
                  indicators={indicators}
                  signals={signals}
                  news={news}
                  chartContainer={dxChartRef.current || undefined}
                />
              </Suspense>
              </div>
            </div>
          </>
        }
        rightColumn={
          <>
            {/* Key Technical Indicators */}
            <KeyIndicators 
              indicators={indicators} 
              symbol={symbol}
            />
          </>
        }
      />
      
      {/* Error notification - responsive */}
      {errorHandler.isError && (
        <div style={{
          position: 'fixed',
          top: window.innerWidth <= 767 ? 5 : 10,
          right: window.innerWidth <= 767 ? 5 : 10,
          left: window.innerWidth <= 767 ? 5 : 'auto',
          backgroundColor: '#ff5252',
          color: 'white',
          padding: window.innerWidth <= 767 ? '10px 12px' : '12px 16px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          maxWidth: window.innerWidth <= 767 ? 'calc(100vw - 10px)' : '400px',
          fontSize: window.innerWidth <= 767 ? '14px' : '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>Connection Error</div>
              <div style={{ fontSize: '0.9em', opacity: 0.9 }}>
                {errorHandler.error?.message || 'Unknown error occurred'}
              </div>
            </div>
            <button
              onClick={errorHandler.clearError}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: window.innerWidth <= 767 ? '6px 10px' : '4px 8px',
                borderRadius: '2px',
                cursor: 'pointer',
                minHeight: window.innerWidth <= 767 ? '32px' : 'auto'
              }}
            >
              ✕
            </button>
          </div>
          {errorHandler.retryCount > 0 && (
            <div style={{ marginTop: '8px', fontSize: '0.8em' }}>
              Retry attempts: {errorHandler.retryCount}
            </div>
          )}
        </div>
      )}
    
    {/* Settings Modal */}
    <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    
    {/* Analytics Dashboard */}
    <AnalyticsDashboard isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
    
    {/* Strategy Builder Modal */}
    <StrategyBuilder 
      isOpen={showStrategyBuilder} 
      onClose={() => setShowStrategyBuilder(false)}
      onStrategyCreate={(strategy) => {
        console.log('Strategy created:', strategy)
        // You can add additional handling here
      }}
      onBacktestRun={(strategyId) => {
        console.log('Running backtest for strategy:', strategyId)
        // Simulate backtest results
        setBacktestData({
          strategyId,
          initialCapital: 10000,
          commission: 0.001,
          metrics: {
            totalTrades: 45,
            winningTrades: 28,
            losingTrades: 17,
            winRate: 62.22,
            totalReturn: 24.50,
            annualizedReturn: 18.75,
            maxDrawdown: 8.34,
            sharpeRatio: 1.45,
            profitFactor: 1.85
          }
        })
        setShowBacktestResults(true)
        setShowStrategyBuilder(false)
      }}
    />
    
    {/* Backtest Results Modal */}
    <BacktestResults 
      isOpen={showBacktestResults} 
      onClose={() => setShowBacktestResults(false)}
      backtestData={backtestData}
      onRunBacktest={(strategyId, options) => {
        console.log('Running new backtest:', strategyId, options)
        // Handle new backtest run
      }}
    />
    
    {/* Portfolio Manager Modal */}
    {showPortfolioManager && (
      <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="text-white">Loading Portfolio Manager...</div></div>}>
        <PortfolioManager 
          isOpen={showPortfolioManager} 
          onClose={() => setShowPortfolioManager(false)}
        />
      </Suspense>
    )}
    
        {/* Keyboard Shortcuts Help */}
        <HelpModal />
      </ErrorBoundary>
    </ThemeProvider>
  )
}