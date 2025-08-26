/**
 * Symbol Search Hook for NovaSignal
 * Custom React hook for debounced symbol searching with caching and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { searchSymbols } from '../services/api'
import { 
  SymbolSearchResult, 
  SymbolSearchParams, 
  SymbolSearchState 
} from '../types/symbol'

// ============================================================================
// Hook Configuration
// ============================================================================

const DEFAULT_DEBOUNCE_DELAY = 300 // 300ms delay
const MIN_QUERY_LENGTH = 1 // Minimum characters to trigger search
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache

// ============================================================================
// Cache Implementation
// ============================================================================

interface CacheEntry {
  data: SymbolSearchResult[]
  timestamp: number
}

const searchCache = new Map<string, CacheEntry>()

const getCacheKey = (params: SymbolSearchParams): string => {
  return JSON.stringify({
    query: params.query.toLowerCase().trim(),
    market: params.market,
    limit: params.limit,
    includeInactive: params.includeInactive
  })
}

const getCachedResults = (params: SymbolSearchParams): SymbolSearchResult[] | null => {
  const key = getCacheKey(params)
  const entry = searchCache.get(key)
  
  if (!entry) return null
  
  const isExpired = Date.now() - entry.timestamp > CACHE_DURATION
  if (isExpired) {
    searchCache.delete(key)
    return null
  }
  
  return entry.data
}

const setCachedResults = (params: SymbolSearchParams, data: SymbolSearchResult[]): void => {
  const key = getCacheKey(params)
  searchCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

// ============================================================================
// Custom Hook
// ============================================================================

export interface UseSymbolSearchOptions {
  /** Debounce delay in milliseconds */
  debounceDelay?: number
  /** Minimum query length to trigger search */
  minQueryLength?: number
  /** Default market filter */
  defaultMarket?: SymbolSearchParams['market']
  /** Default result limit */
  defaultLimit?: number
  /** Include inactive symbols by default */
  defaultIncludeInactive?: boolean
  /** Enable caching */
  enableCache?: boolean
}

export interface UseSymbolSearchReturn extends SymbolSearchState {
  /** Search function */
  search: (query: string, options?: Partial<SymbolSearchParams>) => void
  /** Clear search results */
  clearResults: () => void
  /** Clear search error */
  clearError: () => void
  /** Manually trigger search with current query */
  refetch: () => void
}

/**
 * Custom hook for symbol search with debouncing and caching
 */
export const useSymbolSearch = (
  options: UseSymbolSearchOptions = {}
): UseSymbolSearchReturn => {
  const {
    debounceDelay = DEFAULT_DEBOUNCE_DELAY,
    minQueryLength = MIN_QUERY_LENGTH,
    defaultMarket,
    defaultLimit = 10,
    defaultIncludeInactive = true,
    enableCache = true
  } = options

  // ============================================================================
  // State Management
  // ============================================================================

  const [state, setState] = useState<SymbolSearchState>({
    results: [],
    isLoading: false,
    error: null,
    query: '',
    hasSearched: false
  })

  // ============================================================================
  // Refs for Cleanup
  // ============================================================================

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
  const currentRequestId = useRef<number>(0)

  // ============================================================================
  // Search Function
  // ============================================================================

  const performSearch = useCallback(async (
    query: string, 
    searchOptions: Partial<SymbolSearchParams> = {}
  ) => {
    const trimmedQuery = query.trim()
    
    // Don't search if query is too short
    if (trimmedQuery.length < minQueryLength) {
      setState(prev => ({
        ...prev,
        results: [],
        hasSearched: false
      }))
      return
    }

    // Prepare search parameters
    const searchParams: SymbolSearchParams = {
      query: trimmedQuery,
      market: searchOptions.market || defaultMarket,
      limit: searchOptions.limit || defaultLimit,
      includeInactive: searchOptions.includeInactive ?? defaultIncludeInactive
    }

    // Check cache first
    if (enableCache) {
      const cachedResults = getCachedResults(searchParams)
      if (cachedResults) {
        setState(prev => ({
          ...prev,
          results: cachedResults,
          query: trimmedQuery,
          hasSearched: true,
          error: null,
          isLoading: false
        }))
        return
      }
    }

    // Set loading state
    setState(prev => ({
      ...prev,
      isLoading: true
    }))

    // Generate unique request ID to handle race conditions
    const requestId = ++currentRequestId.current

    try {
      const response = await searchSymbols(searchParams)
      
      // Check if this is still the current request
      if (requestId !== currentRequestId.current) {
        return // Ignore outdated requests
      }

      // Cache results if enabled
      if (enableCache) {
        setCachedResults(searchParams, response.symbols)
      }

      setState(prev => ({
        ...prev,
        results: response.symbols,
        isLoading: false,
        hasSearched: true,
        error: null
      }))
    } catch (error) {
      // Check if this is still the current request
      if (requestId !== currentRequestId.current) {
        return // Ignore outdated requests
      }

      const errorMessage = error instanceof Error ? error.message : 'Search failed'
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasSearched: true,
        error: errorMessage,
        results: []
      }))
    }
  }, [minQueryLength, defaultMarket, defaultLimit, defaultIncludeInactive, enableCache])

  // ============================================================================
  // Debounced Search Function
  // ============================================================================

  const search = useCallback((
    query: string, 
    searchOptions: Partial<SymbolSearchParams> = {}
  ) => {
    const trimmedQuery = query.trim()
    
    // Update query state immediately
    setState(prev => ({
      ...prev,
      query: trimmedQuery,
      error: null // Clear error on new search
    }))

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      performSearch(query, searchOptions)
    }, debounceDelay)
  }, [performSearch, debounceDelay])

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      query: '',
      hasSearched: false,
      error: null
    }))
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }))
  }, [])

  const refetch = useCallback(() => {
    if (state.query) {
      performSearch(state.query)
    }
  }, [state.query, performSearch])

  // ============================================================================
  // Cleanup Effect
  // ============================================================================

  useEffect(() => {
    return () => {
      // Cleanup timeout on unmount
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [])

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    ...state,
    search,
    clearResults,
    clearError,
    refetch
  }
}

// ============================================================================
// Cache Management Utilities
// ============================================================================

/**
 * Clear all cached search results
 */
export const clearSearchCache = (): void => {
  searchCache.clear()
}

/**
 * Get cache statistics
 */
export const getSearchCacheStats = (): { size: number; keys: string[] } => {
  return {
    size: searchCache.size,
    keys: Array.from(searchCache.keys())
  }
}