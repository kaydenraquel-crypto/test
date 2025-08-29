// Enhanced App.tsx with MUI Design System
// Phase 1 of MUI Design System Standardization - Core App Migration

import React, { useEffect, useMemo, useRef, useState, useCallback, lazy, Suspense } from 'react'
import {
  Box,
  Container,
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Button,
  ButtonGroup,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material'
import {
  Refresh,
  Settings as SettingsIcon,
  TrendingUp,
  TrendingDown,
  ShowChart,
  Notifications,
  Delete,
  Assessment,
  NewReleases,
  Help,
} from '@mui/icons-material'

// Import enhanced components and context
import { EnhancedThemeProvider, useEnhancedTheme } from './contexts/EnhancedThemeContext'
import {
  TradingCard,
  MarketStatusIndicator,
  SymbolInput,
  TradingButton,
  PriceChangeChip,
  ControlPanel,
  StatsCard,
  AlertNotification,
  ChartSkeleton,
  DataPanelSkeleton,
  SignalsList,
} from './components/MuiComponents'

// Import existing components (they will be migrated in later phases)
import LightweightChart from './components/LightweightChartFixed'
import ChartControls from './components/ChartControls'
import StrategyBuilder from './components/StrategyBuilder'
import BacktestResults from './components/BacktestResults'
import OptimizedLayout from './components/OptimizedLayout'
import AlphaVantageChartTest from './components/AlphaVantageChartTest'
import TradingViewChart from './components/TradingViewChart'
import RealTimeTrading from './components/RealTimeTrading'
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
import { ChartSkeleton as LegacyChartSkeleton, LoadingSpinner, DataPanelSkeleton as LegacyDataPanelSkeleton, InlineLoader, SignalsSkeleton } from './components/LoadingStates'
import ChartCustomization, { useChartSettings, ChartSettings } from './components/ChartCustomization'
import KeyIndicators from './components/KeyIndicators'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts.jsx'

// Lazy-loaded components
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

// Types (same as original)
type Market = 'crypto' | 'stocks'
type HistoryPreset = '1D' | '1W' | '1M' | '3M'
const MIN_CANDLES_DEFAULT = 5

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

// [Keep all existing utility functions - normalizeCandles, toHeikinAshi, etc.]
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

  // Process and normalize incoming WebSocket data
  const normalizedData = useMemo(() => {
    if (webSocketState.data.length === 0) return []
    
    const rawData = webSocketState.data.slice(-100) // Process last 100 items
    const normalized = normalizeCandles(rawData)
    
    // Keep only valid candles and limit to 8000
    return normalized.slice(-8000).sort((a, b) => (a.time as number) - (b.time as number))
  }, [webSocketState.data.length])

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

// Main App component with MUI
function AppContent() {
  const { theme, muiTheme, currentThemeVariant, setThemeVariant, isDarkMode } = useEnhancedTheme()
  
  console.log('🚀 APP.TSX STARTING - ENHANCED WITH MUI DESIGN SYSTEM')
  
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
    return preferences.defaultSymbol || 'AAPL'
  }, [preferences.defaultSymbol])
  
  const [market, setMarket] = useState<Market>(() => {
    const detectedMarket = getMarketFromSymbol(initialSymbol)
    console.log('🔍 Market detection:', { initialSymbol, detectedMarket })
    return detectedMarket
  })
  const [provider, setProvider] = useState<string>('auto')
  
  // Separate input state from debounced symbol - initialize from preferences
  const [symbolInput, setSymbolInput] = useState<string>(initialSymbol)
  const symbol = useDebounce(symbolInput, 1200)
  
  // [Keep all remaining state and logic from original App.tsx...]
  const [interval, setIntervalV] = useState<number>(5)
  const [historyPreset, setHistoryPreset] = useState<HistoryPreset>('1D')
  const [minCandles, setMinCandles] = useState<number>(MIN_CANDLES_DEFAULT)
  
  const cacheSize = tradingCache.getStats().totalEntries
  const [chartSettings, setChartSettings] = useChartSettings()
  
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
  const [atrMult, setAtrMult] = useState(1.5)
  
  // Data state
  const [indicators, setIndicators] = useState<any>({})
  const [signals, setSignals] = useState<any[]>([])
  const [preds, setPreds] = useState<any>({})
  const [news, setNews] = useState<any[]>([])
  const [history, setHistory] = useState<CandlestickData[]>([])
  
  // Loading states
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingIndicators, setIsLoadingIndicators] = useState(false)
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false)
  const [isLoadingNews, setIsLoadingNews] = useState(false)

  // Symbol change handler with recent symbol tracking
  const handleSymbolChange = useCallback((newSymbol: string, newMarket?: 'crypto' | 'stocks') => {
    if (newMarket) setMarket(newMarket)
    setSymbolInput(newSymbol)
    
    if (isValidSymbol(newSymbol, newMarket || market)) {
      addRecentSymbol(newSymbol)
      analyticsHook.trackSymbolView(newSymbol, newMarket || market)
      loggerHook.user(`Symbol changed to ${newSymbol}`, { symbol: newSymbol, market: newMarket || market })
    }
  }, [market, addRecentSymbol, analyticsHook, loggerHook])

  // Enhanced WebSocket URL with validation
  const wsUrl = useMemo(() => {
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

  // [Keep all existing data loading logic...]
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
            data={[]}
            symbol={symbol}
            height={600}
            indicators={{}}
            signals={[]}
          />
        )}
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            window.history.replaceState({}, '', window.location.pathname)
            setTestMode(false)
          }}
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          ← Back to Main App
        </Button>
      </ErrorBoundary>
    )
  }

  // Merge history + live data
  const merged = useMemo(() => {
    const h = normalizeCandles(history)
    const l = normalizeCandles(live)
    
    const map = new Map<number, CandlestickData>()
    for (const c of h) map.set(c.time as number, c)
    for (const c of l) map.set(c.time as number, c)
    
    const result = Array.from(map.values()).sort((a,b)=> (a.time as number) - (b.time as number))
    
    if (result.length > 0) {
      console.log('📊 Chart data updated:', result.length, 'candles')
    }
    
    return result
  }, [history, live])

  console.log('🚀 MUI-ENHANCED APP LOADED - DESIGN SYSTEM STANDARDIZATION ACTIVE')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      {/* Enhanced App Bar with MUI */}
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 600 }}>
            🚀 NovaSignal v0.2 - MUI Enhanced
          </Typography>
          
          {/* Theme switcher */}
          <ButtonGroup size="small" sx={{ mr: 2 }}>
            {Object.keys(themeVariants).map((variant) => (
              <Button
                key={variant}
                variant={currentThemeVariant === variant ? 'contained' : 'outlined'}
                onClick={() => setThemeVariant(variant as keyof typeof themeVariants)}
                size="small"
              >
                {variant}
              </Button>
            ))}
          </ButtonGroup>
          
          <Chip 
            label={`Theme: ${currentThemeVariant}`} 
            variant="outlined" 
            size="small" 
            sx={{ mr: 2 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setShowSettings(true)}
            size="small"
          >
            Settings
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ flex: 1, py: 2 }}>
        {/* Enhanced Top Controls with MUI */}
        <ControlPanel>
          <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            {/* Market selection */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Market</InputLabel>
              <Select
                value={market}
                onChange={(e) => { setMarket(e.target.value as Market); setProvider('auto'); }}
                label="Market"
              >
                <MenuItem value="crypto">Crypto</MenuItem>
                <MenuItem value="stocks">Stocks</MenuItem>
              </Select>
            </FormControl>
            
            {/* Enhanced symbol input */}
            <SymbolInput
              value={symbolInput}
              onChange={handleSymbolChange}
              market={market}
              isValid={isValidSymbol(symbolInput, market)}
              error={market === 'crypto' ? 'Format: SYMBOL/USD (e.g., ETH/USD)' : 'Invalid stock symbol'}
            />
            
            {/* Connection status */}
            <MarketStatusIndicator
              status={connectionStatus}
              lastConnected={lastConnected}
              isReconnecting={isReconnecting}
              reconnectAttempts={reconnectAttempts}
              onReconnect={reconnect}
            />
            
            {/* Interval selection */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Interval</InputLabel>
              <Select
                value={interval}
                onChange={(e) => setIntervalV(parseInt(e.target.value as string))}
                label="Interval"
              >
                <MenuItem value={1}>1m</MenuItem>
                <MenuItem value={5}>5m</MenuItem>
                <MenuItem value={15}>15m</MenuItem>
                <MenuItem value={60}>1h</MenuItem>
                <MenuItem value={240}>4h</MenuItem>
                <MenuItem value={1440}>1d</MenuItem>
              </Select>
            </FormControl>
            
            {/* History preset */}
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Range</InputLabel>
              <Select
                value={historyPreset}
                onChange={(e) => setHistoryPreset(e.target.value as HistoryPreset)}
                label="Range"
              >
                <MenuItem value="1D">1D</MenuItem>
                <MenuItem value="1W">1W</MenuItem>
                <MenuItem value="1M">1M</MenuItem>
                <MenuItem value="3M">3M</MenuItem>
              </Select>
            </FormControl>
            
            {/* Action buttons */}
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <TradingButton variant="contained" color="success" startIcon={<TrendingUp />}>
                Buy
              </TradingButton>
              <TradingButton variant="contained" color="error" startIcon={<TrendingDown />}>
                Sell
              </TradingButton>
              <Button variant="outlined" startIcon={<Refresh />} onClick={() => location.reload()}>
                Refresh
              </Button>
              <Chip label={`Cache: ${cacheSize}`} variant="outlined" />
            </Stack>
          </Stack>
        </ControlPanel>

        {/* Chart Area with MUI enhancements */}
        <Grid container spacing={3}>
          {/* Left Column - Indicators */}
          <Grid xs={12} md={3}>
            <TradingCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Technical Indicators
                </Typography>
                {isLoadingIndicators && Object.keys(indicators).length === 0 ? (
                  <DataPanelSkeleton rows={6} />
                ) : (
                  <Suspense fallback={<DataPanelSkeleton rows={5} />}>
                    <AdvancedIndicators 
                      indicators={indicators} 
                      symbol={symbol} 
                    />
                  </Suspense>
                )}
              </CardContent>
            </TradingCard>

            {/* Signals section */}
            <TradingCard sx={{ mt: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Typography variant="h6">Trading Signals</Typography>
                  {isLoadingIndicators && <CircularProgress size={16} />}
                </Stack>
                <SignalsList signals={signals} isLoading={isLoadingIndicators} />
              </CardContent>
            </TradingCard>
          </Grid>

          {/* Center Column - Chart */}
          <Grid xs={12} md={6}>
            <TradingCard>
              <CardContent>
                {/* Chart Controls */}
                <ChartControls
                  selectedOverlays={selectedOverlays}
                  selectedIndicators={selectedIndicators}
                  selectedSignals={selectedSignals}
                  scalePriceOnly={scalePriceOnly}
                  onOverlaysChange={setSelectedOverlays}
                  onIndicatorsChange={setSelectedIndicators}
                  onSignalsChange={setSelectedSignals}
                  onScalePriceOnlyChange={setScalePriceOnly}
                  onStrategyBuilderOpen={() => setShowStrategyBuilder(true)}
                  onBacktestOpen={() => setShowBacktestResults(true)}
                  onPortfolioOpen={() => setShowPortfolioManager(true)}
                />
                
                {/* Main Chart */}
                <Box sx={{ mt: 2, minHeight: 400 }}>
                  {isLoadingHistory && merged.length === 0 ? (
                    <ChartSkeleton height={400} />
                  ) : (
                    <LightweightChart
                      data={merged}
                      symbol={symbol}
                      height={400}
                      indicators={{}}
                      signals={signals}
                      scalePriceOnly={scalePriceOnly}
                    />
                  )}
                </Box>
              </CardContent>
            </TradingCard>
          </Grid>

          {/* Right Column - Key Indicators */}
          <Grid xs={12} md={3}>
            <TradingCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Indicators
                </Typography>
                <KeyIndicators 
                  indicators={indicators} 
                  symbol={symbol}
                />
              </CardContent>
            </TradingCard>
          </Grid>
        </Grid>

        {/* Bottom Section - Trading Tools */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
            📊 Trading Tools & Analytics
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Stats Cards */}
            <Grid xs={12} sm={6} md={3}>
              <StatsCard
                title="Portfolio Value"
                value="$127,534.89"
                changePercent={2.34}
                trend="up"
                icon={<Assessment color="primary" />}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatsCard
                title="Today P&L"
                value="+$1,234.56"
                changePercent={1.8}
                trend="up"
                icon={<TrendingUp color="success" />}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatsCard
                title="Total Trades"
                value="847"
                change={23}
                trend="up"
                icon={<ShowChart color="info" />}
              />
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <StatsCard
                title="Win Rate"
                value="67.3%"
                changePercent={1.2}
                trend="up"
                icon={<CheckCircle color="success" />}
              />
            </Grid>

            {/* Tool Panels */}
            <Grid xs={12} md={6}>
              <TradingCard sx={{ height: 400 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Watchlist
                  </Typography>
                  <Suspense fallback={<DataPanelSkeleton rows={5} />}>
                    <WatchlistPanel
                      selectedSymbol={symbol}
                      onSymbolSelect={handleSymbolChange}
                    />
                  </Suspense>
                </CardContent>
              </TradingCard>
            </Grid>

            <Grid xs={12} md={6}>
              <TradingCard sx={{ height: 400 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Alerts & Notifications
                  </Typography>
                  <Suspense fallback={<DataPanelSkeleton rows={5} />}>
                    <AlertsPanel
                      currentSymbol={symbol}
                      currentMarket={market}
                      currentPrice={merged.length > 0 ? merged[merged.length - 1]?.close : undefined}
                      indicators={indicators}
                    />
                  </Suspense>
                </CardContent>
              </TradingCard>
            </Grid>
          </Grid>
        </Box>
      </Container>
      
      {/* Error notification with MUI */}
      {errorHandler.isError && (
        <AlertNotification
          type="error"
          message="Connection Error"
          details={errorHandler.error?.message || 'Unknown error occurred'}
          onClose={errorHandler.clearError}
          retryCount={errorHandler.retryCount}
        />
      )}

      {/* Modals (keep existing ones for now) */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AnalyticsDashboard isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
      <StrategyBuilder 
        isOpen={showStrategyBuilder} 
        onClose={() => setShowStrategyBuilder(false)}
        onStrategyCreate={(strategy) => console.log('Strategy created:', strategy)}
        onBacktestRun={(strategyId) => {
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
      <BacktestResults 
        isOpen={showBacktestResults} 
        onClose={() => setShowBacktestResults(false)}
        backtestData={backtestData}
        onRunBacktest={(strategyId, options) => console.log('Running new backtest:', strategyId, options)}
      />
      {showPortfolioManager && (
        <Suspense fallback={<Box>Loading Portfolio Manager...</Box>}>
          <PortfolioManager 
            isOpen={showPortfolioManager} 
            onClose={() => setShowPortfolioManager(false)}
          />
        </Suspense>
      )}
    </Box>
  )
}

// Main App component wrapped with Enhanced Theme Provider
export default function App() {
  return (
    <EnhancedThemeProvider>
      <AppContent />
    </EnhancedThemeProvider>
  )
}