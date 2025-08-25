/**
 * NovaSignal Type Definitions
 * Central export point for all TypeScript types used throughout the application
 */

// ============================================================================
// CORE MARKET TYPES
// ============================================================================
export type { 
  MarketType, 
  Timeframe, 
  Symbol,
  RawOHLCData,
  CandlestickData,
  HistoricalDataResponse
} from './market'

// ============================================================================
// CORE UI TYPES
// ============================================================================
export type { 
  ThemeMode, 
  Size, 
  ButtonVariant,
  BaseComponentProps,
  ButtonProps,
  SymbolSelectorProps,
  SearchFilters,
  SearchResult
} from './ui'

// ============================================================================
// CORE API TYPES
// ============================================================================
export type { 
  HTTPMethod,
  APIResponse,
  APIError,
  RequestOptions,
  HTTPClient
} from './api'

// ============================================================================
// CORE HOOK TYPES
// ============================================================================
export type { 
  UseApiRequestReturn,
  UseDebouncedValueReturn,
  UseThrottledCallbackReturn,
  UseSymbolDataReturn
} from './hooks'

// ============================================================================
// CORE UTILITY TYPES
// ============================================================================
export type { 
  DeepPartial,
  DeepRequired,
  Callback,
  AsyncCallback
} from './utils'

// ============================================================================
// KEYBOARD SHORTCUT TYPES
// ============================================================================
export interface KeyboardShortcut {
  /** Array of keys that trigger the shortcut */
  keys: string[]
  /** Human-readable description of the shortcut */
  description: string
  /** Function to execute when shortcut is triggered */
  handler: (event?: KeyboardEvent) => void
  /** Whether this shortcut works globally */
  global?: boolean
  /** Context for the shortcut (e.g., 'chart', 'search') */
  context?: string
  /** Category for grouping shortcuts */
  category?: string
}

// ============================================================================
// CHART TYPES
// ============================================================================
export type { 
  DXCandle,
  DXChartProps
} from '../components/DXChart'

// ============================================================================
// Application-Wide Type Aliases
// ============================================================================

import { MarketType, Timeframe, Symbol } from './market'
import { ThemeMode, Size, ButtonVariant } from './ui'
import { HTTPMethod } from './api'

/**
 * Common application configuration
 */
export interface AppConfig {
  /** Default market */
  defaultMarket: MarketType
  /** Default timeframe */
  defaultTimeframe: Timeframe
  /** Default theme */
  defaultTheme: ThemeMode
  /** API configuration */
  api: {
    baseURL: string
    timeout: number
    retries: number
  }
  /** WebSocket configuration */
  websocket: {
    url: string
    reconnectAttempts: number
    heartbeatInterval: number
  }
  /** Feature flags */
  features: {
    enablePerformanceMonitoring: boolean
    enableDebugMode: boolean
    enableOfflineMode: boolean
  }
}

/**
 * Global app context type
 */
export interface AppContextValue {
  /** Configuration */
  config: AppConfig
  /** Current user session */
  session: {
    isAuthenticated: boolean
    user?: {
      id: string
      email: string
      preferences: any
    }
  }
  /** Theme management */
  theme: {
    mode: ThemeMode
    setMode: (mode: ThemeMode) => void
  }
  /** Loading states */
  loading: Record<string, boolean>
  /** Error states */
  errors: Record<string, string | null>
  /** Global actions */
  actions: {
    showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void
    clearError: (key: string) => void
    setLoading: (key: string, loading: boolean) => void
  }
}

/**
 * Navigation route definition
 */
export interface AppRoute {
  /** Route path */
  path: string
  /** Route name */
  name: string
  /** Component to render */
  component: React.ComponentType<any>
  /** Route metadata */
  meta?: {
    title?: string
    description?: string
    icon?: string
    requiresAuth?: boolean
  }
}

// ============================================================================
// TRADING-SPECIFIC TYPES
// ============================================================================

/**
 * Trading session configuration
 */
export interface TradingSession {
  /** Session ID */
  id: string
  /** Start time */
  startTime: Date
  /** End time */
  endTime?: Date
  /** Active symbols */
  activeSymbols: string[]
  /** Market type */
  market: MarketType
  /** Timeframe */
  timeframe: Timeframe
  /** Risk management settings */
  riskManagement: {
    maxPositionSize: number
    stopLossPercentage: number
    takeProfitPercentage: number
  }
}

/**
 * Real-time market data stream
 */
export interface MarketDataStream {
  /** Stream ID */
  id: string
  /** Symbol */
  symbol: string
  /** Market type */
  market: MarketType
  /** Data type */
  dataType: 'ohlc' | 'trades' | 'orderbook' | 'indicators'
  /** Update frequency in milliseconds */
  updateFrequency: number
  /** Last update time */
  lastUpdate: Date
  /** Data buffer */
  dataBuffer: any[]
  /** Connection status */
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
}

/**
 * Technical analysis result
 */
export interface TechnicalAnalysis {
  /** Analysis timestamp */
  timestamp: Date
  /** Symbol analyzed */
  symbol: string
  /** Overall trend */
  trend: 'bullish' | 'bearish' | 'neutral'
  /** Trend strength (0-100) */
  trendStrength: number
  /** Support levels */
  supportLevels: number[]
  /** Resistance levels */
  resistanceLevels: number[]
  /** Key indicators summary */
  indicators: {
    rsi: { value: number; signal: 'oversold' | 'overbought' | 'neutral' }
    macd: { signal: 'bullish' | 'bearish' | 'neutral'; strength: number }
    sma: { short: number; long: number; signal: 'bullish' | 'bearish' | 'neutral' }
    bollinger: { position: 'upper' | 'middle' | 'lower'; width: number }
  }
  /** Trading signals */
  signals: {
    entry: 'buy' | 'sell' | 'hold'
    confidence: number
    stopLoss?: number
    takeProfit?: number
    riskRewardRatio?: number
  }
}

/**
 * Portfolio performance metrics
 */
export interface PortfolioMetrics {
  /** Total value */
  totalValue: number
  /** Total cost basis */
  totalCost: number
  /** Unrealized P&L */
  unrealizedPnL: number
  /** Realized P&L */
  realizedPnL: number
  /** Total return percentage */
  totalReturnPercent: number
  /** Daily P&L */
  dailyPnL: number
  /** Best performing asset */
  bestAsset: {
    symbol: string
    return: number
    returnPercent: number
  }
  /** Worst performing asset */
  worstAsset: {
    symbol: string
    return: number
    returnPercent: number
  }
  /** Risk metrics */
  risk: {
    volatility: number
    sharpeRatio: number
    maxDrawdown: number
    beta: number
  }
}

/**
 * News sentiment analysis
 */
export interface NewsSentiment {
  /** News ID */
  id: string
  /** Headline */
  headline: string
  /** Source */
  source: string
  /** Publication time */
  publishedAt: Date
  /** Sentiment score (-1 to 1) */
  sentiment: number
  /** Sentiment label */
  sentimentLabel: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive'
  /** Relevance to trading */
  relevance: 'high' | 'medium' | 'low'
  /** Impact on price */
  priceImpact: 'bullish' | 'bearish' | 'neutral'
  /** Confidence in analysis */
  confidence: number
  /** Related symbols */
  relatedSymbols: string[]
}

/**
 * Social media sentiment
 */
export interface SocialSentiment {
  /** Platform */
  platform: 'twitter' | 'reddit' | 'stocktwits' | 'discord'
  /** Symbol */
  symbol: string
  /** Sentiment score */
  sentiment: number
  /** Mention count */
  mentionCount: number
  /** Sentiment change */
  sentimentChange: number
  /** Trending status */
  trending: boolean
  /** Top mentions */
  topMentions: {
    user: string
    content: string
    sentiment: number
    timestamp: Date
  }[]
}

/**
 * AI trading recommendation
 */
export interface AITradingRecommendation {
  /** Recommendation ID */
  id: string
  /** Symbol */
  symbol: string
  /** Action */
  action: 'buy' | 'sell' | 'hold' | 'close'
  /** Confidence level */
  confidence: number
  /** Reasoning */
  reasoning: string
  /** Technical analysis summary */
  technicalSummary: string
  /** Fundamental analysis summary */
  fundamentalSummary: string
  /** Risk assessment */
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
    mitigation: string[]
  }
  /** Entry/exit points */
  entryExit: {
    entryPrice?: number
    stopLoss?: number
    takeProfit?: number
    timeHorizon: string
  }
  /** Alternative strategies */
  alternatives: {
    strategy: string
    description: string
    risk: string
  }[]
}

/**
 * Market scanner result
 */
export interface MarketScannerResult {
  /** Scan timestamp */
  timestamp: Date
  /** Scan criteria */
  criteria: {
    market: MarketType
    minVolume?: number
    minPriceChange?: number
    technicalPatterns?: string[]
    fundamentalFilters?: string[]
  }
  /** Results */
  results: {
    symbol: string
    score: number
    reasons: string[]
    technicalSignals: string[]
    fundamentalMetrics: Record<string, number>
    riskLevel: 'low' | 'medium' | 'high'
  }[]
  /** Summary statistics */
  summary: {
    totalScanned: number
    matchesFound: number
    averageScore: number
    topOpportunities: number
  }
}

/**
 * Performance monitoring alert
 */
export interface PerformanceAlert {
  /** Alert ID */
  id: string
  /** Alert type */
  type: 'performance' | 'error' | 'warning' | 'info'
  /** Severity */
  severity: 'low' | 'medium' | 'high' | 'critical'
  /** Message */
  message: string
  /** Component affected */
  component?: string
  /** Timestamp */
  timestamp: Date
  /** User action required */
  actionRequired: boolean
  /** Action description */
  actionDescription?: string
  /** Auto-resolve */
  autoResolve: boolean
  /** Resolve timeout */
  resolveTimeout?: number
}

/**
 * Application performance metrics
 */
export interface AppPerformanceMetrics {
  /** Page load time */
  pageLoadTime: number
  /** API response time */
  apiResponseTime: number
  /** Chart rendering time */
  chartRenderTime: number
  /** Memory usage */
  memoryUsage: number
  /** CPU usage */
  cpuUsage: number
  /** Frame rate */
  frameRate: number
  /** Network latency */
  networkLatency: number
  /** Error rate */
  errorRate: number
  /** User interaction responsiveness */
  interactionResponsiveness: number
}

/**
 * Feature flag configuration
 */
export interface FeatureFlags {
  /** Enable advanced charting */
  enableAdvancedCharting: boolean
  /** Enable AI recommendations */
  enableAIRecommendations: boolean
  /** Enable social sentiment */
  enableSocialSentiment: boolean
  /** Enable portfolio tracking */
  enablePortfolioTracking: boolean
  /** Enable news sentiment */
  enableNewsSentiment: boolean
  /** Enable market scanning */
  enableMarketScanning: boolean
  /** Enable performance monitoring */
  enablePerformanceMonitoring: boolean
  /** Enable dark mode */
  enableDarkMode: boolean
  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts: boolean
  /** Enable mobile optimization */
  enableMobileOptimization: boolean
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** Theme preference */
  theme: ThemeMode
  /** Default market */
  defaultMarket: MarketType
  /** Default timeframe */
  defaultTimeframe: Timeframe
  /** Chart preferences */
  chart: {
    defaultType: 'candlestick' | 'line' | 'area' | 'bar'
    showVolume: boolean
    showGrid: boolean
    showCrosshair: boolean
    colorScheme: 'default' | 'dark' | 'light' | 'custom'
  }
  /** Notification preferences */
  notifications: {
    priceAlerts: boolean
    newsAlerts: boolean
    signalAlerts: boolean
    performanceAlerts: boolean
    emailNotifications: boolean
    pushNotifications: boolean
  }
  /** Risk management preferences */
  riskManagement: {
    defaultStopLoss: number
    defaultTakeProfit: number
    maxPositionSize: number
    enableAutoRiskManagement: boolean
  }
}