/**
 * Error Handler Service for NovaSignal
 * Centralized error processing, logging, and user notification
 */

import { 
  EnhancedError, 
  ErrorCategory, 
  ErrorSeverity, 
  ErrorContext, 
  ErrorAnalyticsEvent, 
  ApiError,
  RetryConfig
} from '../types/errors'

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: 3,
  delay: 1000,
  exponentialBackoff: true,
  maxDelay: 10000,
}

// ============================================================================
// Error Handler Service
// ============================================================================

class ErrorHandlerService {
  private errorLog: ErrorAnalyticsEvent[] = []
  private errorCounts: Map<string, number> = new Map()
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupGlobalErrorHandling()
  }

  /**
   * Handle API error with comprehensive processing
   */
  handleApiError(error: ApiError | EnhancedError | Error, context?: Partial<ErrorContext>): EnhancedError {
    const enhancedError = this.enhanceError(error, context)
    
    // Log the error
    this.logError(enhancedError, context)
    
    // Track error frequency
    this.trackErrorFrequency(enhancedError)
    
    // Send to analytics (if configured)
    this.sendToAnalytics(enhancedError, context)
    
    // Update error tracking
    this.updateErrorTracking(enhancedError)
    
    return enhancedError
  }

  /**
   * Categorize error based on various factors
   */
  categorizeError(error: any): ErrorCategory {
    // API Error categorization
    if (this.isApiError(error)) {
      return this.categorizeApiError(error)
    }

    // Network error detection
    if (this.isNetworkError(error)) {
      return ErrorCategory.NETWORK
    }

    // Timeout error detection
    if (this.isTimeoutError(error)) {
      return ErrorCategory.TIMEOUT
    }

    // JavaScript runtime errors
    if (error instanceof TypeError) {
      return ErrorCategory.VALIDATION
    }

    if (error instanceof ReferenceError) {
      return ErrorCategory.VALIDATION
    }

    // Default categorization
    return ErrorCategory.UNKNOWN
  }

  /**
   * Determine if error should be retried
   */
  shouldRetry(error: ApiError | EnhancedError, retryConfig?: RetryConfig): boolean {
    const config = retryConfig || DEFAULT_RETRY_CONFIG
    
    // Avoid circular dependency - use direct categorization if not enhanced
    let category: ErrorCategory
    if (this.isEnhancedError(error)) {
      category = error.category
    } else {
      category = this.categorizeError(error)
    }
    
    // Check error category
    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
        return true
      
      case ErrorCategory.SERVER:
        // Retry 5xx errors
        const status = (error as any).status || (error as any).statusCode
        return status ? status >= 500 : true
      
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
   * Get retry delay based on attempt and error type
   */
  getRetryDelay(error: EnhancedError, attempt: number, retryConfig?: RetryConfig): number {
    const config = retryConfig || DEFAULT_RETRY_CONFIG
    let baseDelay = config.delay

    // Adjust delay based on error category
    switch (error.category) {
      case ErrorCategory.RATE_LIMIT:
        // Longer delay for rate limits
        baseDelay = Math.max(baseDelay, 5000)
        break
      
      case ErrorCategory.SERVER:
        // Exponential backoff for server errors
        if (config.exponentialBackoff) {
          baseDelay = baseDelay * Math.pow(2, attempt - 1)
        }
        break
      
      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
        // Standard exponential backoff
        if (config.exponentialBackoff) {
          baseDelay = baseDelay * Math.pow(1.5, attempt - 1)
        }
        break
    }

    // Apply maximum delay limit
    return Math.min(baseDelay, config.maxDelay || 30000)
  }

  /**
   * Process error for user notification
   */
  processForNotification(error: EnhancedError): {
    shouldNotify: boolean
    message: string
    severity: ErrorSeverity
    persistent: boolean
    actionable: boolean
  } {
    const errorKey = this.getErrorKey(error)
    const frequency = this.errorCounts.get(errorKey) || 0
    
    // Don't spam user with repeated errors
    const shouldNotify = frequency <= 3 || (frequency % 10 === 0)
    
    return {
      shouldNotify,
      message: this.getUserMessage(error),
      severity: error.severity,
      persistent: error.severity === ErrorSeverity.CRITICAL,
      actionable: this.isActionableError(error),
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number
    errorsByCategory: Record<ErrorCategory, number>
    errorsBySeverity: Record<ErrorSeverity, number>
    recentErrors: ErrorAnalyticsEvent[]
    topErrors: Array<{ error: string; count: number }>
  } {
    const recentErrors = this.errorLog.slice(-50)
    const errorsByCategory = {} as Record<ErrorCategory, number>
    const errorsBySeverity = {} as Record<ErrorSeverity, number>

    // Initialize counters
    Object.values(ErrorCategory).forEach(category => {
      errorsByCategory[category] = 0
    })
    Object.values(ErrorSeverity).forEach(severity => {
      errorsBySeverity[severity] = 0
    })

    // Count errors
    this.errorLog.forEach(event => {
      errorsByCategory[event.error.category]++
      errorsBySeverity[event.error.severity]++
    })

    // Get top errors
    const topErrors = Array.from(this.errorCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }))

    return {
      totalErrors: this.errorLog.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors,
      topErrors,
    }
  }

  /**
   * Clear error log and reset counters
   */
  clearErrorLog(): void {
    this.errorLog = []
    this.errorCounts.clear()
  }

  /**
   * Set user ID for error tracking
   */
  setUserId(userId: string): void {
    this.userId = userId
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Enhance error with additional information
   */
  private enhanceError(error: any, context?: Partial<ErrorContext>): EnhancedError {
    if (this.isEnhancedError(error)) {
      return error
    }

    const category = this.categorizeError(error)
    const severity = this.determineSeverity(error, category)
    const message = this.extractErrorMessage(error)

    const enhancedError = new Error(message) as EnhancedError
    enhancedError.name = 'EnhancedError'
    enhancedError.originalError = error
    enhancedError.category = category
    enhancedError.severity = severity
    enhancedError.retryable = this.isRetryableError(error)
    enhancedError.timestamp = Date.now()
    enhancedError.correlationId = error.correlation_id || error.correlationId || this.generateCorrelationId()
    enhancedError.context = this.buildErrorContext(context)

    // Copy over relevant properties
    if (error.status || error.statusCode) {
      enhancedError.status = error.status || error.statusCode
    }

    return enhancedError
  }

  /**
   * Categorize API error based on status and content
   */
  private categorizeApiError(error: ApiError): ErrorCategory {
    if (error.status) {
      if (error.status === 401) return ErrorCategory.AUTHENTICATION
      if (error.status === 403) return ErrorCategory.AUTHORIZATION
      if (error.status === 429) return ErrorCategory.RATE_LIMIT
      if (error.status >= 400 && error.status < 500) return ErrorCategory.VALIDATION
      if (error.status >= 500) return ErrorCategory.SERVER
    }

    // Check error type/message
    const errorType = (error.error || '').toLowerCase()
    if (errorType.includes('network')) return ErrorCategory.NETWORK
    if (errorType.includes('timeout')) return ErrorCategory.TIMEOUT
    if (errorType.includes('auth')) return ErrorCategory.AUTHENTICATION
    if (errorType.includes('rate')) return ErrorCategory.RATE_LIMIT
    if (errorType.includes('validation')) return ErrorCategory.VALIDATION

    return ErrorCategory.UNKNOWN
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: any, category: ErrorCategory): ErrorSeverity {
    // Status code based severity
    if (error.status) {
      if (error.status >= 500) return ErrorSeverity.CRITICAL
      if (error.status === 401 || error.status === 403) return ErrorSeverity.HIGH
      if (error.status === 429) return ErrorSeverity.MEDIUM
      if (error.status >= 400) return ErrorSeverity.LOW
    }

    // Category based severity
    switch (category) {
      case ErrorCategory.SERVER:
        return ErrorSeverity.CRITICAL
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return ErrorSeverity.HIGH
      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
      case ErrorCategory.RATE_LIMIT:
        return ErrorSeverity.MEDIUM
      case ErrorCategory.VALIDATION:
        return ErrorSeverity.LOW
      default:
        return ErrorSeverity.MEDIUM
    }
  }

  /**
   * Build error context
   */
  private buildErrorContext(context?: Partial<ErrorContext>): ErrorContext {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      browser: this.getBrowserInfo(),
      network: this.getNetworkInfo(),
      ...context,
    }
  }

  /**
   * Log error to internal log
   */
  private logError(error: EnhancedError, context?: Partial<ErrorContext>): void {
    const logEntry: ErrorAnalyticsEvent = {
      type: 'error_occurred',
      error: {
        message: error.message,
        category: error.category,
        severity: error.severity,
        stack: error.stack,
      },
      context: this.buildErrorContext(context),
      timestamp: Date.now(),
      session: {
        id: this.sessionId,
        userId: this.userId,
        duration: Date.now() - this.getSessionStartTime(),
      },
      metadata: {
        correlationId: error.correlationId,
        retryable: error.retryable,
        status: error.status,
      },
    }

    this.errorLog.push(logEntry)
    
    // Keep log size manageable
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-500)
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${error.category}/${error.severity}]`)
      console.error('Message:', error.message)
      console.error('Context:', error.context)
      console.error('Original:', error.originalError)
      console.groupEnd()
    }
  }

  /**
   * Track error frequency
   */
  private trackErrorFrequency(error: EnhancedError): void {
    const key = this.getErrorKey(error)
    const current = this.errorCounts.get(key) || 0
    this.errorCounts.set(key, current + 1)
  }

  /**
   * Send error to analytics service
   */
  private sendToAnalytics(error: EnhancedError, context?: Partial<ErrorContext>): void {
    // This would integrate with your analytics service
    // For now, we'll just add it to a queue for batch processing
    
    try {
      // Simulate analytics call
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: error.message,
          fatal: error.severity === ErrorSeverity.CRITICAL,
          custom_map: {
            category: error.category,
            correlation_id: error.correlationId,
          },
        })
      }
    } catch (analyticsError) {
      console.warn('Failed to send error to analytics:', analyticsError)
    }
  }

  /**
   * Update error tracking metrics
   */
  private updateErrorTracking(error: EnhancedError): void {
    // This could update internal metrics, health checks, etc.
    // For now, we'll just track basic counts
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    if (typeof window === 'undefined') return

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = this.enhanceError(event.reason, {
        url: window.location.href,
        userAgent: navigator.userAgent,
      })
      
      this.handleApiError(error)
    })

    // Catch uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      const error = this.enhanceError(event.error || new Error(event.message), {
        url: event.filename,
        line: event.lineno,
        column: event.colno,
      })
      
      this.handleApiError(error)
    })
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private isApiError(error: any): error is ApiError {
    return error && typeof error === 'object' && 
           ('status' in error || 'error' in error || 'correlation_id' in error)
  }

  private isEnhancedError(error: any): error is EnhancedError {
    return error && typeof error === 'object' && 'category' in error && 'severity' in error
  }

  private isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message.includes('fetch')
  }

  private isTimeoutError(error: any): boolean {
    return error instanceof DOMException && error.name === 'AbortError'
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.error) return error.error
    return 'Unknown error occurred'
  }

  private getErrorKey(error: EnhancedError): string {
    return `${error.category}:${error.message.substring(0, 50)}`
  }

  private getUserMessage(error: EnhancedError): string {
    // This would use the same logic as the notification hook
    return error.message
  }

  private isActionableError(error: EnhancedError): boolean {
    return error.retryable || 
           error.category === ErrorCategory.AUTHENTICATION ||
           error.category === ErrorCategory.RATE_LIMIT
  }

  private getBrowserInfo() {
    const ua = navigator.userAgent
    let browserName = 'Unknown'
    let browserVersion = 'Unknown'

    if (ua.indexOf('Chrome') > -1) {
      browserName = 'Chrome'
      browserVersion = ua.match(/Chrome\/([0-9]+)/)?.[1] || 'Unknown'
    } else if (ua.indexOf('Firefox') > -1) {
      browserName = 'Firefox'
      browserVersion = ua.match(/Firefox\/([0-9]+)/)?.[1] || 'Unknown'
    } else if (ua.indexOf('Safari') > -1) {
      browserName = 'Safari'
      browserVersion = ua.match(/Version\/([0-9]+)/)?.[1] || 'Unknown'
    }

    return {
      name: browserName,
      version: browserVersion,
      language: navigator.language,
    }
  }

  private getNetworkInfo() {
    const connection = (navigator as any)?.connection
    return {
      isOnline: navigator.onLine,
      connectionType: connection?.type,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getSessionStartTime(): number {
    // This would be set when the session starts
    return Date.now() - (5 * 60 * 1000) // Mock 5 minutes ago
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const ErrorHandler = new ErrorHandlerService()
export { ErrorHandlerService }

// Re-export types
export type { 
  EnhancedError, 
  ErrorCategory, 
  ErrorSeverity, 
  ErrorContext, 
  ErrorAnalyticsEvent 
} from '../types/errors'