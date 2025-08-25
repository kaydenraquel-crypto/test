/**
 * Market Data Types for NovaSignal
 * Comprehensive TypeScript definitions for market data structures
 */

// ============================================================================
// Base Market Data Types
// ============================================================================

/**
 * Timestamp type - Unix timestamp in milliseconds
 */
export type Timestamp = number

/**
 * Price type - Floating point price value
 */
export type Price = number

/**
 * Volume type - Trading volume
 */
export type Volume = number

/**
 * Market type enumeration
 */
export type MarketType = 'crypto' | 'stocks' | 'forex' | 'commodities'

/**
 * Timeframe enumeration for chart intervals
 */
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M'

/**
 * Timeframe in minutes for API calls
 */
export type TimeframeMinutes = 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 43200

// ============================================================================
// OHLC Data Types
// ============================================================================

/**
 * Raw OHLC candlestick data from API
 */
export interface RawOHLCData {
  /** Unix timestamp */
  ts?: Timestamp
  /** Alternative timestamp field */
  timestamp?: Timestamp
  /** Alternative time field */
  time?: Timestamp
  /** Opening price */
  open: string | number
  /** Highest price */
  high: string | number
  /** Lowest price */
  low: string | number
  /** Closing price */
  close: string | number
  /** Trading volume */
  volume?: string | number
}

/**
 * Processed OHLC data for chart consumption
 */
export interface CandlestickData {
  /** Chart time (compatible with TradingView Lightweight Charts) */
  time: Timestamp
  /** Opening price */
  open: Price
  /** Highest price */
  high: Price
  /** Lowest price */
  low: Price
  /** Closing price */
  close: Price
  /** Trading volume */
  volume?: Volume
}

/**
 * Historical data response from API
 */
export interface HistoricalDataResponse {
  /** Array of OHLC data */
  ohlc: RawOHLCData[]
  /** Trading symbol */
  symbol: string
  /** Market type */
  market: MarketType
  /** Data provider used */
  provider_used: string
  /** Request metadata */
  metadata?: {
    /** Total number of data points */
    count: number
    /** Start time of data */
    start_time: Timestamp
    /** End time of data */
    end_time: Timestamp
    /** API response time in ms */
    response_time: number
  }
}

// ============================================================================
// Symbol & Market Types
// ============================================================================

/**
 * Trading symbol information
 */
export interface Symbol {
  /** Symbol value (e.g., 'BTCUSDT', 'AAPL') */
  value: string
  /** Display label (e.g., 'BTC/USDT', 'Apple Inc.') */
  label: string
  /** Human readable description */
  description: string
  /** Market category */
  category: MarketType
  /** Base currency/asset */
  baseAsset?: string
  /** Quote currency/asset */
  quoteAsset?: string
  /** Minimum price precision */
  pricePrecision?: number
  /** Minimum quantity precision */
  quantityPrecision?: number
  /** Whether symbol is actively trading */
  isActive?: boolean
  /** Market hours (for stocks) */
  marketHours?: {
    open: string
    close: string
    timezone: string
  }
}

/**
 * Market information
 */
export interface Market {
  /** Market identifier */
  id: MarketType
  /** Market display name */
  name: string
  /** Market description */
  description: string
  /** Available symbols in this market */
  symbols: Symbol[]
  /** Whether market is currently open */
  isOpen?: boolean
  /** Supported timeframes */
  supportedTimeframes: Timeframe[]
}

// ============================================================================
// Technical Indicators Types
// ============================================================================

/**
 * Available technical indicator types
 */
export type IndicatorType = 
  | 'sma' 
  | 'ema' 
  | 'rsi' 
  | 'macd' 
  | 'bollinger_bands'
  | 'stochastic'
  | 'williams_r'
  | 'fibonacci'
  | 'volume_profile'

/**
 * Indicator configuration parameters
 */
export interface IndicatorConfig {
  /** Indicator type */
  type: IndicatorType
  /** Indicator parameters */
  params: Record<string, number | boolean | string>
  /** Whether indicator is enabled */
  enabled: boolean
  /** Display color */
  color?: string
  /** Line style */
  lineStyle?: 'solid' | 'dashed' | 'dotted'
  /** Line width */
  lineWidth?: number
}

/**
 * Simple Moving Average data
 */
export interface SMAData {
  /** Timestamp */
  time: Timestamp
  /** SMA value */
  value: number
}

/**
 * Exponential Moving Average data
 */
export interface EMAData {
  /** Timestamp */
  time: Timestamp
  /** EMA value */
  value: number
}

/**
 * RSI (Relative Strength Index) data
 */
export interface RSIData {
  /** Timestamp */
  time: Timestamp
  /** RSI value (0-100) */
  value: number
}

/**
 * MACD data
 */
export interface MACDData {
  /** Timestamp */
  time: Timestamp
  /** MACD line */
  macd: number
  /** Signal line */
  signal: number
  /** Histogram */
  histogram: number
}

/**
 * Bollinger Bands data
 */
export interface BollingerBandsData {
  /** Timestamp */
  time: Timestamp
  /** Upper band */
  upper: number
  /** Middle band (SMA) */
  middle: number
  /** Lower band */
  lower: number
}

/**
 * Stochastic Oscillator data
 */
export interface StochasticData {
  /** Timestamp */
  time: Timestamp
  /** %K line */
  k: number
  /** %D line */
  d: number
}

/**
 * Williams %R data
 */
export interface WilliamsRData {
  /** Timestamp */
  time: Timestamp
  /** Williams %R value (-100 to 0) */
  value: number
}

/**
 * Combined indicator data
 */
export interface IndicatorData {
  sma?: SMAData[]
  ema?: EMAData[]
  rsi?: RSIData[]
  macd?: MACDData[]
  bollinger_bands?: BollingerBandsData[]
  stochastic?: StochasticData[]
  williams_r?: WilliamsRData[]
}

// ============================================================================
// Trading Signal Types
// ============================================================================

/**
 * Signal strength enumeration
 */
export type SignalStrength = 'weak' | 'moderate' | 'strong' | 'very_strong'

/**
 * Signal direction
 */
export type SignalDirection = 'buy' | 'sell' | 'hold'

/**
 * Trading signal
 */
export interface TradingSignal {
  /** Unique signal ID */
  id: string
  /** Signal timestamp */
  timestamp: Timestamp
  /** Trading symbol */
  symbol: string
  /** Signal direction */
  direction: SignalDirection
  /** Signal strength */
  strength: SignalStrength
  /** Signal source/strategy */
  source: string
  /** Signal description */
  description: string
  /** Confidence score (0-100) */
  confidence: number
  /** Entry price */
  entryPrice?: Price
  /** Stop loss price */
  stopLoss?: Price
  /** Take profit price */
  takeProfit?: Price
  /** Expected duration */
  duration?: string
  /** Risk/reward ratio */
  riskReward?: number
  /** Signal metadata */
  metadata?: Record<string, any>
}

// ============================================================================
// News & Events Types
// ============================================================================

/**
 * News article
 */
export interface NewsArticle {
  /** Article ID */
  id: string
  /** Publication timestamp */
  timestamp: Timestamp
  /** Article title */
  title: string
  /** Article summary */
  summary: string
  /** Full article content */
  content?: string
  /** News source */
  source: string
  /** Article URL */
  url?: string
  /** Related symbols */
  symbols?: string[]
  /** Sentiment score (-1 to 1) */
  sentiment?: number
  /** Impact level */
  impact?: 'low' | 'medium' | 'high'
  /** Article category */
  category?: string
  /** Tags */
  tags?: string[]
}

/**
 * Economic event
 */
export interface EconomicEvent {
  /** Event ID */
  id: string
  /** Event timestamp */
  timestamp: Timestamp
  /** Event title */
  title: string
  /** Event description */
  description: string
  /** Expected impact */
  impact: 'low' | 'medium' | 'high'
  /** Affected currency/market */
  currency?: string
  /** Previous value */
  previous?: string
  /** Forecast value */
  forecast?: string
  /** Actual value */
  actual?: string
  /** Event country */
  country?: string
}

// ============================================================================
// Portfolio & Trading Types
// ============================================================================

/**
 * Portfolio position
 */
export interface Position {
  /** Position ID */
  id: string
  /** Trading symbol */
  symbol: string
  /** Position size */
  quantity: number
  /** Average entry price */
  entryPrice: Price
  /** Current market price */
  currentPrice: Price
  /** Position side */
  side: 'long' | 'short'
  /** Unrealized P&L */
  unrealizedPnL: number
  /** Realized P&L */
  realizedPnL: number
  /** Position value */
  value: number
  /** Entry timestamp */
  entryTime: Timestamp
  /** Stop loss price */
  stopLoss?: Price
  /** Take profit price */
  takeProfit?: Price
}

/**
 * Portfolio summary
 */
export interface Portfolio {
  /** Total portfolio value */
  totalValue: number
  /** Available cash */
  cash: number
  /** Total unrealized P&L */
  unrealizedPnL: number
  /** Total realized P&L */
  realizedPnL: number
  /** Portfolio return percentage */
  returnPercent: number
  /** Active positions */
  positions: Position[]
  /** Portfolio last update */
  lastUpdate: Timestamp
}

/**
 * Trade execution
 */
export interface Trade {
  /** Trade ID */
  id: string
  /** Trading symbol */
  symbol: string
  /** Trade side */
  side: 'buy' | 'sell'
  /** Trade quantity */
  quantity: number
  /** Execution price */
  price: Price
  /** Trade value */
  value: number
  /** Trade timestamp */
  timestamp: Timestamp
  /** Order type */
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit'
  /** Trade status */
  status: 'pending' | 'filled' | 'cancelled' | 'rejected'
  /** Trade fees */
  fees?: number
  /** Trade commission */
  commission?: number
}

// ============================================================================
// Market Types (exported through main index.ts)
// ============================================================================

// Note: All types are now exported through the main types/index.ts file
// to avoid conflicts and maintain a single source of truth