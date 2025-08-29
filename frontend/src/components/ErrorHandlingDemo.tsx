/**
 * Error Handling Demo Component
 * Demonstrates the comprehensive error handling system capabilities
 */

import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Chip,
  Stack,
} from '@mui/material'
import { 
  NetworkCheck as NetworkIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material'

import { useErrorContext } from './ErrorProvider'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { enhancedApiClient } from '../services/api-enhanced'
import { ErrorHandler } from '../services/ErrorHandler'
import { ErrorCategory, ErrorSeverity } from '../types/errors'

const ErrorHandlingDemo: React.FC = () => {
  const { reportError, clearErrors, networkQuality, errorStats } = useErrorContext()
  const { isOnline, networkStatus, connectionStability } = useNetworkStatus()
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Simulate different types of errors for demonstration
   */
  const simulateError = async (errorType: string) => {
    setIsLoading(true)
    
    try {
      switch (errorType) {
        case 'network':
          // Simulate network error
          throw new TypeError('fetch failed - network error')
        
        case 'timeout':
          // Simulate timeout error  
          throw new DOMException('Request timeout', 'AbortError')
        
        case 'server':
          // Simulate server error
          const serverError = new Error('Internal Server Error')
          ;(serverError as any).status = 500
          throw serverError
        
        case 'auth':
          // Simulate authentication error
          const authError = new Error('Unauthorized')
          ;(authError as any).status = 401
          throw authError
        
        case 'rate_limit':
          // Simulate rate limit error
          const rateLimitError = new Error('Too Many Requests')
          ;(rateLimitError as any).status = 429
          throw rateLimitError
        
        case 'validation':
          // Simulate validation error
          const validationError = new Error('Invalid input data')
          ;(validationError as any).status = 400
          throw validationError
        
        case 'api_call':
          // Test real API call with error handling
          await enhancedApiClient.searchSymbols({ query: 'TEST_ERROR' })
          break
        
        default:
          throw new Error('Unknown error type')
      }
    } catch (error) {
      // Report error through our system
      reportError(error, {
        userTriggered: true,
        demoType: errorType,
        timestamp: Date.now(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Test network connectivity
   */
  const testConnectivity = async () => {
    setIsLoading(true)
    try {
      const result = await enhancedApiClient.healthCheck()
      reportError(`Connectivity test successful: ${JSON.stringify(result)}`, {
        level: 'success',
      })
    } catch (error) {
      reportError(error, { connectivityTest: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Error Handling System Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This demo showcases the comprehensive error handling, retry logic, 
        network monitoring, and user notification system.
      </Typography>

      <Grid container spacing={3}>
        {/* Network Status Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NetworkIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Network Status</Typography>
              </Box>
              
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Status:</Typography>
                  <Chip 
                    label={isOnline ? 'Online' : 'Offline'} 
                    color={isOnline ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Quality:</Typography>
                  <Chip 
                    label={networkQuality}
                    color={
                      networkQuality === 'excellent' ? 'success' :
                      networkQuality === 'good' ? 'info' :
                      networkQuality === 'fair' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Stability:</Typography>
                  <Typography variant="body2">
                    {Math.round(connectionStability * 100)}%
                  </Typography>
                </Box>
                
                {networkStatus.rtt && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Latency:</Typography>
                    <Typography variant="body2">{networkStatus.rtt}ms</Typography>
                  </Box>
                )}
                
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={testConnectivity}
                  disabled={isLoading}
                  startIcon={<RefreshIcon />}
                >
                  Test Connectivity
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Error Statistics Card */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TimelineIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Error Statistics</Typography>
              </Box>
              
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Total Errors:</Typography>
                  <Typography variant="body2">{errorStats.totalErrors}</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Network:</Typography>
                  <Typography variant="body2">
                    {errorStats.errorsByCategory[ErrorCategory.NETWORK] || 0}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Server:</Typography>
                  <Typography variant="body2">
                    {errorStats.errorsByCategory[ErrorCategory.SERVER] || 0}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Auth:</Typography>
                  <Typography variant="body2">
                    {errorStats.errorsByCategory[ErrorCategory.AUTHENTICATION] || 0}
                  </Typography>
                </Box>
                
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={clearErrors}
                  startIcon={<RefreshIcon />}
                >
                  Clear History
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Error Simulation Card */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ErrorIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Error Simulation</Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Test different error scenarios and see how the system handles them.
              </Typography>
              
              <Stack spacing={1}>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => simulateError('network')}
                  disabled={isLoading}
                  color="error"
                >
                  Network Error
                </Button>
                
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => simulateError('timeout')}
                  disabled={isLoading}
                  color="warning"
                >
                  Timeout Error
                </Button>
                
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => simulateError('server')}
                  disabled={isLoading}
                  color="error"
                >
                  Server Error (500)
                </Button>
                
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => simulateError('auth')}
                  disabled={isLoading}
                  color="secondary"
                >
                  Auth Error (401)
                </Button>
                
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => simulateError('rate_limit')}
                  disabled={isLoading}
                  color="info"
                >
                  Rate Limit (429)
                </Button>
                
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => simulateError('validation')}
                  disabled={isLoading}
                  color="warning"
                >
                  Validation Error
                </Button>
                
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => simulateError('api_call')}
                  disabled={isLoading}
                >
                  Real API Call
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Errors Display */}
      {errorStats.recentErrors.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Errors
          </Typography>
          
          <Stack spacing={1}>
            {errorStats.recentErrors.slice(-5).map((errorEvent, index) => (
              <Alert 
                key={index}
                severity={
                  errorEvent.error.severity === ErrorSeverity.CRITICAL ? 'error' :
                  errorEvent.error.severity === ErrorSeverity.HIGH ? 'error' :
                  errorEvent.error.severity === ErrorSeverity.MEDIUM ? 'warning' : 'info'
                }
                variant="outlined"
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    <strong>{errorEvent.error.category}</strong>: {errorEvent.error.message}
                  </Typography>
                  <Chip 
                    label={errorEvent.error.severity}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Alert>
            ))}
          </Stack>
        </Box>
      )}
      
      {/* Usage Instructions */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>How to use:</strong>
            <br />
            • Click error buttons to simulate different error types
            • Watch the notifications appear with appropriate styling and actions
            • Monitor network status and error statistics in real-time
            • Try going offline/online to see queue management in action
            • All errors are automatically categorized, tracked, and handled appropriately
          </Typography>
        </Alert>
      </Box>
    </Box>
  )
}

export default ErrorHandlingDemo