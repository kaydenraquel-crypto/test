/**
 * useSymbolSearch Hook Tests
 * Test suite for the symbol search custom hook
 */

import { renderHook, waitFor, act } from '@testing-library/react'
import { useSymbolSearch, clearSearchCache } from '../useSymbolSearch'
import { searchSymbols } from '../../services/api'
import { SymbolSearchResult } from '../../types/symbol'

// ============================================================================
// Mock Dependencies
// ============================================================================

import { vi } from 'vitest'

vi.mock('../../services/api', () => ({
  searchSymbols: vi.fn()
}))

const mockSearchSymbols = searchSymbols as ReturnType<typeof vi.fn>

// ============================================================================
// Test Data
// ============================================================================

const mockSymbolResults: SymbolSearchResult[] = [
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
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    description: 'Electric vehicle manufacturer',
    type: 'stocks',
    exchange: 'NASDAQ',
    currency: 'USD',
    isActive: true,
    region: 'US',
    matchScore: 0.85
  }
]

const mockApiResponse = {
  symbols: mockSymbolResults,
  totalResults: mockSymbolResults.length,
  searchTime: 100,
  query: 'test'
}

// ============================================================================
// Test Utilities
// ============================================================================

const waitForDebounce = () => new Promise(resolve => setTimeout(resolve, 350))

// ============================================================================
// Test Suites
// ============================================================================

describe('useSymbolSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearSearchCache()
    mockSearchSymbols.mockResolvedValue(mockApiResponse)
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  // ============================================================================
  // Initial State Tests
  // ============================================================================

  describe('Initial State', () => {
    it('returns initial state correctly', () => {
      const { result } = renderHook(() => useSymbolSearch())

      expect(result.current.results).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(result.current.query).toBe('')
      expect(result.current.hasSearched).toBe(false)
      expect(typeof result.current.search).toBe('function')
      expect(typeof result.current.clearResults).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
      expect(typeof result.current.refetch).toBe('function')
    })

    it('accepts custom options', () => {
      const options = {
        defaultMarket: 'crypto' as const,
        defaultLimit: 5,
        debounceDelay: 500
      }

      const { result } = renderHook(() => useSymbolSearch(options))

      expect(result.current.results).toEqual([])
      expect(result.current.isLoading).toBe(false)
    })
  })

  // ============================================================================
  // Search Functionality Tests
  // ============================================================================

  describe('Search Functionality', () => {
    it('performs search with debouncing', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      act(() => {
        result.current.search('AAPL')
      })

      expect(result.current.query).toBe('AAPL')
      expect(result.current.isLoading).toBe(false) // Not loading yet due to debounce

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(mockSearchSymbols).toHaveBeenCalledWith({
          query: 'AAPL',
          market: undefined,
          limit: 10,
          includeInactive: true
        })
      })

      await waitFor(() => {
        expect(result.current.results).toEqual(mockSymbolResults)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.hasSearched).toBe(true)
      })
    })

    it('cancels previous search when new search is triggered', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      act(() => {
        result.current.search('AA')
      })

      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      // Should only search for 'AAPL', not 'AA'
      await waitFor(() => {
        expect(mockSearchSymbols).toHaveBeenCalledTimes(1)
        expect(mockSearchSymbols).toHaveBeenCalledWith({
          query: 'AAPL',
          market: undefined,
          limit: 10,
          includeInactive: true
        })
      })
    })

    it('does not search for queries shorter than minimum length', async () => {
      const { result } = renderHook(() => useSymbolSearch({ minQueryLength: 2 }))

      act(() => {
        result.current.search('A')
      })

      await act(async () => {
        await waitForDebounce()
      })

      expect(mockSearchSymbols).not.toHaveBeenCalled()
      expect(result.current.results).toEqual([])
      expect(result.current.hasSearched).toBe(false)
    })

    it('trims whitespace from queries', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      act(() => {
        result.current.search('  AAPL  ')
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(mockSearchSymbols).toHaveBeenCalledWith({
          query: 'AAPL',
          market: undefined,
          limit: 10,
          includeInactive: true
        })
      })
    })

    it('applies custom search options', async () => {
      const { result } = renderHook(() => useSymbolSearch({
        defaultMarket: 'stocks',
        defaultLimit: 5
      }))

      act(() => {
        result.current.search('AAPL', { limit: 3 })
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(mockSearchSymbols).toHaveBeenCalledWith({
          query: 'AAPL',
          market: 'stocks',
          limit: 3,
          includeInactive: true
        })
      })
    })
  })

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('sets loading state during search', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      // Mock delayed response
      mockSearchSymbols.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockApiResponse), 100))
      )

      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      // Should be loading now
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Should finish loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.results).toEqual(mockSymbolResults)
      })
    })

    it('clears loading state on error', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      mockSearchSymbols.mockRejectedValue(new Error('Network error'))

      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBe('Network error')
      })
    })
  })

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      mockSearchSymbols.mockRejectedValue(new Error('API Error'))

      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('API Error')
        expect(result.current.results).toEqual([])
        expect(result.current.hasSearched).toBe(true)
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('handles non-Error exceptions', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      mockSearchSymbols.mockRejectedValue('String error')

      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Search failed')
      })
    })

    it('clears previous errors on new search', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      // First search fails
      mockSearchSymbols.mockRejectedValueOnce(new Error('First error'))

      act(() => {
        result.current.search('FAIL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('First error')
      })

      // Second search succeeds
      mockSearchSymbols.mockResolvedValue(mockApiResponse)

      act(() => {
        result.current.search('AAPL')
      })

      expect(result.current.error).toBe(null)
    })
  })

  // ============================================================================
  // Cache Tests
  // ============================================================================

  describe('Caching', () => {
    it('caches search results', async () => {
      const { result } = renderHook(() => useSymbolSearch({ enableCache: true }))

      // First search
      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(result.current.results).toEqual(mockSymbolResults)
      })

      // Second identical search should use cache
      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      // API should only be called once
      expect(mockSearchSymbols).toHaveBeenCalledTimes(1)
    })

    it('respects cache disabled option', async () => {
      const { result } = renderHook(() => useSymbolSearch({ enableCache: false }))

      // First search
      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(result.current.results).toEqual(mockSymbolResults)
      })

      // Second search should call API again
      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      expect(mockSearchSymbols).toHaveBeenCalledTimes(2)
    })
  })

  // ============================================================================
  // Utility Function Tests
  // ============================================================================

  describe('Utility Functions', () => {
    it('clears results', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      // First perform a search
      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(result.current.results).toEqual(mockSymbolResults)
        expect(result.current.hasSearched).toBe(true)
      })

      // Then clear results
      act(() => {
        result.current.clearResults()
      })

      expect(result.current.results).toEqual([])
      expect(result.current.query).toBe('')
      expect(result.current.hasSearched).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('clears error only', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      mockSearchSymbols.mockRejectedValue(new Error('Test error'))

      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Test error')
      })

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
      // Other state should remain
      expect(result.current.hasSearched).toBe(true)
    })

    it('refetches with current query', async () => {
      const { result } = renderHook(() => useSymbolSearch({ enableCache: false }))

      // First search
      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      await waitFor(() => {
        expect(result.current.results).toEqual(mockSymbolResults)
      })

      expect(mockSearchSymbols).toHaveBeenCalledTimes(1)

      // Refetch should call API again
      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(mockSearchSymbols).toHaveBeenCalledTimes(2)
      })
    })

    it('does not refetch without query', () => {
      const { result } = renderHook(() => useSymbolSearch())

      act(() => {
        result.current.refetch()
      })

      expect(mockSearchSymbols).not.toHaveBeenCalled()
    })
  })

  // ============================================================================
  // Race Condition Tests
  // ============================================================================

  describe('Race Conditions', () => {
    it('ignores outdated API responses', async () => {
      const { result } = renderHook(() => useSymbolSearch())

      let resolveFirst: (value: any) => void
      let resolveSecond: (value: any) => void

      const firstPromise = new Promise(resolve => { resolveFirst = resolve })
      const secondPromise = new Promise(resolve => { resolveSecond = resolve })

      mockSearchSymbols
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise)

      // Start first search
      act(() => {
        result.current.search('AA')
      })

      await act(async () => {
        await waitForDebounce()
      })

      // Start second search
      act(() => {
        result.current.search('AAPL')
      })

      await act(async () => {
        await waitForDebounce()
      })

      // Resolve second search first (newer request)
      act(() => {
        resolveSecond(mockApiResponse)
      })

      await waitFor(() => {
        expect(result.current.results).toEqual(mockSymbolResults)
      })

      // Resolve first search (older request) - should be ignored
      act(() => {
        resolveFirst({
          symbols: [{ symbol: 'OLD', name: 'Old Result' }],
          totalResults: 1,
          searchTime: 50,
          query: 'AA'
        })
      })

      // Should still have the newer results
      await waitFor(() => {
        expect(result.current.results).toEqual(mockSymbolResults)
      })
    })
  })
})