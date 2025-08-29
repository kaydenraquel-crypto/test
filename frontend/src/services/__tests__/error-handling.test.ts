/**
 * Error Handling System Tests
 * Comprehensive tests for error handling, retry logic, and user notifications
 */

import { describe, it, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest'
import { httpClient, ApiClient } from '../http'
import { ErrorHandler, ErrorHandlerService } from '../ErrorHandler'
import { enhancedApiClient } from '../api-enhanced'
import { 
  ErrorCategory, 
  ErrorSeverity, 
  EnhancedError,
  RetryConfig 
} from '../../types/errors'

// Mock fetch for testing
global.fetch = vi.fn()
const mockFetch = global.fetch as MockedFunction<typeof fetch>

// Mock navigator for network tests
Object.defineProperty(global.navigator, 'onLine', {
  writable: true,
  value: true,
})

describe('Error Handling System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ErrorHandler.clearErrorLog()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Error Categorization', () => {
    it('should categorize network errors correctly', () => {
      const networkError = new TypeError('fetch failed')
      const category = ErrorHandler.categorizeError(networkError)
      expect(category).toBe(ErrorCategory.NETWORK)
    })

    it('should categorize timeout errors correctly', () => {
      const timeoutError = new DOMException('Aborted', 'AbortError')
      const category = ErrorHandler.categorizeError(timeoutError)
      expect(category).toBe(ErrorCategory.TIMEOUT)
    })

    it('should categorize API errors by status code', () => {
      const authError = { status: 401, message: 'Unauthorized' }
      const category = ErrorHandler.categorizeError(authError)
      expect(category).toBe(ErrorCategory.AUTHENTICATION)

      const serverError = { status: 500, message: 'Internal Server Error' }
      const serverCategory = ErrorHandler.categorizeError(serverError)
      expect(serverCategory).toBe(ErrorCategory.SERVER)

      const rateLimitError = { status: 429, message: 'Rate Limited' }
      const rateLimitCategory = ErrorHandler.categorizeError(rateLimitError)
      expect(rateLimitCategory).toBe(ErrorCategory.RATE_LIMIT)
    })
  })

  describe('Error Enhancement', () => {
    it('should enhance basic errors with metadata', () => {
      const basicError = new Error('Test error')
      const enhanced = ErrorHandler.handleApiError(basicError)
      
      expect(enhanced.category).toBeDefined()
      expect(enhanced.severity).toBeDefined()
      expect(enhanced.timestamp).toBeDefined()
      expect(enhanced.correlationId).toBeDefined()
      expect(enhanced.retryable).toBeDefined()
    })

    it('should preserve correlation IDs', () => {
      const apiError = {
        status: 500,
        message: 'Server error',
        correlation_id: 'test-correlation-123'
      }
      
      const enhanced = ErrorHandler.handleApiError(apiError)
      expect(enhanced.correlationId).toBe('test-correlation-123')
    })
  })

  describe('Retry Logic', () => {
    it('should determine retry eligibility correctly', () => {
      // Network errors should be retryable
      const networkError = ErrorHandler.handleApiError(new TypeError('fetch failed'))
      expect(ErrorHandler.shouldRetry(networkError)).toBe(true)

      // Authentication errors should not be retryable
      const authError = ErrorHandler.handleApiError({ status: 401 })
      expect(ErrorHandler.shouldRetry(authError)).toBe(false)

      // Server errors should be retryable
      const serverError = ErrorHandler.handleApiError({ status: 500 })
      expect(ErrorHandler.shouldRetry(serverError)).toBe(true)
    })

    it('should calculate exponential backoff correctly', () => {
      const config: RetryConfig = {
        attempts: 3,
        delay: 1000,
        exponentialBackoff: true,
        maxDelay: 10000
      }

      const error = ErrorHandler.handleApiError({ status: 500 })
      
      const delay1 = ErrorHandler.getRetryDelay(error, 1, config)
      const delay2 = ErrorHandler.getRetryDelay(error, 2, config)
      const delay3 = ErrorHandler.getRetryDelay(error, 3, config)

      expect(delay2).toBeGreaterThan(delay1)
      expect(delay3).toBeGreaterThan(delay2)
      expect(delay3).toBeLessThanOrEqual(config.maxDelay!)
    })
  })

  describe('HTTP Client', () => {
    it('should retry failed requests', async () => {
      // Mock first two calls to fail, third to succeed
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response)

      const client = new ApiClient()
      const result = await client.get('/test', {
        retry: {
          attempts: 3,
          delay: 100,
          exponentialBackoff: false,
        }
      })

      expect(result).toEqual({ success: true })
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 50)
        })
      )

      const client = new ApiClient()
      
      await expect(client.get('/test', { timeout: 100 }))
        .rejects
        .toThrow()
    })

    it('should abort requests on timeout', async () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
      
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      )

      const client = new ApiClient()
      
      try {
        await client.get('/test', { timeout: 100 })
      } catch (error) {
        // Expected to timeout
      }

      expect(abortSpy).toHaveBeenCalled()
    })
  })

  describe('Network Status Integration', () => {
    it('should queue requests when offline', async () => {
      // Set offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      const client = new ApiClient()
      
      // This should queue the request instead of executing
      await expect(client.get('/test')).rejects.toThrow('offline')
      
      expect(client.getOfflineQueueStatus().size).toBeGreaterThan(0)
    })

    it('should process queued requests when coming online', async () => {
      const client = new ApiClient()
      
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      // Queue a request
      try {
        await client.get('/test')
      } catch (error) {
        // Expected to fail offline
      }

      // Go online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response)

      // Simulate online event
      window.dispatchEvent(new Event('online'))

      // Allow time for queue processing
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('API Client Integration', () => {
    it('should handle symbol search with fallback', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API unavailable'))

      const result = await enhancedApiClient.searchSymbols({
        query: 'AAPL',
        limit: 5,
      })

      // Should return mock data as fallback
      expect(result.symbols).toBeDefined()
      expect(result.fallback).toBe(true)
      expect(result.query).toBe('AAPL')
    })

    it('should throw enhanced errors for critical failures', async () => {
      mockFetch.mockRejectedValueOnce({ 
        status: 500, 
        message: 'Critical server error' 
      })

      await expect(
        enhancedApiClient.getHistoricalData('AAPL', '1D')
      ).rejects.toMatchObject({
        category: ErrorCategory.SERVER,
        severity: ErrorSeverity.CRITICAL,
      })
    })

    it('should handle real-time data requests with shorter timeouts', async () => {
      const startTime = Date.now()
      
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 10000)
        )
      )

      try {
        await enhancedApiClient.getQuote('AAPL')
      } catch (error) {
        const duration = Date.now() - startTime
        expect(duration).toBeLessThan(6000) // Should timeout in 5 seconds, not 10
      }
    })
  })

  describe('Error Statistics', () => {
    it('should track error frequency', () => {
      // Generate some errors
      ErrorHandler.handleApiError(new Error('Test error 1'))
      ErrorHandler.handleApiError(new Error('Test error 1'))
      ErrorHandler.handleApiError(new Error('Test error 2'))

      const stats = ErrorHandler.getErrorStats()
      
      expect(stats.totalErrors).toBe(3)
      expect(stats.topErrors.length).toBeGreaterThan(0)
      expect(stats.errorsByCategory).toBeDefined()
      expect(stats.errorsBySeverity).toBeDefined()
    })

    it('should provide recent error history', () => {
      // Generate several errors
      for (let i = 0; i < 5; i++) {
        ErrorHandler.handleApiError(new Error(`Test error ${i}`))
      }

      const stats = ErrorHandler.getErrorStats()
      expect(stats.recentErrors.length).toBe(5)
      
      // Verify chronological order
      for (let i = 1; i < stats.recentErrors.length; i++) {
        expect(stats.recentErrors[i].timestamp)
          .toBeGreaterThanOrEqual(stats.recentErrors[i - 1].timestamp)
      }
    })
  })

  describe('Notification Processing', () => {
    it('should determine notification requirements', () => {
      const networkError = ErrorHandler.handleApiError(
        new TypeError('fetch failed')
      )
      
      const notification = ErrorHandler.processForNotification(networkError)
      
      expect(notification.shouldNotify).toBe(true)
      expect(notification.severity).toBe(ErrorSeverity.MEDIUM)
      expect(notification.message).toContain('Connection problem')
      expect(notification.actionable).toBe(true)
    })

    it('should prevent notification spam', () => {
      const error = new Error('Repeated error')
      
      // Generate the same error multiple times
      for (let i = 0; i < 10; i++) {
        ErrorHandler.handleApiError(error)
      }

      const notification = ErrorHandler.processForNotification(
        ErrorHandler.handleApiError(error)
      )
      
      // Should eventually stop notifying for repeated errors
      expect(notification.shouldNotify).toBe(false)
    })
  })

  describe('Performance and Memory', () => {
    it('should limit error log size', () => {
      // Generate many errors to test log size limiting
      for (let i = 0; i < 2000; i++) {
        ErrorHandler.handleApiError(new Error(`Test error ${i}`))
      }

      const stats = ErrorHandler.getErrorStats()
      expect(stats.totalErrors).toBeLessThanOrEqual(1000) // Should be capped
    })

    it('should clean up aborted requests', async () => {
      const client = new ApiClient()
      
      // Start a request
      const requestPromise = client.get('/slow-endpoint', { timeout: 1000 })
      
      // Immediately abort all requests
      client.abortAllRequests()
      
      await expect(requestPromise).rejects.toThrow()
      expect(client.getActiveRequestCount()).toBe(0)
    })
  })

  describe('Integration Testing', () => {
    it('should handle complete error flow', async () => {
      // Mock a sequence: network error, retry, rate limit, final success
      mockFetch
        .mockRejectedValueOnce(new TypeError('fetch failed'))
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ 
            error: 'Rate limited',
            message: 'Too many requests' 
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
          headers: new Headers({ 'content-type': 'application/json' }),
        } as Response)

      const client = new ApiClient()
      
      const result = await client.get('/test', {
        retry: {
          attempts: 3,
          delay: 10,
          exponentialBackoff: true,
        }
      })

      expect(result).toEqual({ success: true })
      expect(mockFetch).toHaveBeenCalledTimes(3)
      
      // Check error tracking
      const stats = ErrorHandler.getErrorStats()
      expect(stats.totalErrors).toBeGreaterThan(0)
      expect(stats.errorsByCategory[ErrorCategory.NETWORK]).toBeGreaterThan(0)
      expect(stats.errorsByCategory[ErrorCategory.RATE_LIMIT]).toBeGreaterThan(0)
    })
  })
})

// ============================================================================
// Mock Helper Functions
// ============================================================================

function createMockResponse(data: any, status: number = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers({ 'content-type': 'application/json' }),
  } as Response
}

function createMockNetworkError(): TypeError {
  const error = new TypeError('fetch failed')
  error.cause = 'network'
  return error
}

function createMockTimeoutError(): DOMException {
  return new DOMException('The operation was aborted', 'AbortError')
}

export {
  createMockResponse,
  createMockNetworkError,
  createMockTimeoutError,
}