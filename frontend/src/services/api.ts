/**
 * API Service for NovaSignal
 * Centralized API client for all backend communications
 */

import { SymbolSearchParams, SymbolSearchResponse, MOCK_SYMBOLS } from '../types/symbol'

// ============================================================================
// API Configuration
// ============================================================================

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8000/api'
const API_TIMEOUT = 10000 // 10 seconds

/**
 * API client with error handling and type safety
 */
class APIClient {
  private baseURL: string
  private timeout: number

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  /**
   * Generic request method with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    config.signal = controller.signal

    try {
      const response = await fetch(url, config)
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * GET request
   */
  private async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    return this.request<T>(url.pathname + url.search)
  }

  /**
   * Search for symbols
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

      return await this.get<SymbolSearchResponse>('/symbols', searchParams)
    } catch (error) {
      console.warn('Symbol search API failed, using mock data:', error)
      
      // Return mock data as fallback
      const filteredSymbols = this.filterMockSymbols(params)
      
      return {
        symbols: filteredSymbols,
        totalResults: filteredSymbols.length,
        searchTime: Math.random() * 100 + 50, // Simulate search time
        query: params.query
      }
    }
  }

  /**
   * Filter mock symbols based on search parameters
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
}

// ============================================================================
// Export API client instance
// ============================================================================

export const apiClient = new APIClient()

// ============================================================================
// Convenience functions
// ============================================================================

/**
 * Search for symbols - convenience wrapper
 */
export const searchSymbols = (params: SymbolSearchParams): Promise<SymbolSearchResponse> => {
  return apiClient.searchSymbols(params)
}

// Export types for external use
export type { SymbolSearchParams, SymbolSearchResponse } from '../types/symbol'