/**
 * Error Types for NovaSignal Frontend
 * Comprehensive error handling types and interfaces
 */

// ============================================================================
// Core Error Types
// ============================================================================

/**
 * API Error from backend
 */
export interface ApiError {
  /** HTTP status code */
  status: number
  /** Error type/category */
  error: string
  /** Human-readable error message */
  message: string
  /** Backend correlation ID for request tracking */
  correlation_id: string
  /** Error timestamp */
  timestamp: string
  /** API path where error occurred */
  path?: string
  /** Additional error details */
  details?: Record<string, any>
}

/**
 * Error categories for smart handling
 */
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'info',
  MEDIUM = 'warning',
  HIGH = 'error',
  CRITICAL = 'error'
}

/**
 * Enhanced error object with categorization
 */
export interface EnhancedError extends Error {
  /** Original error */
  originalError?: any
  /** Error category */
  category: ErrorCategory
  /** Error severity */
  severity: ErrorSeverity
  /** Whether error is retryable */
  retryable: boolean
  /** HTTP status code (if applicable) */
  status?: number
  /** Correlation ID */
  correlationId?: string
  /** Additional context */
  context?: Record<string, any>
  /** Error timestamp */
  timestamp: number
}

// ============================================================================
// HTTP Client Error Types
// ============================================================================

/**
 * Request configuration for HTTP client
 */
export interface RequestConfig {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Request URL */
  url: string
  /** Request headers */
  headers?: Record<string, string>
  /** Request body */
  data?: any
  /** Query parameters */
  params?: Record<string, string | number | boolean>
  /** Request timeout in milliseconds */
  timeout?: number
  /** Retry configuration */
  retry?: RetryConfig
  /** Correlation ID */
  correlationId?: string
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  attempts: number
  /** Base delay between retries (ms) */
  delay: number
  /** Use exponential backoff */
  exponentialBackoff: boolean
  /** Maximum delay between retries (ms) */
  maxDelay?: number
  /** Retry condition function */
  shouldRetry?: (error: EnhancedError, attempt: number) => boolean
}

/**
 * Network status information
 */
export interface NetworkStatus {
  /** Is online */
  isOnline: boolean
  /** Connection type */
  connectionType?: string
  /** Effective connection type */
  effectiveType?: string
  /** Round trip time */
  rtt?: number
  /** Downlink speed */
  downlink?: number
  /** Last online timestamp */
  lastOnline?: number
  /** Last offline timestamp */
  lastOffline?: number
}

// ============================================================================
// User Notification Types
// ============================================================================

/**
 * Notification types for user errors
 */
export enum NotificationType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

/**
 * Error notification configuration
 */
export interface ErrorNotificationConfig {
  /** Notification message */
  message: string
  /** Notification type */
  type: NotificationType
  /** Auto-hide duration in milliseconds */
  autoHideDuration?: number | null
  /** Show close button */
  persist?: boolean
  /** Action button configuration */
  action?: {
    /** Action label */
    label: string
    /** Action callback */
    callback: () => void
  }
  /** Additional notification options */
  options?: {
    /** Prevent duplicate notifications */
    preventDuplicate?: boolean
    /** Custom key for notification */
    key?: string
    /** Additional styling */
    className?: string
  }
}

// ============================================================================
// Offline Queue Types
// ============================================================================

/**
 * Queued request for offline handling
 */
export interface QueuedRequest {
  /** Unique request ID */
  id: string
  /** Request configuration */
  config: RequestConfig
  /** Request timestamp */
  timestamp: number
  /** Number of retry attempts */
  attempts: number
  /** Request priority */
  priority: 'low' | 'normal' | 'high'
  /** Expiration timestamp */
  expiresAt?: number
}

/**
 * Offline queue status
 */
export interface OfflineQueueStatus {
  /** Queue size */
  size: number
  /** Pending requests */
  pending: number
  /** Failed requests */
  failed: number
  /** Successfully replayed requests */
  replayed: number
  /** Is processing queue */
  processing: boolean
}

// ============================================================================
// Error Context Types
// ============================================================================

/**
 * Error context for debugging
 */
export interface ErrorContext {
  /** User agent */
  userAgent?: string
  /** Current URL */
  url?: string
  /** User ID */
  userId?: string
  /** Session ID */
  sessionId?: string
  /** Browser info */
  browser?: {
    name: string
    version: string
    language: string
  }
  /** Network info */
  network?: NetworkStatus
  /** Application state */
  appState?: {
    /** Current route */
    route?: string
    /** User preferences */
    preferences?: Record<string, any>
    /** Feature flags */
    featureFlags?: Record<string, boolean>
  }
  /** Performance metrics */
  performance?: {
    /** Memory usage */
    memory?: number
    /** Connection speed */
    connectionSpeed?: number
    /** Load time */
    loadTime?: number
  }
}

// ============================================================================
// Error Boundary Types
// ============================================================================

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  /** Has error occurred */
  hasError: boolean
  /** Error object */
  error?: Error
  /** Error info */
  errorInfo?: {
    componentStack: string
  }
  /** Error ID for tracking */
  errorId?: string
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  /** Child components */
  children: React.ReactNode
  /** Fallback component */
  fallback?: React.ComponentType<{ error: Error; errorInfo: any; retry: () => void }>
  /** Error handler callback */
  onError?: (error: Error, errorInfo: any) => void
  /** Reset condition */
  resetOnPropsChange?: any[]
  /** Custom error boundary key */
  errorBoundaryKey?: string
}

// ============================================================================
// Analytics and Monitoring Types
// ============================================================================

/**
 * Error analytics event
 */
export interface ErrorAnalyticsEvent {
  /** Event type */
  type: 'error_occurred' | 'error_resolved' | 'retry_attempt' | 'offline_queue'
  /** Error details */
  error: {
    /** Error message */
    message: string
    /** Error category */
    category: ErrorCategory
    /** Error severity */
    severity: ErrorSeverity
    /** Stack trace */
    stack?: string
  }
  /** Context information */
  context: ErrorContext
  /** Timestamp */
  timestamp: number
  /** Session info */
  session: {
    /** Session ID */
    id: string
    /** User ID */
    userId?: string
    /** Duration */
    duration: number
  }
  /** Additional metadata */
  metadata?: Record<string, any>
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Error handler function type
 */
export type ErrorHandler<T = any> = (error: EnhancedError, context?: ErrorContext) => T | Promise<T>

/**
 * Retry predicate function type
 */
export type RetryPredicate = (error: EnhancedError, attempt: number) => boolean

/**
 * Error categorizer function type
 */
export type ErrorCategorizer = (error: any) => ErrorCategory

/**
 * User message generator function type
 */
export type UserMessageGenerator = (error: EnhancedError) => string

// ============================================================================
// Default Configurations
// ============================================================================

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: 3,
  delay: 1000,
  exponentialBackoff: true,
  maxDelay: 10000,
}

/**
 * Default request timeout
 */
export const DEFAULT_REQUEST_TIMEOUT = 10000 // 10 seconds

/**
 * Default auto-hide durations for notifications
 */
export const NOTIFICATION_AUTO_HIDE_DURATIONS = {
  [ErrorSeverity.LOW]: 3000,
  [ErrorSeverity.MEDIUM]: 5000,
  [ErrorSeverity.HIGH]: 8000,
  [ErrorSeverity.CRITICAL]: null, // Persistent
} as const

/**
 * Error messages for user notifications
 */
export const USER_ERROR_MESSAGES = {
  [ErrorCategory.NETWORK]: "Connection problem. Please check your internet connection.",
  [ErrorCategory.TIMEOUT]: "Request timed out. Please try again.",
  [ErrorCategory.RATE_LIMIT]: "Too many requests. Please wait a moment before trying again.",
  [ErrorCategory.VALIDATION]: "Please check your input and try again.",
  [ErrorCategory.AUTHENTICATION]: "Please sign in to continue.",
  [ErrorCategory.AUTHORIZATION]: "You don't have permission to perform this action.",
  [ErrorCategory.SERVER]: "Something went wrong on our end. Our team has been notified.",
  [ErrorCategory.UNKNOWN]: "An unexpected error occurred. Please try again.",
} as const