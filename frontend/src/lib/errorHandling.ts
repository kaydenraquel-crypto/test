// Enhanced error handling utilities for NovaSignal

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
  timestamp: number
  endpoint?: string
}

export interface ErrorState {
  isError: boolean
  error?: ApiError
  retryCount: number
  lastRetryTime?: number
}

// Create standardized API error
export function createApiError(
  message: string,
  status?: number,
  endpoint?: string,
  details?: any
): ApiError {
  return {
    message,
    status,
    endpoint,
    details,
    timestamp: Date.now(),
    code: status ? `HTTP_${status}` : 'API_ERROR'
  }
}

// Enhanced fetch wrapper with retry logic
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const text = await response.text().catch(() => 'Unknown error')
        throw createApiError(
          `Request failed: ${text || response.statusText}`,
          response.status,
          url,
          { attempt, maxRetries }
        )
      }

      const data = await response.json()
      
      // Log successful retry
      if (attempt > 1) {
        console.log(`✅ Request succeeded on attempt ${attempt}/${maxRetries}`)
      }
      
      return data
    } catch (error) {
      lastError = error as Error
      
      console.warn(`❌ Request failed (attempt ${attempt}/${maxRetries}):`, {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        attempt,
        willRetry: attempt < maxRetries
      })

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status
        if (status && status >= 400 && status < 500 && status !== 429) {
          throw error
        }
      }

      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

// Error boundary helpers
export function logError(error: Error, context?: string) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }
  
  console.error('🚨 Application Error:', errorInfo)
  
  // In production, send to error tracking service
  if (typeof window !== 'undefined' && (window as any).__NODE_ENV === 'production') {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }
}

// Network connectivity check
export function checkNetworkConnectivity(): Promise<boolean> {
  return new Promise((resolve) => {
    // Try to fetch a small resource
    fetch('/favicon.ico', { 
      method: 'HEAD',
      cache: 'no-cache'
    })
    .then(() => resolve(true))
    .catch(() => resolve(false))
    .finally(() => {
      // Fallback to navigator.onLine
      if (!navigator.onLine) {
        resolve(false)
      }
    })
  })
}

// Hook for managing error state
export function useErrorHandler() {
  const [errorState, setErrorState] = React.useState<ErrorState>({
    isError: false,
    retryCount: 0
  })

  const handleError = React.useCallback((error: Error | ApiError, context?: string) => {
    logError(error instanceof Error ? error : new Error(error.message), context)
    
    setErrorState(prev => ({
      isError: true,
      error: error instanceof Error ? createApiError(error.message) : error,
      retryCount: prev.retryCount + 1,
      lastRetryTime: Date.now()
    }))
  }, [])

  const clearError = React.useCallback(() => {
    setErrorState({
      isError: false,
      retryCount: 0
    })
  }, [])

  const retry = React.useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      isError: false,
      lastRetryTime: Date.now()
    }))
  }, [])

  return {
    ...errorState,
    handleError,
    clearError,
    retry
  }
}

// Import React for the hook
import React from 'react'