/**
 * Enhanced HTTP Client for NovaSignal
 * Comprehensive error handling, retry logic, and network awareness
 */

import { 
  RequestConfig, 
  EnhancedError, 
  ErrorCategory, 
  ErrorSeverity, 
  RetryConfig,
  NetworkStatus,
  QueuedRequest,
  ErrorContext
} from '../types/errors'

// ============================================================================
// Constants
// ============================================================================

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8000/api'
const MAX_OFFLINE_QUEUE_SIZE = 50
const OFFLINE_REQUEST_EXPIRY = 5 * 60 * 1000 // 5 minutes
const DEFAULT_REQUEST_TIMEOUT = 10000 // 10 seconds
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: 3,
  delay: 1000,
  exponentialBackoff: true,
  maxDelay: 10000,
}

// ============================================================================
// Enhanced API Client
// ============================================================================

class ApiClient {
  private baseURL: string
  private defaultTimeout: number
  private defaultRetryConfig: RetryConfig
  private offlineQueue: QueuedRequest[] = []
  private requestIdCounter = 0
  private activeRequests = new Map<string, AbortController>()

  constructor(
    baseURL: string = API_BASE_URL, 
    timeout: number = DEFAULT_REQUEST_TIMEOUT,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
  ) {
    this.baseURL = baseURL
    this.defaultTimeout = timeout
    this.defaultRetryConfig = retryConfig
    this.setupOfflineHandling()
  }

  /**
   * Main request method with comprehensive error handling
   */
  async request<T>(config: RequestConfig): Promise<T> {
    const requestId = this.generateRequestId()
    const finalConfig = this.mergeConfig(config)
    
    // Add correlation ID if not provided
    if (!finalConfig.correlationId) {
      finalConfig.correlationId = this.generateCorrelationId()
    }

    // Check network status
    if (!this.isOnline() && this.shouldQueueOffline(finalConfig)) {
      return this.queueOfflineRequest<T>(finalConfig)
    }

    // Execute request with retry logic
    return this.retryRequest<T>(finalConfig, requestId, 1)
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest<T>(
    config: RequestConfig,
    requestId: string,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await this.executeRequest<T>(config, requestId)
    } catch (error) {
      const enhancedError = this.enhanceError(error, config, attempt)
      
      if (this.shouldRetry(enhancedError, attempt, config.retry)) {
        const delay = this.calculateBackoff(attempt, config.retry)
        await this.delay(delay)
        return this.retryRequest<T>(config, requestId, attempt + 1)
      }
      
      throw enhancedError
    }
  }

  /**
   * Execute HTTP request
   */
  private async executeRequest<T>(config: RequestConfig, requestId: string): Promise<T> {
    const url = this.buildUrl(config.url, config.params)
    const controller = new AbortController()
    
    // Track active request
    this.activeRequests.set(requestId, controller)
    
    // Setup timeout
    const timeout = config.timeout || this.defaultTimeout
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const fetchConfig: RequestInit = {
      method: config.method || 'GET',
      headers: this.buildHeaders(config.headers, config.correlationId),
      body: config.data ? JSON.stringify(config.data) : undefined,
      signal: controller.signal,
    }

    try {
      const response = await fetch(url, fetchConfig)
      clearTimeout(timeoutId)
      this.activeRequests.delete(requestId)

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response)
        throw this.createApiError(response.status, errorData, config.correlationId)
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return response.text() as unknown as T
      }
    } catch (error) {
      clearTimeout(timeoutId)
      this.activeRequests.delete(requestId)

      // Handle fetch errors (network, abort, etc.)
      if (error instanceof DOMException) {
        if (error.name === 'AbortError') {
          throw this.createTimeoutError(config.correlationId)
        }
      }

      // Network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw this.createNetworkError(error.message, config.correlationId)
      }

      throw error
    }
  }

  /**
   * HTTP method shortcuts
   */
  async get<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  async post<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  async put<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  async patch<T>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }

  async delete<T>(url: string, config?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }

  // ============================================================================
  // Error Enhancement and Categorization
  // ============================================================================

  /**
   * Enhance error with categorization and context
   */
  private enhanceError(error: any, config: RequestConfig, attempt: number): EnhancedError {
    const category = this.categorizeError(error)
    const severity = this.determineSeverity(category, error)
    
    const enhancedError = new Error(this.extractErrorMessage(error)) as EnhancedError
    enhancedError.name = 'EnhancedError'
    enhancedError.originalError = error
    enhancedError.category = category
    enhancedError.severity = severity
    enhancedError.retryable = this.isRetryableError(error)
    enhancedError.status = error.status || error.statusCode
    enhancedError.correlationId = config.correlationId
    enhancedError.timestamp = Date.now()
    enhancedError.context = {
      url: config.url,
      method: config.method,
      attempt,
      userAgent: navigator.userAgent,
      online: navigator.onLine,
    }

    return enhancedError
  }

  /**
   * Categorize error based on type and properties
   */
  private categorizeError(error: any): ErrorCategory {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return ErrorCategory.NETWORK
    }

    // Timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      return ErrorCategory.TIMEOUT
    }

    // HTTP status code categorization
    if (error.status || error.statusCode) {
      const status = error.status || error.statusCode
      
      if (status === 401) return ErrorCategory.AUTHENTICATION
      if (status === 403) return ErrorCategory.AUTHORIZATION
      if (status === 429) return ErrorCategory.RATE_LIMIT
      if (status >= 400 && status < 500) return ErrorCategory.VALIDATION
      if (status >= 500) return ErrorCategory.SERVER
    }

    // API error categorization
    if (error.error) {
      const errorType = error.error.toLowerCase()
      if (errorType.includes('network')) return ErrorCategory.NETWORK
      if (errorType.includes('timeout')) return ErrorCategory.TIMEOUT
      if (errorType.includes('auth')) return ErrorCategory.AUTHENTICATION
      if (errorType.includes('rate')) return ErrorCategory.RATE_LIMIT
      if (errorType.includes('validation')) return ErrorCategory.VALIDATION
    }

    return ErrorCategory.UNKNOWN
  }

  /**
   * Determine error severity
   */
  private determineSeverity(category: ErrorCategory, error: any): ErrorSeverity {
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
        return ErrorSeverity.MEDIUM
      
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return ErrorSeverity.HIGH
      
      case ErrorCategory.SERVER:
        return error.status >= 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH
      
      case ErrorCategory.RATE_LIMIT:
        return ErrorSeverity.MEDIUM
      
      case ErrorCategory.VALIDATION:
        return ErrorSeverity.LOW
      
      default:
        return ErrorSeverity.MEDIUM
    }
  }

  // ============================================================================
  // Retry Logic
  // ============================================================================

  /**
   * Determine if error should be retried
   */
  private shouldRetry(error: EnhancedError, attempt: number, retryConfig?: RetryConfig): boolean {
    const config = retryConfig || this.defaultRetryConfig
    
    if (attempt >= config.attempts) {
      return false
    }

    // Custom retry condition
    if (config.shouldRetry) {
      return config.shouldRetry(error, attempt)
    }

    // Default retry logic
    switch (error.category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
        return true
      
      case ErrorCategory.SERVER:
        return error.status ? error.status >= 500 : true
      
      case ErrorCategory.RATE_LIMIT:
        return true
      
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
      case ErrorCategory.VALIDATION:
        return false
      
      default:
        return false
    }
  }

  /**
   * Calculate backoff delay
   */
  private calculateBackoff(attempt: number, retryConfig?: RetryConfig): number {
    const config = retryConfig || this.defaultRetryConfig
    const baseDelay = config.delay
    
    if (config.exponentialBackoff) {
      const delay = baseDelay * Math.pow(2, attempt - 1)
      return Math.min(delay, config.maxDelay || 30000)
    }
    
    return baseDelay
  }

  // ============================================================================
  // Offline Queue Management
  // ============================================================================

  /**
   * Setup offline/online event handling
   */
  private setupOfflineHandling(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processOfflineQueue())
      window.addEventListener('offline', () => this.onOffline())
    }
  }

  /**
   * Queue request for offline handling
   */
  private async queueOfflineRequest<T>(config: RequestConfig): Promise<T> {
    if (this.offlineQueue.length >= MAX_OFFLINE_QUEUE_SIZE) {
      throw this.createOfflineQueueFullError()
    }

    const queuedRequest: QueuedRequest = {
      id: this.generateRequestId(),
      config,
      timestamp: Date.now(),
      attempts: 0,
      priority: 'normal',
      expiresAt: Date.now() + OFFLINE_REQUEST_EXPIRY,
    }

    this.offlineQueue.push(queuedRequest)
    
    // Return a promise that rejects immediately for offline requests
    throw this.createOfflineError(config.correlationId)
  }

  /**
   * Process offline queue when coming back online
   */
  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return

    const now = Date.now()
    const validRequests = this.offlineQueue.filter(req => 
      !req.expiresAt || req.expiresAt > now
    )

    this.offlineQueue = []

    // Process requests in order
    for (const request of validRequests) {
      try {
        await this.request(request.config)
      } catch (error) {
        console.warn('Failed to replay offline request:', error)
      }
    }
  }

  /**
   * Handle going offline
   */
  private onOffline(): void {
    // Abort all active requests
    this.activeRequests.forEach(controller => controller.abort())
    this.activeRequests.clear()
  }

  // ============================================================================
  // Network Status
  // ============================================================================

  /**
   * Check if client is online
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  /**
   * Get network status information
   */
  getNetworkStatus(): NetworkStatus {
    const connection = (navigator as any)?.connection || (navigator as any)?.mozConnection || (navigator as any)?.webkitConnection
    
    return {
      isOnline: this.isOnline(),
      connectionType: connection?.type,
      effectiveType: connection?.effectiveType,
      rtt: connection?.rtt,
      downlink: connection?.downlink,
      lastOnline: this.isOnline() ? Date.now() : undefined,
      lastOffline: !this.isOnline() ? Date.now() : undefined,
    }
  }

  /**
   * Check if request should be queued when offline
   */
  private shouldQueueOffline(config: RequestConfig): boolean {
    // Only queue GET requests and non-critical operations
    const method = config.method || 'GET'
    return method === 'GET' || method === 'HEAD'
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Merge request configuration with defaults
   */
  private mergeConfig(config: RequestConfig): RequestConfig {
    return {
      timeout: this.defaultTimeout,
      retry: this.defaultRetryConfig,
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    }
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    return url.toString()
  }

  /**
   * Build request headers with correlation ID
   */
  private buildHeaders(headers?: Record<string, string>, correlationId?: string): Record<string, string> {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (correlationId) {
      defaultHeaders['X-Correlation-ID'] = correlationId
    }

    return { ...defaultHeaders, ...headers }
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return { message: await response.text() }
      }
    } catch {
      return { message: `HTTP ${response.status} ${response.statusText}` }
    }
  }

  /**
   * Create API error object
   */
  private createApiError(status: number, errorData: any, correlationId?: string): Error {
    const error = new Error(errorData.message || `HTTP ${status}`) as any
    error.status = status
    error.error = errorData.error || 'api_error'
    error.correlation_id = correlationId || errorData.correlation_id
    error.timestamp = new Date().toISOString()
    error.details = errorData.details
    return error
  }

  /**
   * Create network error
   */
  private createNetworkError(message: string, correlationId?: string): Error {
    const error = new Error('Network connection failed') as any
    error.category = ErrorCategory.NETWORK
    error.correlationId = correlationId
    error.originalMessage = message
    return error
  }

  /**
   * Create timeout error
   */
  private createTimeoutError(correlationId?: string): Error {
    const error = new Error('Request timeout') as any
    error.category = ErrorCategory.TIMEOUT
    error.correlationId = correlationId
    return error
  }

  /**
   * Create offline error
   */
  private createOfflineError(correlationId?: string): Error {
    const error = new Error('Application is offline') as any
    error.category = ErrorCategory.NETWORK
    error.correlationId = correlationId
    error.offline = true
    return error
  }

  /**
   * Create offline queue full error
   */
  private createOfflineQueueFullError(): Error {
    const error = new Error('Offline queue is full') as any
    error.category = ErrorCategory.NETWORK
    error.queueFull = true
    return error
  }

  /**
   * Extract error message from various error types
   */
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error
    if (error.message) return error.message
    if (error.error) return error.error
    return 'Unknown error occurred'
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error.status) {
      // 4xx errors are generally not retryable (except 429)
      if (error.status >= 400 && error.status < 500) {
        return error.status === 429 // Rate limit
      }
      // 5xx errors are retryable
      return error.status >= 500
    }
    
    // Network and timeout errors are retryable
    return error instanceof TypeError || 
           (error instanceof DOMException && error.name === 'AbortError')
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${++this.requestIdCounter}_${Date.now()}`
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // ============================================================================
  // Request Management
  // ============================================================================

  /**
   * Abort specific request
   */
  abortRequest(requestId: string): void {
    const controller = this.activeRequests.get(requestId)
    if (controller) {
      controller.abort()
      this.activeRequests.delete(requestId)
    }
  }

  /**
   * Abort all active requests
   */
  abortAllRequests(): void {
    this.activeRequests.forEach(controller => controller.abort())
    this.activeRequests.clear()
  }

  /**
   * Get active request count
   */
  getActiveRequestCount(): number {
    return this.activeRequests.size
  }

  /**
   * Get offline queue status
   */
  getOfflineQueueStatus() {
    return {
      size: this.offlineQueue.length,
      pending: this.offlineQueue.length,
      failed: 0,
      replayed: 0,
      processing: false,
    }
  }
}

// ============================================================================
// Export enhanced API client
// ============================================================================

export const httpClient = new ApiClient()
export { ApiClient }

// Re-export types
export type { 
  RequestConfig, 
  EnhancedError, 
  ErrorCategory, 
  ErrorSeverity, 
  RetryConfig,
  NetworkStatus,
  QueuedRequest 
} from '../types/errors'