/**
 * Network Status Hook for NovaSignal
 * Online/offline detection and network information
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { NetworkStatus } from '../types/errors'

// ============================================================================
// Network Status Hook
// ============================================================================

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(() => 
    getInitialNetworkStatus()
  )
  
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    isOnline: boolean
    timestamp: number
    duration?: number
  }>>([])

  const lastStatusChangeRef = useRef<number>(Date.now())
  const statusCheckIntervalRef = useRef<NodeJS.Timeout>()

  /**
   * Update network status
   */
  const updateNetworkStatus = useCallback(() => {
    const newStatus = getCurrentNetworkStatus()
    const now = Date.now()
    
    setNetworkStatus(prevStatus => {
      // Only update if status actually changed
      if (prevStatus.isOnline !== newStatus.isOnline) {
        const duration = now - lastStatusChangeRef.current
        lastStatusChangeRef.current = now
        
        // Add to connection history
        setConnectionHistory(prev => [
          ...prev.slice(-9), // Keep last 10 entries
          {
            isOnline: prevStatus.isOnline,
            timestamp: now,
            duration,
          }
        ])

        return {
          ...newStatus,
          lastOnline: newStatus.isOnline ? now : prevStatus.lastOnline,
          lastOffline: !newStatus.isOnline ? now : prevStatus.lastOffline,
        }
      }
      
      // Update other properties even if online status hasn't changed
      return {
        ...prevStatus,
        ...newStatus,
      }
    })
  }, [])

  /**
   * Check connection quality by making a test request
   */
  const checkConnectionQuality = useCallback(async (): Promise<{
    latency: number
    isHealthy: boolean
  }> => {
    if (!navigator.onLine) {
      return { latency: Infinity, isHealthy: false }
    }

    try {
      const start = performance.now()
      
      // Use a lightweight endpoint for testing
      await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      })
      
      const latency = performance.now() - start
      return {
        latency,
        isHealthy: latency < 2000, // Consider healthy if under 2 seconds
      }
    } catch (error) {
      return { latency: Infinity, isHealthy: false }
    }
  }, [])

  /**
   * Test network connectivity with custom endpoint
   */
  const testConnectivity = useCallback(async (url?: string): Promise<boolean> => {
    if (!navigator.onLine) return false

    try {
      const testUrl = url || '/api/health'
      const response = await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(3000),
      })
      return response.ok
    } catch {
      return false
    }
  }, [])

  /**
   * Get connection stability score (0-1)
   */
  const getConnectionStability = useCallback((): number => {
    if (connectionHistory.length < 2) return 1

    const recentHistory = connectionHistory.slice(-5)
    const disconnections = recentHistory.filter(entry => !entry.isOnline).length
    
    return Math.max(0, 1 - (disconnections / recentHistory.length))
  }, [connectionHistory])

  /**
   * Setup event listeners and monitoring
   */
  useEffect(() => {
    const handleOnline = () => updateNetworkStatus()
    const handleOffline = () => updateNetworkStatus()

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Monitor connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const handleConnectionChange = () => updateNetworkStatus()
      
      connection.addEventListener('change', handleConnectionChange)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener('change', handleConnectionChange)
        
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current)
        }
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
      }
    }
  }, [updateNetworkStatus])

  /**
   * Periodic network status check
   */
  useEffect(() => {
    // Check network status every 30 seconds
    statusCheckIntervalRef.current = setInterval(() => {
      updateNetworkStatus()
    }, 30000)

    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
      }
    }
  }, [updateNetworkStatus])

  /**
   * Force network status refresh
   */
  const refreshNetworkStatus = useCallback(() => {
    updateNetworkStatus()
  }, [updateNetworkStatus])

  return {
    // Current status
    networkStatus,
    isOnline: networkStatus.isOnline,
    connectionType: networkStatus.connectionType,
    effectiveType: networkStatus.effectiveType,
    
    // Connection quality
    rtt: networkStatus.rtt,
    downlink: networkStatus.downlink,
    
    // Timestamps
    lastOnline: networkStatus.lastOnline,
    lastOffline: networkStatus.lastOffline,
    
    // History and stability
    connectionHistory,
    connectionStability: getConnectionStability(),
    
    // Actions
    checkConnectionQuality,
    testConnectivity,
    refreshNetworkStatus,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get initial network status
 */
function getInitialNetworkStatus(): NetworkStatus {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const connection = getConnectionInfo()
  
  return {
    isOnline,
    ...connection,
    lastOnline: isOnline ? Date.now() : undefined,
    lastOffline: !isOnline ? Date.now() : undefined,
  }
}

/**
 * Get current network status
 */
function getCurrentNetworkStatus(): NetworkStatus {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const connection = getConnectionInfo()
  
  return {
    isOnline,
    ...connection,
  }
}

/**
 * Get connection information from Navigator API
 */
function getConnectionInfo() {
  if (typeof navigator === 'undefined') {
    return {}
  }

  const connection = (navigator as any)?.connection || 
                    (navigator as any)?.mozConnection || 
                    (navigator as any)?.webkitConnection

  if (!connection) {
    return {}
  }

  return {
    connectionType: connection.type,
    effectiveType: connection.effectiveType,
    rtt: connection.rtt,
    downlink: connection.downlink,
  }
}

// ============================================================================
// Advanced Network Monitoring Hook
// ============================================================================

/**
 * Advanced network monitoring with performance tracking
 */
export const useNetworkMonitoring = () => {
  const { networkStatus, isOnline, checkConnectionQuality } = useNetworkStatus()
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    averageLatency: number
    successRate: number
    errorRate: number
    lastChecked: number
  }>({
    averageLatency: 0,
    successRate: 1,
    errorRate: 0,
    lastChecked: Date.now(),
  })

  const metricsHistoryRef = useRef<Array<{
    timestamp: number
    latency: number
    success: boolean
  }>>([])

  /**
   * Perform network health check
   */
  const performHealthCheck = useCallback(async () => {
    const result = await checkConnectionQuality()
    const timestamp = Date.now()
    
    // Add to metrics history
    metricsHistoryRef.current.push({
      timestamp,
      latency: result.latency,
      success: result.isHealthy,
    })

    // Keep only last 50 measurements
    if (metricsHistoryRef.current.length > 50) {
      metricsHistoryRef.current = metricsHistoryRef.current.slice(-50)
    }

    // Calculate performance metrics
    const recent = metricsHistoryRef.current.slice(-10)
    const averageLatency = recent.reduce((sum, entry) => 
      sum + (entry.latency === Infinity ? 5000 : entry.latency), 0
    ) / recent.length

    const successfulChecks = recent.filter(entry => entry.success).length
    const successRate = successfulChecks / recent.length
    const errorRate = 1 - successRate

    setPerformanceMetrics({
      averageLatency,
      successRate,
      errorRate,
      lastChecked: timestamp,
    })

    return result
  }, [checkConnectionQuality])

  /**
   * Get network quality assessment
   */
  const getNetworkQuality = useCallback((): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' => {
    if (!isOnline) return 'offline'
    
    const { averageLatency, successRate } = performanceMetrics
    
    if (successRate >= 0.95 && averageLatency < 200) return 'excellent'
    if (successRate >= 0.90 && averageLatency < 500) return 'good'
    if (successRate >= 0.80 && averageLatency < 1000) return 'fair'
    return 'poor'
  }, [isOnline, performanceMetrics])

  /**
   * Check if network is suitable for real-time features
   */
  const isRealtimeCapable = useCallback((): boolean => {
    const quality = getNetworkQuality()
    return quality === 'excellent' || quality === 'good'
  }, [getNetworkQuality])

  // Periodic health checks
  useEffect(() => {
    if (!isOnline) return

    const interval = setInterval(performHealthCheck, 60000) // Every minute
    
    // Perform initial check
    performHealthCheck()

    return () => clearInterval(interval)
  }, [isOnline, performHealthCheck])

  return {
    networkStatus,
    performanceMetrics,
    performHealthCheck,
    getNetworkQuality,
    isRealtimeCapable,
    metricsHistory: metricsHistoryRef.current,
  }
}

// ============================================================================
// Export types and utilities
// ============================================================================

export type { NetworkStatus } from '../types/errors'

export {
  getCurrentNetworkStatus,
  getConnectionInfo,
}