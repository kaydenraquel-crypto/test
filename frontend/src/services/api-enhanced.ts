/**
 * Enhanced API Service for NovaSignal
 * Centralized API client with comprehensive error handling, retry logic, and notifications
 */

import { SymbolSearchParams, SymbolSearchResponse, MOCK_SYMBOLS } from '../types/symbol'
import { httpClient } from './http'
import { ErrorHandler } from './ErrorHandler'
import { EnhancedError } from '../types/errors'

// ============================================================================
// Enhanced API Client
// ============================================================================

/**
 * Enhanced API client with comprehensive error handling
 */
class EnhancedAPIClient {
  private baseURL: string
  private timeout: number

  constructor(
    baseURL: string = process.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    timeout: number = 10000
  ) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  /**
   * Search for symbols with enhanced error handling and fallback
   */
  async searchSymbols(params: SymbolSearchParams): Promise<SymbolSearchResponse> {
    try {
      // Attempt real API call first
      const searchParams = {
        q: params.query,
        ...(params.market && { market: params.market }),
        ...(params.limit && { limit: params.limit.toString() }),
        ...(params.includeInactive && { include_inactive: params.includeInactive.toString() }),
      }

      const response = await httpClient.get<SymbolSearchResponse>('/symbols', { 
        params: searchParams,
        timeout: this.timeout,
        retry: {
          attempts: 3,
          delay: 1000,
          exponentialBackoff: true,
        }
      })

      return response
    } catch (error) {
      // Process error through error handler
      const enhancedError = ErrorHandler.handleApiError(error, {
        url: '/symbols',
        method: 'GET',
        params: params,
      })

      console.warn('Symbol search API failed, using mock data:', enhancedError.message)
      
      // Return mock data as fallback for non-critical errors
      if (enhancedError.retryable) {
        // For retryable errors, still throw to allow higher-level retry logic
        throw enhancedError
      }

      // For non-retryable errors, gracefully fallback to mock data
      const filteredSymbols = this.filterMockSymbols(params)
      
      return {
        symbols: filteredSymbols,
        totalResults: filteredSymbols.length,
        searchTime: Math.random() * 100 + 50, // Simulate search time
        query: params.query,
        fallback: true, // Indicate this is fallback data
      }
    }
  }

  /**
   * Get historical data with enhanced error handling
   */
  async getHistoricalData(symbol: string, timeframe: string, days?: number): Promise<any> {
    try {
      const params = {
        symbol,
        timeframe,
        ...(days && { days: days.toString() }),
      }

      return await httpClient.get(`/data/historical`, {
        params,
        timeout: this.timeout * 2, // Longer timeout for data requests
        retry: {
          attempts: 3,
          delay: 2000,
          exponentialBackoff: true,
        }
      })
    } catch (error) {
      const enhancedError = ErrorHandler.handleApiError(error, {
        url: '/data/historical',
        method: 'GET',
        symbol,
        timeframe,
      })
      
      throw enhancedError
    }
  }

  /**
   * Get real-time quote data
   */
  async getQuote(symbol: string): Promise<any> {
    try {
      return await httpClient.get(`/data/quote/${symbol}`, {
        timeout: 5000, // Shorter timeout for real-time data
        retry: {
          attempts: 2,
          delay: 500,
          exponentialBackoff: false,
        }
      })
    } catch (error) {
      const enhancedError = ErrorHandler.handleApiError(error, {
        url: `/data/quote/${symbol}`,
        method: 'GET',
        symbol,
        realTime: true,
      })
      
      throw enhancedError
    }
  }

  /**
   * Get market indicators
   */
  async getIndicators(symbol: string, indicators: string[], timeframe?: string): Promise<any> {
    try {
      const params = {
        symbol,
        indicators: indicators.join(','),
        ...(timeframe && { timeframe }),
      }

      return await httpClient.get('/analysis/indicators', {
        params,
        timeout: this.timeout,
        retry: {
          attempts: 3,
          delay: 1500,
          exponentialBackoff: true,
        }
      })
    } catch (error) {
      const enhancedError = ErrorHandler.handleApiError(error, {
        url: '/analysis/indicators',
        method: 'GET',
        symbol,
        indicators,
      })
      
      throw enhancedError
    }
  }

  /**
   * Get trading signals
   */
  async getSignals(symbol: string, timeframe?: string): Promise<any> {
    try {
      const params = {
        symbol,
        ...(timeframe && { timeframe }),
      }

      return await httpClient.get('/analysis/signals', {
        params,
        timeout: this.timeout,
        retry: {
          attempts: 2,
          delay: 2000,
          exponentialBackoff: true,
        }
      })
    } catch (error) {
      const enhancedError = ErrorHandler.handleApiError(error, {
        url: '/analysis/signals',
        method: 'GET',
        symbol,
        timeframe,
      })
      
      throw enhancedError
    }
  }

  /**
   * Get news related to symbol
   */
  async getNews(symbol?: string, limit?: number): Promise<any> {
    try {
      const params = {
        ...(symbol && { symbol }),
        ...(limit && { limit: limit.toString() }),
      }

      return await httpClient.get('/news', {
        params,
        timeout: this.timeout,
        retry: {
          attempts: 2,
          delay: 1000,
          exponentialBackoff: true,
        }
      })
    } catch (error) {
      const enhancedError = ErrorHandler.handleApiError(error, {
        url: '/news',
        method: 'GET',
        symbol,
      })
      
      throw enhancedError
    }
  }

  /**
   * Post user preferences
   */
  async saveUserPreferences(preferences: Record<string, any>): Promise<any> {
    try {
      return await httpClient.post('/user/preferences', preferences, {
        timeout: this.timeout,
        retry: {
          attempts: 3,
          delay: 1000,
          exponentialBackoff: true,
        }
      })
    } catch (error) {
      const enhancedError = ErrorHandler.handleApiError(error, {
        url: '/user/preferences',
        method: 'POST',
        dataSize: JSON.stringify(preferences).length,
      })
      
      throw enhancedError
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<any> {
    try {
      return await httpClient.get('/user/preferences', {
        timeout: this.timeout,
        retry: {
          attempts: 3,
          delay: 1000,
          exponentialBackoff: true,
        }
      })
    } catch (error) {
      const enhancedError = ErrorHandler.handleApiError(error, {
        url: '/user/preferences',
        method: 'GET',
      })
      
      throw enhancedError
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    try {
      return await httpClient.get('/health', {
        timeout: 3000,
        retry: {
          attempts: 1,
          delay: 500,
          exponentialBackoff: false,
        }
      })
    } catch (error) {
      const enhancedError = ErrorHandler.handleApiError(error, {
        url: '/health',
        method: 'GET',
        healthCheck: true,
      })
      
      throw enhancedError
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Filter mock symbols based on search parameters (fallback functionality)
   */
  private filterMockSymbols(params: SymbolSearchParams) {
    const { query, market, limit = 10, includeInactive = true } = params
    
    let filtered = MOCK_SYMBOLS.filter(symbol => {
      // Filter by active status
      if (!includeInactive && !symbol.isActive) {
        return false
      }

      // Filter by market type
      if (market && symbol.type !== market) {
        return false
      }

      // Filter by query (symbol or name contains query)
      const searchText = query.toLowerCase()
      return (
        symbol.symbol.toLowerCase().includes(searchText) ||
        symbol.name.toLowerCase().includes(searchText) ||
        (symbol.description && symbol.description.toLowerCase().includes(searchText))
      )
    })

    // Sort by match score (if available) or symbol name
    filtered.sort((a, b) => {
      if (a.matchScore && b.matchScore) {
        return b.matchScore - a.matchScore
      }
      return a.symbol.localeCompare(b.symbol)
    })

    // Apply limit
    return filtered.slice(0, limit)
  }

  /**
   * Get client status and metrics
   */
  getClientStatus() {
    return {
      baseURL: this.baseURL,
      timeout: this.timeout,
      networkStatus: httpClient.getNetworkStatus(),
      activeRequests: httpClient.getActiveRequestCount(),
      offlineQueue: httpClient.getOfflineQueueStatus(),
      errorStats: ErrorHandler.getErrorStats(),
    }
  }

  /**
   * Clear error history (for testing/debugging)
   */
  clearErrorHistory(): void {
    ErrorHandler.clearErrorLog()
  }
}

// ============================================================================
// Export enhanced API client instance
// ============================================================================

export const enhancedApiClient = new EnhancedAPIClient()

// ============================================================================
// Convenience functions with error handling
// ============================================================================

/**
 * Search for symbols with automatic error handling and user notifications
 */
export const searchSymbolsWithErrorHandling = async (
  params: SymbolSearchParams,
  notifyUser: boolean = true
): Promise<SymbolSearchResponse> => {
  try {
    return await enhancedApiClient.searchSymbols(params)
  } catch (error) {
    if (notifyUser && typeof window !== 'undefined') {
      // This would integrate with the notification hook
      console.warn('Symbol search failed, user should be notified:', error)
    }
    throw error
  }
}

/**
 * Get historical data with error handling
 */
export const getHistoricalDataWithErrorHandling = async (
  symbol: string,
  timeframe: string,
  days?: number,
  notifyUser: boolean = true
): Promise<any> => {
  try {
    return await enhancedApiClient.getHistoricalData(symbol, timeframe, days)
  } catch (error) {
    if (notifyUser && typeof window !== 'undefined') {
      console.warn('Historical data fetch failed, user should be notified:', error)
    }
    throw error
  }
}

/**
 * Get real-time quote with error handling
 */
export const getQuoteWithErrorHandling = async (
  symbol: string,
  notifyUser: boolean = false // Usually don't notify for real-time failures
): Promise<any> => {
  try {
    return await enhancedApiClient.getQuote(symbol)
  } catch (error) {
    if (notifyUser && typeof window !== 'undefined') {
      console.warn('Quote fetch failed, user should be notified:', error)
    }
    throw error
  }
}

// ============================================================================
// Export types and original client for backward compatibility
// ============================================================================

export { apiClient } from './api'
export type { SymbolSearchParams, SymbolSearchResponse } from '../types/symbol'

// Export enhanced client as default
export default enhancedApiClient