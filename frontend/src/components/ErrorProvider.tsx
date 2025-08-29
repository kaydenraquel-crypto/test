/**
 * Error Provider Component
 * Provides error handling context and user notifications throughout the application
 */

import React, { createContext, useContext, useCallback, useEffect, ReactNode } from 'react'
import { SnackbarProvider, useSnackbar } from 'notistack'
import { useErrorNotification } from '../hooks/useErrorNotification'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { ErrorHandler } from '../services/ErrorHandler'
import { EnhancedError, ErrorCategory, ErrorSeverity } from '../types/errors'
import { IconButton, Alert, Box } from '@mui/material'
import { Close as CloseIcon, Wifi as WifiIcon, WifiOff as WifiOffIcon } from '@mui/icons-material'

// ============================================================================
// Error Context
// ============================================================================

interface ErrorContextType {
  reportError: (error: Error | EnhancedError | string, context?: any) => void
  clearErrors: () => void
  isOnline: boolean
  networkQuality: string
  errorStats: ReturnType<typeof ErrorHandler.getErrorStats>
}

const ErrorContext = createContext<ErrorContextType | null>(null)

// ============================================================================
// Error Provider Props
// ============================================================================

interface ErrorProviderProps {
  children: ReactNode
  maxSnack?: number
  anchorOrigin?: {
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
  autoHideDuration?: number
}

// ============================================================================
// Inner Error Provider (has access to snackbar)
// ============================================================================

const InnerErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    notifyError,
    notifySuccess,
    notifyWarning,
    notifyNetworkStatus,
    closeAllNotifications,
  } = useErrorNotification()
  
  const { 
    isOnline, 
    networkStatus, 
    connectionStability,
  } = useNetworkStatus()

  // Track network status changes
  const prevOnlineRef = React.useRef(isOnline)
  useEffect(() => {
    if (prevOnlineRef.current !== isOnline) {
      notifyNetworkStatus(isOnline)
      prevOnlineRef.current = isOnline
    }
  }, [isOnline, notifyNetworkStatus])

  /**
   * Report error with comprehensive handling
   */
  const reportError = useCallback((
    error: Error | EnhancedError | string,
    context?: any
  ) => {
    try {
      // Process error through error handler
      const enhancedError = ErrorHandler.handleApiError(error, {
        ...context,
        networkStatus,
        userReported: true,
      })

      // Determine if user should be notified
      const notificationConfig = ErrorHandler.processForNotification(enhancedError)
      
      if (notificationConfig.shouldNotify) {
        notifyError(enhancedError, {
          persist: notificationConfig.persistent,
          action: notificationConfig.actionable ? {
            label: getActionLabel(enhancedError),
            callback: () => handleErrorAction(enhancedError),
          } : undefined,
        })
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group('🚨 Error Reported')
        console.error('Error:', enhancedError)
        console.log('Context:', context)
        console.log('Network Status:', networkStatus)
        console.groupEnd()
      }
    } catch (handlerError) {
      // Fallback if error handler fails
      console.error('Error handler failed:', handlerError)
      console.error('Original error:', error)
      
      notifyError('An unexpected error occurred')
    }
  }, [notifyError, networkStatus])

  /**
   * Clear all errors and notifications
   */
  const clearErrors = useCallback(() => {
    ErrorHandler.clearErrorLog()
    closeAllNotifications()
  }, [closeAllNotifications])

  /**
   * Get network quality assessment
   */
  const getNetworkQuality = useCallback((): string => {
    if (!isOnline) return 'offline'
    
    const stability = connectionStability
    if (stability >= 0.9) return 'excellent'
    if (stability >= 0.7) return 'good'
    if (stability >= 0.5) return 'fair'
    return 'poor'
  }, [isOnline, connectionStability])

  /**
   * Get error statistics
   */
  const errorStats = ErrorHandler.getErrorStats()

  // Context value
  const contextValue: ErrorContextType = {
    reportError,
    clearErrors,
    isOnline,
    networkQuality: getNetworkQuality(),
    errorStats,
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      <NetworkStatusIndicator />
    </ErrorContext.Provider>
  )
}

// ============================================================================
// Network Status Indicator Component
// ============================================================================

const NetworkStatusIndicator: React.FC = () => {
  const { isOnline, networkStatus } = useNetworkStatus()
  const [showIndicator, setShowIndicator] = React.useState(false)

  // Show indicator when offline or connection is poor
  useEffect(() => {
    setShowIndicator(!isOnline)
  }, [isOnline])

  if (!showIndicator) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 9999,
        minWidth: 200,
      }}
    >
      <Alert
        severity={isOnline ? "warning" : "error"}
        icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => setShowIndicator(false)}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {isOnline 
          ? `Poor connection (${networkStatus.effectiveType || 'unknown'})`
          : 'You are offline'
        }
      </Alert>
    </Box>
  )
}

// ============================================================================
// Main Error Provider Component
// ============================================================================

const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxSnack = 5,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
  autoHideDuration = 5000,
}) => {
  // Custom notification action for closing snackbars
  const notistackRef = React.useRef<any>()
  const onClickDismiss = (key: string | number) => () => {
    if (notistackRef.current) {
      notistackRef.current.closeSnackbar(key)
    }
  }

  return (
    <SnackbarProvider
      ref={notistackRef}
      maxSnack={maxSnack}
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      preventDuplicate
      dense
      action={(key) => (
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={onClickDismiss(key)}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
      sx={{
        '& .SnackbarItem-variantSuccess': {
          backgroundColor: 'success.main',
        },
        '& .SnackbarItem-variantError': {
          backgroundColor: 'error.main',
        },
        '& .SnackbarItem-variantWarning': {
          backgroundColor: 'warning.main',
        },
        '& .SnackbarItem-variantInfo': {
          backgroundColor: 'info.main',
        },
      }}
    >
      <InnerErrorProvider>
        {children}
      </InnerErrorProvider>
    </SnackbarProvider>
  )
}

// ============================================================================
// Hook for using error context
// ============================================================================

export const useErrorContext = (): ErrorContextType => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider')
  }
  return context
}

// ============================================================================
// Higher-order component for error boundaries
// ============================================================================

interface WithErrorHandlingProps {
  onError?: (error: Error, errorInfo: any) => void
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>
}

export const withErrorHandling = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorHandlingProps = {}
) => {
  const WrappedComponent = (props: P) => {
    const { reportError } = useErrorContext()
    
    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          reportError(error, { componentStack: errorInfo.componentStack })
          options.onError?.(error, errorInfo)
        }}
        fallbackComponent={options.fallbackComponent}
      >
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorHandling(${Component.displayName || Component.name})`
  return WrappedComponent
}

// ============================================================================
// Error Boundary Component
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<
  {
    children: ReactNode
    onError?: (error: Error, errorInfo: any) => void
    fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>
  },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />
      }

      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="200px"
          p={3}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            Something went wrong. Please try refreshing the page.
          </Alert>
          <button onClick={this.handleRetry}>Try Again</button>
        </Box>
      )
    }

    return this.props.children
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get action label for error notification
 */
function getActionLabel(error: EnhancedError): string {
  switch (error.category) {
    case ErrorCategory.NETWORK:
      return 'Retry'
    case ErrorCategory.AUTHENTICATION:
      return 'Sign In'
    case ErrorCategory.RATE_LIMIT:
      return 'Try Later'
    default:
      return 'Dismiss'
  }
}

/**
 * Handle error action callback
 */
function handleErrorAction(error: EnhancedError): void {
  switch (error.category) {
    case ErrorCategory.NETWORK:
      // Could trigger a retry mechanism
      window.location.reload()
      break
    
    case ErrorCategory.AUTHENTICATION:
      // Could redirect to login
      console.log('Redirect to login')
      break
    
    case ErrorCategory.RATE_LIMIT:
      // Could show a countdown or rate limit info
      console.log('Show rate limit info')
      break
    
    default:
      // Default action is just to dismiss
      break
  }
}

// ============================================================================
// Export components and hooks
// ============================================================================

export default ErrorProvider
export { ErrorBoundary, NetworkStatusIndicator }

// Re-export error handling utilities
export { useErrorNotification } from '../hooks/useErrorNotification'
export { useNetworkStatus } from '../hooks/useNetworkStatus'
export type { ErrorContextType, ErrorProviderProps }