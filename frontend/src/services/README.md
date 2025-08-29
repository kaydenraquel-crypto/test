# Enhanced Error Handling System

A comprehensive error handling architecture for production-ready React applications with automatic retry logic, network awareness, and user notifications.

## Quick Start

### 1. Wrap your app with ErrorProvider

```tsx
import React from 'react'
import ErrorProvider from '../components/ErrorProvider'
import { ThemeProvider } from '@mui/material/styles'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorProvider maxSnack={5}>
        <YourApp />
      </ErrorProvider>
    </ThemeProvider>
  )
}
```

### 2. Use enhanced API client

```tsx
import { enhancedApiClient } from '../services/api-enhanced'

// Automatic error handling and retry
const data = await enhancedApiClient.searchSymbols({ 
  query: 'AAPL' 
})

// With custom retry configuration
const quotes = await enhancedApiClient.getQuote('AAPL')
```

### 3. Report custom errors

```tsx
import { useErrorContext } from '../components/ErrorProvider'

function MyComponent() {
  const { reportError } = useErrorContext()
  
  const handleSubmit = async () => {
    try {
      await someAsyncOperation()
    } catch (error) {
      reportError(error, { 
        component: 'MyComponent',
        operation: 'submit' 
      })
    }
  }
}
```

### 4. Monitor network status

```tsx
import { useNetworkStatus } from '../hooks/useNetworkStatus'

function NetworkAwareComponent() {
  const { isOnline, networkQuality, connectionStability } = useNetworkStatus()
  
  if (!isOnline) {
    return <OfflineIndicator />
  }
  
  if (networkQuality === 'poor') {
    return <SlowConnectionNotice />
  }
  
  return <NormalComponent />
}
```

## Features

### ✅ Automatic Error Categorization
- **Network** - Connection issues, fetch failures
- **Timeout** - Request timeouts, slow responses  
- **Server** - 5xx errors, backend failures
- **Authentication** - 401 unauthorized errors
- **Authorization** - 403 forbidden errors
- **Rate Limiting** - 429 too many requests
- **Validation** - 4xx client errors

### ✅ Smart Retry Logic
- Network errors: 3 retries with exponential backoff
- Server errors (5xx): 3 retries with exponential backoff
- Rate limits (429): 2 retries with longer delays
- Authentication/Validation: No retry (immediate user action)

### ✅ User-Friendly Notifications
- Automatic severity-based styling
- Action buttons for recoverable errors
- Notification deduplication
- Auto-hide based on error type
- Persistent notifications for critical errors

### ✅ Network Awareness
- Online/offline detection
- Connection quality assessment
- Offline request queuing
- Automatic request replay when online
- Network performance monitoring

### ✅ Production Features
- Correlation ID tracking
- Error analytics integration
- Memory-efficient error logging
- Request timeout management
- Graceful fallback mechanisms

## API Reference

### ErrorProvider Props

```tsx
interface ErrorProviderProps {
  children: ReactNode
  maxSnack?: number // Max simultaneous notifications (default: 5)
  anchorOrigin?: { 
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right' 
  }
  autoHideDuration?: number // Default auto-hide time (default: 5000ms)
}
```

### useErrorContext Hook

```tsx
const {
  reportError,      // Report custom errors
  clearErrors,      // Clear error history
  isOnline,         // Network status
  networkQuality,   // Connection quality assessment
  errorStats,       // Error statistics and history
} = useErrorContext()
```

### Enhanced API Client Methods

```tsx
// Symbol search with fallback
await enhancedApiClient.searchSymbols(params)

// Historical data with retry
await enhancedApiClient.getHistoricalData(symbol, timeframe, days)

// Real-time quotes with short timeout
await enhancedApiClient.getQuote(symbol)

// Technical indicators
await enhancedApiClient.getIndicators(symbol, indicators, timeframe)

// Trading signals
await enhancedApiClient.getSignals(symbol, timeframe)

// News data
await enhancedApiClient.getNews(symbol, limit)

// User preferences
await enhancedApiClient.saveUserPreferences(preferences)
await enhancedApiClient.getUserPreferences()

// Health check
await enhancedApiClient.healthCheck()
```

### Network Status Hook

```tsx
const {
  isOnline,               // Boolean online status
  networkStatus,          // Detailed network info
  connectionStability,    // Stability score (0-1)
  checkConnectionQuality, // Test connection quality
  testConnectivity,       // Test specific endpoint
  refreshNetworkStatus,   // Force status refresh
} = useNetworkStatus()
```

### Error Handler Service

```tsx
import { ErrorHandler } from '../services/ErrorHandler'

// Process any error
const enhancedError = ErrorHandler.handleApiError(error, context)

// Check retry eligibility
const shouldRetry = ErrorHandler.shouldRetry(error)

// Get retry delay
const delay = ErrorHandler.getRetryDelay(error, attempt)

// Get error statistics
const stats = ErrorHandler.getErrorStats()

// Clear error log
ErrorHandler.clearErrorLog()
```

## Error Types

### EnhancedError Properties

```tsx
interface EnhancedError extends Error {
  originalError?: any        // Original error object
  category: ErrorCategory    // Categorized error type
  severity: ErrorSeverity    // Error severity level
  retryable: boolean         // Whether error is retryable
  status?: number           // HTTP status code
  correlationId?: string    // Request correlation ID
  context?: ErrorContext    // Additional error context
  timestamp: number         // Error timestamp
}
```

### Request Configuration

```tsx
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  headers?: Record<string, string>
  data?: any
  params?: Record<string, string | number | boolean>
  timeout?: number
  retry?: RetryConfig
  correlationId?: string
}
```

## Best Practices

### 1. Always use the ErrorProvider
Wrap your entire application to ensure consistent error handling.

### 2. Use enhanced API client for external requests
The enhanced client provides automatic retry, error handling, and user notifications.

### 3. Report meaningful errors
Include context when reporting custom errors to help with debugging.

```tsx
reportError(error, {
  component: 'UserProfile',
  action: 'updateSettings', 
  userId: user.id,
  timestamp: Date.now()
})
```

### 4. Handle offline scenarios
Use network status to provide appropriate fallbacks.

```tsx
if (!isOnline) {
  // Show cached data or offline message
  return <OfflineView cachedData={data} />
}
```

### 5. Provide user actions
For recoverable errors, provide clear actions users can take.

```tsx
// Authentication errors automatically show "Sign In" action
// Rate limit errors show "Try Later" with countdown
// Network errors show "Retry" button
```

## Integration Examples

### Chart Component with Error Handling

```tsx
import { useErrorContext } from '../components/ErrorProvider'
import { enhancedApiClient } from '../services/api-enhanced'

function ChartComponent({ symbol }) {
  const { reportError } = useErrorContext()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await enhancedApiClient.getHistoricalData(
        symbol, '1D', 30
      )
      setData(result)
    } catch (error) {
      reportError(error, { 
        component: 'ChartComponent',
        symbol,
        timeframe: '1D' 
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (symbol) fetchData()
  }, [symbol])

  if (loading) return <LoadingSpinner />
  if (!data) return <EmptyState onRetry={fetchData} />
  
  return <Chart data={data} />
}
```

### Form with Validation Error Handling

```tsx
function SettingsForm() {
  const { reportError } = useErrorContext()
  
  const handleSubmit = async (formData) => {
    try {
      await enhancedApiClient.saveUserPreferences(formData)
      // Success notification handled automatically
    } catch (error) {
      if (error.category === 'validation') {
        // Handle validation errors specifically
        setFieldErrors(error.details?.fieldErrors || {})
      } else {
        // Let error system handle other types
        reportError(error, { 
          component: 'SettingsForm',
          formData: Object.keys(formData) // Don't log sensitive data
        })
      }
    }
  }
}
```

## Testing

The error handling system includes comprehensive tests covering:
- Error categorization
- Retry logic validation  
- Network status simulation
- Offline queue management
- API client integration
- Performance and memory usage

Run tests with:
```bash
npm test src/services/__tests__/error-handling.test.ts
```

## Analytics Integration

The system is ready for analytics integration:

```tsx
// Error events are automatically tracked
// Integrate with your analytics service:
ErrorHandler.onError = (errorEvent) => {
  analytics.track('error_occurred', {
    category: errorEvent.error.category,
    message: errorEvent.error.message,
    correlationId: errorEvent.metadata.correlationId,
    userId: errorEvent.session.userId
  })
}
```

## Performance Considerations

- Error log size is automatically limited (max 1000 entries)
- Notifications are deduplicated to prevent spam
- Request queuing is limited (max 50 offline requests)
- Memory usage is optimized with automatic cleanup
- Correlation IDs are generated efficiently

## Browser Support

- Modern browsers with fetch API support
- Network Connection API (optional, degrades gracefully)
- AbortController for request cancellation
- localStorage for offline queue persistence (optional)

---

This error handling system provides a solid foundation for production applications with excellent user experience and developer productivity.