/**
 * Symbol-specific types for NovaSignal Symbol Search
 * TypeScript definitions for symbol search functionality
 */

import { MarketType } from './market'

// ============================================================================
// Symbol Search Types
// ============================================================================

/**
 * Symbol search result
 */
export interface SymbolSearchResult {
  /** Symbol code (e.g., 'AAPL', 'BTCUSDT') */
  symbol: string
  /** Company or asset name */
  name: string
  /** Symbol description */
  description?: string
  /** Market type */
  type: MarketType
  /** Exchange name */
  exchange?: string
  /** Currency */
  currency?: string
  /** Whether symbol is actively trading */
  isActive: boolean
  /** Region/country */
  region?: string
  /** Match score (for search relevance) */
  matchScore?: number
}

/**
 * Symbol search request parameters
 */
export interface SymbolSearchParams {
  /** Search query */
  query: string
  /** Market filter */
  market?: MarketType
  /** Result limit */
  limit?: number
  /** Include inactive symbols */
  includeInactive?: boolean
}

/**
 * Symbol search API response
 */
export interface SymbolSearchResponse {
  /** Search results */
  symbols: SymbolSearchResult[]
  /** Total number of results */
  totalResults: number
  /** Search execution time in ms */
  searchTime: number
  /** Search query used */
  query: string
}

/**
 * Search state for useSymbolSearch hook
 */
export interface SymbolSearchState {
  /** Search results */
  results: SymbolSearchResult[]
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Search query */
  query: string
  /** Whether search has been performed */
  hasSearched: boolean
}

/**
 * Mock symbol data for development
 */
export const MOCK_SYMBOLS: SymbolSearchResult[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    description: 'Technology company',
    type: 'stocks',
    exchange: 'NASDAQ',
    currency: 'USD',
    isActive: true,
    region: 'US',
    matchScore: 1.0
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    description: 'Technology company',
    type: 'stocks',
    exchange: 'NASDAQ',
    currency: 'USD',
    isActive: true,
    region: 'US',
    matchScore: 0.95
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    description: 'Technology company',
    type: 'stocks',
    exchange: 'NASDAQ',
    currency: 'USD',
    isActive: true,
    region: 'US',
    matchScore: 0.9
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    description: 'Electric vehicle manufacturer',
    type: 'stocks',
    exchange: 'NASDAQ',
    currency: 'USD',
    isActive: true,
    region: 'US',
    matchScore: 0.85
  },
  {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    description: 'Cryptocurrency',
    type: 'crypto',
    exchange: 'Binance',
    currency: 'USDT',
    isActive: true,
    region: 'Global',
    matchScore: 0.8
  },
  {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    description: 'Cryptocurrency',
    type: 'crypto',
    exchange: 'Binance',
    currency: 'USDT',
    isActive: true,
    region: 'Global',
    matchScore: 0.75
  },
  {
    symbol: 'EURUSD',
    name: 'Euro/US Dollar',
    description: 'Currency pair',
    type: 'forex',
    exchange: 'Forex',
    currency: 'USD',
    isActive: true,
    region: 'Global',
    matchScore: 0.7
  }
]