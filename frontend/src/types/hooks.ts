/**
 * Hook Types for NovaSignal
 * TypeScript definitions for custom React hooks
 */

import { Dispatch, SetStateAction, MutableRefObject } from 'react'
import { IChartApi, ISeriesApi } from 'lightweight-charts'
import { 
  CandlestickData, 
  TradingSignal, 
  IndicatorData, 
  Symbol, 
  MarketType, 
  Timeframe 
} from './market'
import { 
  PerformanceMetrics, 
  UserPreferences,
  UseWebSocketReturn,
  UseLocalStorageReturn,
  UseAsyncReturn
} from './ui'

// ============================================================================
// Chart Hook Types
// ============================================================================

/**
 * Chart data hook return type
 */
export interface UseChartDataReturn {
  /** Chart data */
  data: CandlestickData[]
  /** Loading state */
  loading: boolean
  /** Error state */
  error: string | null
  /** Fetch data function */
  fetchData: (symbol: string, timeframe: Timeframe, market: MarketType) => Promise<void>
  /** Refresh data function */
  refreshData: () => Promise<void>
  /** Clear data function */
  clearData: () => void
  /** Last update timestamp */
  lastUpdate: number | null
}

/**
 * Chart instance hook return type
 */
export interface UseChartReturn {
  /** Chart API instance */
  chart: IChartApi | null
  /** Candlestick series */
  series: ISeriesApi<'Candlestick'> | null
  /** Chart container ref */
  containerRef: MutableRefObject<HTMLDivElement | null>
  /** Chart ready state */
  isReady: boolean
  /** Initialize chart */
  initChart: () => void
  /** Destroy chart */
  destroyChart: () => void
  /** Update chart data */
  updateData: (data: CandlestickData[]) => void
  /** Resize chart */
  resizeChart: () => void
}

/**
 * Chart spacing hook return type
 */
export interface UseChartSpacingReturn {
  /** Current spacing */
  spacing: number
  /** Set spacing */
  setSpacing: (spacing: number) => void
  /** Apply spacing to chart */
  applySpacing: (chart: IChartApi) => void
  /** Reset spacing */
  resetSpacing: () => void
  /** Auto-adjust spacing */
  autoAdjustSpacing: (dataLength: number) => void
}

// ============================================================================
// WebSocket Hook Types
// ============================================================================

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  /** WebSocket URL */
  url: string
  /** Connection options */
  options?: {
    /** Auto-connect on mount */
    autoConnect?: boolean
    /** Reconnect attempts */
    reconnectAttempts?: number
    /** Reconnect interval */
    reconnectInterval?: number
    /** Heartbeat interval */
    heartbeatInterval?: number
    /** Connection timeout */
    timeout?: number
  }
  /** Protocol list */
  protocols?: string[]
}

/**
 * WebSocket message handler
 */
export type WebSocketMessageHandler = (data: any) => void

/**
 * WebSocket connection hook return type
 */
export interface UseWebSocketConnectionReturn extends UseWebSocketReturn {
  /** Subscribe to messages */
  subscribe: (type: string, handler: WebSocketMessageHandler) => () => void
  /** Unsubscribe from messages */
  unsubscribe: (type: string, handler: WebSocketMessageHandler) => void
  /** Connection config */
  config: WebSocketConfig
  /** Ready state */
  readyState: number
  /** Message history */
  messageHistory: any[]
}

// ============================================================================
// Data Management Hook Types
// ============================================================================

/**
 * Symbol data hook return type
 */
export interface UseSymbolDataReturn {
  /** Symbol list */
  symbols: Symbol[]
  /** Selected symbol */
  selectedSymbol: string
  /** Set selected symbol */
  setSelectedSymbol: (symbol: string) => void
  /** Search symbols */
  searchSymbols: (query: string) => Symbol[]
  /** Filter symbols by market */
  filterByMarket: (market: MarketType) => Symbol[]
  /** Add to favorites */
  addToFavorites: (symbol: string) => void
  /** Remove from favorites */
  removeFromFavorites: (symbol: string) => void
  /** Get favorites */
  favorites: string[]
  /** Loading state */
  loading: boolean
  /** Error state */
  error: string | null
}

/**
 * Market data hook return type
 */
export interface UseMarketDataReturn {
  /** Current market data */
  data: CandlestickData[]
  /** Technical indicators */
  indicators: IndicatorData
  /** Trading signals */
  signals: TradingSignal[]
  /** Current symbol */
  symbol: string
  /** Current timeframe */
  timeframe: Timeframe
  /** Current market */
  market: MarketType
  /** Update parameters */
  updateParams: (params: {
    symbol?: string
    timeframe?: Timeframe
    market?: MarketType
  }) => void
  /** Refresh all data */
  refresh: () => Promise<void>
  /** Subscribe to real-time updates */
  subscribe: () => void
  /** Unsubscribe from updates */
  unsubscribe: () => void
  /** Loading states */
  loading: {
    data: boolean
    indicators: boolean
    signals: boolean
  }
  /** Error states */
  errors: {
    data: string | null
    indicators: string | null
    signals: string | null
  }
}

/**
 * Cache hook return type
 */
export interface UseCacheReturn<T> {
  /** Get cached value */
  get: (key: string) => T | null
  /** Set cached value */
  set: (key: string, value: T, ttl?: number) => void
  /** Remove cached value */
  remove: (key: string) => void
  /** Clear all cache */
  clear: () => void
  /** Check if key exists */
  has: (key: string) => boolean
  /** Get cache stats */
  stats: {
    size: number
    hits: number
    misses: number
    hitRate: number
  }
}

// ============================================================================
// Performance Hook Types
// ============================================================================

/**
 * Performance monitoring hook return type
 */
export interface UsePerformanceReturn {
  /** Current metrics */
  metrics: PerformanceMetrics
  /** Start performance measurement */
  startMeasurement: (label: string) => void
  /** End performance measurement */
  endMeasurement: (label: string) => number
  /** Mark performance point */
  mark: (name: string) => void
  /** Measure performance between marks */
  measure: (name: string, startMark?: string, endMark?: string) => number
  /** Get FPS */
  getFPS: () => number
  /** Get memory usage */
  getMemoryUsage: () => number
  /** Reset metrics */
  reset: () => void
  /** Export metrics */
  exportMetrics: () => any
}

/**
 * Render timing hook return type
 */
export interface UseRenderTimingReturn {
  /** Render times by component */
  renderTimes: Record<string, number[]>
  /** Average render time */
  averageRenderTime: (component: string) => number
  /** Start timing render */
  startRender: (component: string) => void
  /** End timing render */
  endRender: (component: string) => void
  /** Get slowest components */
  getSlowestComponents: (limit?: number) => Array<{
    component: string
    averageTime: number
    samples: number
  }>
}

// ============================================================================
// State Management Hook Types
// ============================================================================

/**
 * App state hook return type
 */
export interface UseAppStateReturn {
  /** Application state */
  state: {
    /** Current symbol */
    symbol: string
    /** Current market */
    market: MarketType
    /** Current timeframe */
    timeframe: Timeframe
    /** Chart ready state */
    chartReady: boolean
    /** Connection status */
    connected: boolean
    /** Loading states */
    loading: Record<string, boolean>
    /** Error states */
    errors: Record<string, string | null>
  }
  /** Update state */
  updateState: (updates: Partial<any>) => void
  /** Reset state */
  resetState: () => void
  /** Subscribe to state changes */
  subscribe: (callback: (state: any) => void) => () => void
}

/**
 * User preferences hook return type
 */
export interface UseUserPreferencesReturn extends UseLocalStorageReturn<UserPreferences> {
  /** Update theme preferences */
  updateTheme: (theme: Partial<UserPreferences['theme']>) => void
  /** Update chart preferences */
  updateChart: (chart: Partial<UserPreferences['chart']>) => void
  /** Update trading preferences */
  updateTrading: (trading: Partial<UserPreferences['trading']>) => void
  /** Update performance preferences */
  updatePerformance: (performance: Partial<UserPreferences['performance']>) => void
  /** Reset to defaults */
  resetToDefaults: () => void
  /** Export preferences */
  exportPreferences: () => string
  /** Import preferences */
  importPreferences: (data: string) => boolean
}

// ============================================================================
// API Hook Types
// ============================================================================

/**
 * API request hook options
 */
export interface UseApiRequestOptions<T> {
  /** Initial data */
  initialData?: T
  /** Auto-execute on mount */
  immediate?: boolean
  /** Dependencies for re-execution */
  deps?: any[]
  /** Request configuration */
  config?: {
    timeout?: number
    retries?: number
    cache?: boolean
    cacheTTL?: number
  }
  /** Success callback */
  onSuccess?: (data: T) => void
  /** Error callback */
  onError?: (error: Error) => void
}

/**
 * API request hook return type
 */
export interface UseApiRequestReturn<T> extends UseAsyncReturn<T> {
  /** Request function */
  request: (...args: any[]) => Promise<T>
  /** Cancel request */
  cancel: () => void
  /** Retry request */
  retry: () => Promise<void>
  /** Request status */
  status: 'idle' | 'loading' | 'success' | 'error'
  /** Response metadata */
  metadata: {
    requestId: string
    timestamp: number
    duration: number
    fromCache: boolean
  } | null
}

// ============================================================================
// Utility Hook Types
// ============================================================================

/**
 * Debounced value hook return type
 */
export interface UseDebouncedValueReturn<T> {
  /** Debounced value */
  debouncedValue: T
  /** Cancel pending update */
  cancel: () => void
  /** Flush immediately */
  flush: () => void
  /** Is pending */
  isPending: boolean
}

/**
 * Throttled callback hook return type
 */
export interface UseThrottledCallbackReturn<T extends (...args: any[]) => any> {
  /** Throttled callback */
  throttledCallback: T
  /** Cancel pending call */
  cancel: () => void
  /** Flush immediately */
  flush: () => void
  /** Is pending */
  isPending: boolean
}

/**
 * Interval hook return type
 */
export interface UseIntervalReturn {
  /** Start interval */
  start: () => void
  /** Stop interval */
  stop: () => void
  /** Reset interval */
  reset: () => void
  /** Is running */
  isRunning: boolean
}

/**
 * Event listener hook return type
 */
export interface UseEventListenerReturn {
  /** Add event listener */
  addEventListener: () => void
  /** Remove event listener */
  removeEventListener: () => void
  /** Is listening */
  isListening: boolean
}

/**
 * Previous value hook return type
 */
export interface UsePreviousReturn<T> {
  /** Previous value */
  previous: T | undefined
  /** Has changed */
  hasChanged: boolean
}

// ============================================================================
// Hook Types (exported through main index.ts)
// ============================================================================

// Note: All types are now exported through the main types/index.ts file
// to avoid conflicts and maintain a single source of truth