/**
 * Error Notification Hook for NovaSignal
 * User-friendly error notifications with smart categorization
 */

import { useCallback } from 'react'
import { useSnackbar, VariantType } from 'notistack'
import { 
  EnhancedError, 
  ErrorCategory, 
  ErrorSeverity,
  ErrorNotificationConfig,
  NotificationType,
  USER_ERROR_MESSAGES,
  NOTIFICATION_AUTO_HIDE_DURATIONS
} from '../types/errors'

// ============================================================================
// Error Notification Hook
// ============================================================================

export const useErrorNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  /**
   * Display error notification to user
   */
  const notifyError = useCallback((error: EnhancedError | Error | string, options?: Partial<ErrorNotificationConfig>) => {
    const enhancedError = ensureEnhancedError(error)
    const config = buildNotificationConfig(enhancedError, options)
    
    const snackbarOptions = {
      variant: mapTypeToVariant(config.type),
      autoHideDuration: config.autoHideDuration,
      persist: config.persist || false,
      preventDuplicate: config.options?.preventDuplicate !== false,
      key: config.options?.key,
      action: config.action ? createActionButton(config.action.label, config.action.callback) : undefined,
      className: config.options?.className,
      anchorOrigin: { 
        vertical: 'top' as const, 
        horizontal: 'right' as const 
      },
    }

    return enqueueSnackbar(config.message, snackbarOptions)
  }, [enqueueSnackbar])

  /**
   * Display success notification
   */
  const notifySuccess = useCallback((message: string, options?: { autoHideDuration?: number; persist?: boolean }) => {
    return enqueueSnackbar(message, {
      variant: 'success',
      autoHideDuration: options?.autoHideDuration ?? 3000,
      persist: options?.persist ?? false,
      anchorOrigin: { 
        vertical: 'top' as const, 
        horizontal: 'right' as const 
      },
    })
  }, [enqueueSnackbar])

  /**
   * Display info notification
   */
  const notifyInfo = useCallback((message: string, options?: { autoHideDuration?: number; persist?: boolean }) => {
    return enqueueSnackbar(message, {
      variant: 'info',
      autoHideDuration: options?.autoHideDuration ?? 4000,
      persist: options?.persist ?? false,
      anchorOrigin: { 
        vertical: 'top' as const, 
        horizontal: 'right' as const 
      },
    })
  }, [enqueueSnackbar])

  /**
   * Display warning notification
   */
  const notifyWarning = useCallback((message: string, options?: { autoHideDuration?: number; persist?: boolean }) => {
    return enqueueSnackbar(message, {
      variant: 'warning',
      autoHideDuration: options?.autoHideDuration ?? 5000,
      persist: options?.persist ?? false,
      anchorOrigin: { 
        vertical: 'top' as const, 
        horizontal: 'right' as const 
      },
    })
  }, [enqueueSnackbar])

  /**
   * Display network status notification
   */
  const notifyNetworkStatus = useCallback((isOnline: boolean) => {
    if (isOnline) {
      notifySuccess('Connection restored', { autoHideDuration: 3000 })
    } else {
      notifyWarning('Connection lost. Working offline...', { persist: true })
    }
  }, [notifySuccess, notifyWarning])

  /**
   * Display retry notification
   */
  const notifyRetryAttempt = useCallback((attempt: number, maxAttempts: number) => {
    notifyInfo(`Retrying... (${attempt}/${maxAttempts})`, { autoHideDuration: 2000 })
  }, [notifyInfo])

  /**
   * Close specific notification
   */
  const closeNotification = useCallback((key: string | number) => {
    closeSnackbar(key)
  }, [closeSnackbar])

  /**
   * Close all notifications
   */
  const closeAllNotifications = useCallback(() => {
    closeSnackbar()
  }, [closeSnackbar])

  return {
    notifyError,
    notifySuccess,
    notifyInfo,
    notifyWarning,
    notifyNetworkStatus,
    notifyRetryAttempt,
    closeNotification,
    closeAllNotifications,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Ensure error is an EnhancedError
 */
function ensureEnhancedError(error: EnhancedError | Error | string): EnhancedError {
  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: error,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      timestamp: Date.now(),
    } as EnhancedError
  }

  if ('category' in error && 'severity' in error) {
    return error as EnhancedError
  }

  // Convert regular Error to EnhancedError
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    category: ErrorCategory.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
    timestamp: Date.now(),
    originalError: error,
  } as EnhancedError
}

/**
 * Build notification configuration from error
 */
function buildNotificationConfig(
  error: EnhancedError, 
  options?: Partial<ErrorNotificationConfig>
): ErrorNotificationConfig {
  const userMessage = getUserFriendlyMessage(error)
  const notificationType = getNotificationType(error.severity)
  const autoHideDuration = getAutoHideDuration(error.severity)
  const action = getErrorAction(error)

  return {
    message: options?.message || userMessage,
    type: options?.type || notificationType,
    autoHideDuration: options?.autoHideDuration !== undefined 
      ? options.autoHideDuration 
      : autoHideDuration,
    persist: options?.persist !== undefined 
      ? options.persist 
      : (error.severity === ErrorSeverity.CRITICAL),
    action: options?.action || action,
    options: {
      preventDuplicate: true,
      key: `error-${error.category}-${error.timestamp}`,
      ...options?.options,
    },
  }
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(error: EnhancedError): string {
  // Check for specific error messages first
  if (error.message && !error.message.toLowerCase().includes('fetch')) {
    const message = error.message.toLowerCase()
    
    // Handle common API error messages
    if (message.includes('network') || message.includes('connection')) {
      return USER_ERROR_MESSAGES[ErrorCategory.NETWORK]
    }
    
    if (message.includes('timeout')) {
      return USER_ERROR_MESSAGES[ErrorCategory.TIMEOUT]
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return USER_ERROR_MESSAGES[ErrorCategory.AUTHENTICATION]
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return USER_ERROR_MESSAGES[ErrorCategory.AUTHORIZATION]
    }
    
    if (message.includes('rate limit') || message.includes('429')) {
      return USER_ERROR_MESSAGES[ErrorCategory.RATE_LIMIT]
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return USER_ERROR_MESSAGES[ErrorCategory.VALIDATION]
    }
  }

  // Use category-based message
  const categoryMessage = USER_ERROR_MESSAGES[error.category]
  if (categoryMessage) {
    return categoryMessage
  }

  // Fallback to original message or default
  return error.message || USER_ERROR_MESSAGES[ErrorCategory.UNKNOWN]
}

/**
 * Get notification type from error severity
 */
function getNotificationType(severity: ErrorSeverity): NotificationType {
  switch (severity) {
    case ErrorSeverity.LOW:
      return NotificationType.INFO
    case ErrorSeverity.MEDIUM:
      return NotificationType.WARNING
    case ErrorSeverity.HIGH:
    case ErrorSeverity.CRITICAL:
      return NotificationType.ERROR
    default:
      return NotificationType.ERROR
  }
}

/**
 * Get auto-hide duration from error severity
 */
function getAutoHideDuration(severity: ErrorSeverity): number | null {
  return NOTIFICATION_AUTO_HIDE_DURATIONS[severity]
}

/**
 * Get error action based on error type
 */
function getErrorAction(error: EnhancedError): ErrorNotificationConfig['action'] | undefined {
  switch (error.category) {
    case ErrorCategory.NETWORK:
      if (error.retryable) {
        return {
          label: 'Retry',
          callback: () => {
            // This would be handled by the component using the hook
            console.log('Retry action triggered for:', error.correlationId)
          },
        }
      }
      break
    
    case ErrorCategory.AUTHENTICATION:
      return {
        label: 'Sign In',
        callback: () => {
          // This would trigger sign-in flow
          console.log('Sign in action triggered')
        },
      }
    
    case ErrorCategory.RATE_LIMIT:
      return {
        label: 'Try Later',
        callback: () => {
          // This could set a timer or show a cooldown
          console.log('Rate limit acknowledged')
        },
      }
  }

  return undefined
}

/**
 * Map notification type to notistack variant
 */
function mapTypeToVariant(type: NotificationType): VariantType {
  switch (type) {
    case NotificationType.SUCCESS:
      return 'success'
    case NotificationType.INFO:
      return 'info'
    case NotificationType.WARNING:
      return 'warning'
    case NotificationType.ERROR:
      return 'error'
    default:
      return 'default'
  }
}

/**
 * Create action button component for notifications
 */
function createActionButton(label: string, callback: () => void) {
  return (snackbarId: string | number) => (
    <button
      onClick={() => {
        callback()
        // Close the snackbar after action
        // This would need access to closeSnackbar, which requires context
      }}
      style={{
        color: 'white',
        backgroundColor: 'transparent',
        border: '1px solid currentColor',
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        marginLeft: '8px',
      }}
    >
      {label}
    </button>
  )
}

// ============================================================================
// Export utility functions for external use
// ============================================================================

export { 
  getUserFriendlyMessage,
  getNotificationType,
  getAutoHideDuration,
  ensureEnhancedError,
}

export type { ErrorNotificationConfig }