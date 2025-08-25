import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error)
    console.error('Error details:', errorInfo)
    
    this.setState({ errorInfo })
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>🚨 Something went wrong</h2>
            <p>The application encountered an unexpected error.</p>
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
              <summary>Error Details</summary>
              <p><strong>Error:</strong> {this.state.error?.message}</p>
              <p><strong>Stack:</strong></p>
              <code>{this.state.error?.stack}</code>
              {this.state.errorInfo && (
                <>
                  <p><strong>Component Stack:</strong></p>
                  <code>{this.state.errorInfo.componentStack}</code>
                </>
              )}
            </details>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional error boundary for specific sections
export const ErrorFallback = ({ 
  error, 
  resetError 
}: { 
  error: Error
  resetError?: () => void 
}) => (
  <div className="error-fallback">
    <h3>⚠️ Error in this section</h3>
    <p>{error.message}</p>
    {resetError && (
      <button onClick={resetError} className="retry-button">
        🔄 Try Again
      </button>
    )}
  </div>
)

export default ErrorBoundary