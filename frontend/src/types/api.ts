/**
 * API Types for NovaSignal
 * TypeScript definitions for API requests, responses, and data structures
 */

import { 
  MarketType, 
  Timeframe, 
  TimeframeMinutes, 
  HistoricalDataResponse, 
  IndicatorData, 
  TradingSignal, 
  NewsArticle,
  EconomicEvent
} from './market'

// ============================================================================
// Base API Types
// ============================================================================

/**
 * API response wrapper
 */
export interface APIResponse<T = any> {
  /** Response data */
  data?: T
  /** Success status */
  success: boolean
  /** Error message */
  error?: string
  /** Error code */
  errorCode?: string
  /** Response metadata */
  metadata?: {
    /** Request timestamp */
    timestamp: number
    /** Request ID */
    requestId: string
    /** Response time in ms */
    responseTime: number
    /** API version */
    version: string
  }
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  /** Pagination info */
  pagination: {
    /** Current page */
    page: number
    /** Items per page */
    limit: number
    /** Total items */
    total: number
    /** Total pages */
    totalPages: number
    /** Has next page */
    hasNext: boolean
    /** Has previous page */
    hasPrevious: boolean
  }
}

/**
 * API error response
 */
export interface APIError {
  /** Error message */
  message: string
  /** Error code */
  code: string
  /** HTTP status code */
  status: number
  /** Error details */
  details?: Record<string, any>
  /** Error timestamp */
  timestamp: number
  /** Request ID */
  requestId?: string
}

/**
 * API request configuration
 */
export interface APIConfig {
  /** Base URL */
  baseURL: string
  /** Request timeout in ms */
  timeout: number
  /** Default headers */
  headers?: Record<string, string>
  /** API key */
  apiKey?: string
  /** Rate limiting */
  rateLimit?: {
    /** Requests per minute */
    requestsPerMinute: number
    /** Retry attempts */
    retryAttempts: number
    /** Retry delay in ms */
    retryDelay: number
  }
}

// ============================================================================
// Market Data API Types
// ============================================================================

/**
 * Historical data request parameters
 */
export interface HistoricalDataRequest {
  /** Trading symbol */
  symbol: string
  /** Market type */
  market?: MarketType
  /** Time interval in minutes */
  interval: TimeframeMinutes
  /** Number of days to fetch */
  days?: number
  /** Start date */
  startDate?: string
  /** End date */
  endDate?: string
  /** Data provider */
  provider?: string
  /** Maximum data points */
  limit?: number
}

/**
 * Real-time data subscription request
 */
export interface RealtimeDataRequest {
  /** Trading symbol */
  symbol: string
  /** Market type */
  market?: MarketType
  /** Time interval in minutes */
  interval: TimeframeMinutes
  /** Data provider */
  provider?: string
  /** Subscription type */
  type?: 'price' | 'volume' | 'both'
}

/**
 * Symbol search request
 */
export interface SymbolSearchRequest {
  /** Search query */
  query: string
  /** Market filter */
  market?: MarketType
  /** Result limit */
  limit?: number
  /** Include inactive symbols */
  includeInactive?: boolean
  /** Search fields */
  fields?: ('symbol' | 'name' | 'description')[]
}

/**
 * Market info request
 */
export interface MarketInfoRequest {
  /** Market type */
  market?: MarketType
  /** Include symbols */
  includeSymbols?: boolean
  /** Include market hours */
  includeMarketHours?: boolean
}

// ============================================================================
// Technical Analysis API Types
// ============================================================================

/**
 * Indicators request parameters
 */
export interface IndicatorsRequest {
  /** Trading symbol */
  symbol: string
  /** Market type */
  market: MarketType
  /** Time interval in minutes */
  interval: TimeframeMinutes
  /** Number of days for calculation */
  days?: number
  /** Data provider */
  provider?: string
  /** Specific indicators to calculate */
  indicators?: string[]
  /** Indicator parameters */
  params?: Record<string, Record<string, number>>
}

/**
 * Signals request parameters
 */
export interface SignalsRequest {
  /** Trading symbol */
  symbol: string
  /** Market type */
  market: MarketType
  /** Time interval in minutes */
  interval: TimeframeMinutes
  /** Signal types to generate */
  signalTypes?: string[]
  /** Minimum confidence threshold */
  minConfidence?: number
  /** Result limit */
  limit?: number
  /** Include historical signals */
  includeHistorical?: boolean
}

/**
 * Custom indicator request
 */
export interface CustomIndicatorRequest {
  /** Indicator name */
  name: string
  /** Indicator formula/script */
  formula: string
  /** Input parameters */
  parameters: Record<string, number | boolean | string>
  /** Market data input */
  data: {
    symbol: string
    market: MarketType
    interval: TimeframeMinutes
    days: number
  }
}

// ============================================================================
// News & Events API Types
// ============================================================================

/**
 * News request parameters
 */
export interface NewsRequest {
  /** Related symbols */
  symbols?: string[]
  /** News category */
  category?: string
  /** News source */
  source?: string
  /** Date range */
  dateRange?: {
    start: string
    end: string
  }
  /** Result limit */
  limit?: number
  /** Page number */
  page?: number
  /** Language filter */
  language?: string
  /** Sentiment filter */
  sentiment?: 'positive' | 'negative' | 'neutral'
}

/**
 * Economic events request
 */
export interface EconomicEventsRequest {
  /** Country filter */
  country?: string
  /** Currency filter */
  currency?: string
  /** Impact level */
  impact?: 'low' | 'medium' | 'high'
  /** Date range */
  dateRange?: {
    start: string
    end: string
  }
  /** Result limit */
  limit?: number
  /** Include forecasts */
  includeForecast?: boolean
}

/**
 * News sentiment analysis request
 */
export interface SentimentAnalysisRequest {
  /** Text to analyze */
  text: string
  /** Symbol context */
  symbol?: string
  /** Analysis depth */
  depth?: 'basic' | 'detailed'
}

// ============================================================================
// Portfolio & Trading API Types
// ============================================================================

/**
 * Portfolio request
 */
export interface PortfolioRequest {
  /** Account ID */
  accountId?: string
  /** Include positions */
  includePositions?: boolean
  /** Include trades */
  includeTrades?: boolean
  /** Date range for P&L calculation */
  dateRange?: {
    start: string
    end: string
  }
}

/**
 * Position create/update request
 */
export interface PositionRequest {
  /** Trading symbol */
  symbol: string
  /** Position side */
  side: 'long' | 'short'
  /** Position quantity */
  quantity: number
  /** Entry price */
  entryPrice: number
  /** Stop loss price */
  stopLoss?: number
  /** Take profit price */
  takeProfit?: number
  /** Position notes */
  notes?: string
}

/**
 * Trade execution request
 */
export interface TradeRequest {
  /** Trading symbol */
  symbol: string
  /** Trade side */
  side: 'buy' | 'sell'
  /** Trade quantity */
  quantity: number
  /** Order type */
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit'
  /** Limit price (for limit orders) */
  limitPrice?: number
  /** Stop price (for stop orders) */
  stopPrice?: number
  /** Time in force */
  timeInForce?: 'GTC' | 'IOC' | 'FOK' | 'DAY'
  /** Reduce only flag */
  reduceOnly?: boolean
}

/**
 * Watchlist request
 */
export interface WatchlistRequest {
  /** Watchlist name */
  name: string
  /** Watchlist symbols */
  symbols: string[]
  /** Watchlist description */
  description?: string
  /** Public visibility */
  isPublic?: boolean
}

// ============================================================================
// User & Settings API Types
// ============================================================================

/**
 * User preferences update request
 */
export interface UserPreferencesRequest {
  /** Theme preferences */
  theme?: {
    mode: 'light' | 'dark' | 'auto'
    colorScheme?: Record<string, string>
  }
  /** Chart preferences */
  chart?: {
    defaultTimeframe: Timeframe
    spacing: Record<string, number>
    indicators: string[]
    height: number
  }
  /** Trading preferences */
  trading?: {
    favorites: string[]
    defaultMarket: MarketType
    signalNotifications: boolean
  }
  /** Notification preferences */
  notifications?: {
    email: boolean
    push: boolean
    sound: boolean
    priceAlerts: boolean
    signalAlerts: boolean
  }
}

/**
 * API key management request
 */
export interface APIKeyRequest {
  /** Key name */
  name: string
  /** Key permissions */
  permissions: string[]
  /** Key expiration */
  expiresAt?: string
  /** IP restrictions */
  ipRestrictions?: string[]
}

/**
 * User activity log request
 */
export interface ActivityLogRequest {
  /** Activity types */
  types?: string[]
  /** Date range */
  dateRange?: {
    start: string
    end: string
  }
  /** Result limit */
  limit?: number
  /** Page number */
  page?: number
}

// ============================================================================
// Analytics & Monitoring API Types
// ============================================================================

/**
 * Analytics event request
 */
export interface AnalyticsEventRequest {
  /** Event name */
  event: string
  /** Event properties */
  properties?: Record<string, any>
  /** User ID */
  userId?: string
  /** Session ID */
  sessionId?: string
  /** Event timestamp */
  timestamp?: number
}

/**
 * Performance metrics request
 */
export interface PerformanceMetricsRequest {
  /** Metric types */
  metrics?: string[]
  /** Time range */
  timeRange?: {
    start: string
    end: string
  }
  /** Aggregation level */
  aggregation?: 'minute' | 'hour' | 'day'
  /** Include system metrics */
  includeSystem?: boolean
}

/**
 * Error report request
 */
export interface ErrorReportRequest {
  /** Error message */
  message: string
  /** Error stack trace */
  stack?: string
  /** Error code */
  code?: string
  /** User agent */
  userAgent?: string
  /** Browser info */
  browser?: {
    name: string
    version: string
  }
  /** URL where error occurred */
  url?: string
  /** Additional context */
  context?: Record<string, any>
}

// ============================================================================
// WebSocket API Types
// ============================================================================

/**
 * WebSocket subscription request
 */
export interface WebSocketSubscription {
  /** Subscription type */
  type: 'price_data' | 'indicators' | 'signals' | 'news'
  /** Subscription parameters */
  params: {
    symbol?: string
    market?: MarketType
    interval?: TimeframeMinutes
    [key: string]: any
  }
  /** Subscription ID */
  id?: string
}

/**
 * WebSocket message
 */
export interface WebSocketMessage {
  /** Message type */
  type: 'subscribe' | 'unsubscribe' | 'data' | 'error' | 'ping' | 'pong'
  /** Message data */
  data?: any
  /** Subscription ID */
  id?: string
  /** Error information */
  error?: {
    code: string
    message: string
  }
  /** Message timestamp */
  timestamp: number
}

/**
 * WebSocket authentication
 */
export interface WebSocketAuth {
  /** Authentication token */
  token: string
  /** User ID */
  userId?: string
  /** Session ID */
  sessionId?: string
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Historical data API response
 */
export type HistoricalDataAPIResponse = APIResponse<HistoricalDataResponse>

/**
 * Indicators API response
 */
export type IndicatorsAPIResponse = APIResponse<{
  indicators: IndicatorData
  metadata: {
    symbol: string
    timeframe: Timeframe
    calculationTime: number
  }
}>

/**
 * Signals API response
 */
export type SignalsAPIResponse = APIResponse<{
  signals: TradingSignal[]
  metadata: {
    symbol: string
    totalSignals: number
    generationTime: number
  }
}>

/**
 * News API response
 */
export type NewsAPIResponse = PaginatedResponse<NewsArticle>

/**
 * Economic events API response
 */
export type EconomicEventsAPIResponse = PaginatedResponse<EconomicEvent>

/**
 * Symbol search API response
 */
export type SymbolSearchAPIResponse = APIResponse<{
  symbols: Array<{
    symbol: string
    name: string
    description: string
    market: MarketType
    isActive: boolean
  }>
  totalResults: number
  searchTime: number
}>

// ============================================================================
// HTTP Client Types
// ============================================================================

/**
 * HTTP method types
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Request options
 */
export interface RequestOptions {
  /** HTTP method */
  method?: HTTPMethod
  /** Request headers */
  headers?: Record<string, string>
  /** Request body */
  body?: any
  /** Query parameters */
  params?: Record<string, string | number | boolean>
  /** Request timeout */
  timeout?: number
  /** Retry configuration */
  retry?: {
    attempts: number
    delay: number
    backoff: boolean
  }
  /** Cache configuration */
  cache?: {
    enabled: boolean
    ttl: number
    key?: string
  }
}

/**
 * HTTP client interface
 */
export interface HTTPClient {
  /** GET request */
  get<T = any>(url: string, options?: RequestOptions): Promise<T>
  /** POST request */
  post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
  /** PUT request */
  put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
  /** PATCH request */
  patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
  /** DELETE request */
  delete<T = any>(url: string, options?: RequestOptions): Promise<T>
  /** Generic request method */
  request<T = any>(method: HTTPMethod, url: string, data?: any, options?: RequestOptions): Promise<T>
  /** Abort specific request */
  abortRequest(requestId: string): void
  /** Abort all requests */
  abortAllRequests(): void
}

// ============================================================================
// Export all API types
// ============================================================================

// Note: All types are now exported through the main types/index.ts file
// to avoid conflicts and maintain a single source of truth