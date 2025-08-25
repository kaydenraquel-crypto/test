/**
 * Type-Safe API Utilities
 * Comprehensive API client with full TypeScript support
 */

import {
  APIResponse,
  APIError,
  HTTPMethod,
  RequestOptions,
  HTTPClient
} from '../types'

// ============================================================================
// Utility Types
// ============================================================================

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// ============================================================================
// API Configuration
// ============================================================================

interface APIClientConfig {
  baseURL: string
  timeout: number
  retries: number
  headers: Record<string, string>
  interceptors: {
    request: RequestInterceptor[]
    response: ResponseInterceptor[]
  }
}

type RequestInterceptor = (config: RequestOptions) => RequestOptions | Promise<RequestOptions>
type ResponseInterceptor<T = any> = (response: APIResponse<T>) => APIResponse<T> | Promise<APIResponse<T>>

// ============================================================================
// API Client Implementation
// ============================================================================

class TypeSafeAPIClient implements HTTPClient {
  private config: APIClientConfig
  private abortControllers: Map<string, AbortController> = new Map()

  constructor(config: DeepPartial<APIClientConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || 'http://localhost:8000',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      interceptors: {
        request: (config.interceptors?.request || []).filter(Boolean) as RequestInterceptor[],
        response: (config.interceptors?.response || []).filter(Boolean) as ResponseInterceptor[]
      }
    }
  }

  // ============================================================================
  // HTTP Methods
  // ============================================================================

  async get<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', url, undefined, options)
  }

  async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', url, data, options)
  }

  async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', url, data, options)
  }

  async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', url, data, options)
  }

  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', url, undefined, options)
  }

  // ============================================================================
  // Core Request Method
  // ============================================================================

  async request<T = any>(
    method: HTTPMethod,
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Create abort controller
    const abortController = new AbortController()
    this.abortControllers.set(requestId, abortController)

    try {
      // Prepare request config
      let requestConfig: RequestOptions & { url: string; requestId: string } = {
        ...options,
        method,
        url,
        requestId
      }

      // Apply request interceptors
      for (const interceptor of this.config.interceptors.request) {
        const interceptedConfig = await interceptor(requestConfig)
        requestConfig = { ...requestConfig, ...interceptedConfig }
      }

      // Build full URL
      const fullURL = url.startsWith('http') ? url : `${this.config.baseURL}${url}`

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method,
        headers: {
          ...this.config.headers,
          ...requestConfig.headers
        },
        signal: abortController.signal
      }

      // Add body for POST/PUT/PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(method) && data) {
        fetchOptions.body = JSON.stringify(data)
      }

      // Add query parameters for GET requests
      if (method === 'GET' && requestConfig.params) {
        const urlObj = new URL(fullURL)
        Object.entries(requestConfig.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            urlObj.searchParams.append(key, String(value))
          }
        })
        requestConfig.url = urlObj.toString()
      }

      // Execute request with retries
      let lastError: Error
      for (let attempt = 1; attempt <= this.config.retries; attempt++) {
        try {
          const response = await fetch(requestConfig.url, fetchOptions)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const responseData = await response.json()
          
          // Apply response interceptors
          let processedData = responseData
          for (const interceptor of this.config.interceptors.response) {
            processedData = await interceptor(processedData)
          }

          return processedData

        } catch (error) {
          lastError = error as Error
          
          // Don't retry on abort or client errors
          if (error instanceof Error && error.name === 'AbortError') {
            throw error
          }
          
          if (attempt < this.config.retries) {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
            continue
          }
        }
      }

      throw lastError!

    } finally {
      // Clean up abort controller
      this.abortControllers.delete(requestId)
    }
  }

  // ============================================================================
  // Abort Management
  // ============================================================================

  abortRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId)
    if (controller) {
      controller.abort()
      this.abortControllers.delete(requestId)
    }
  }

  abortAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort())
    this.abortControllers.clear()
  }
}

// ============================================================================
// HTTP Client Implementation
// ============================================================================

export class HTTPClientImpl implements HTTPClient {
  private apiClient: TypeSafeAPIClient

  constructor(config: DeepPartial<APIClientConfig> = {}) {
    this.apiClient = new TypeSafeAPIClient(config)
  }

  async get<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.apiClient.get<T>(url, options)
  }

  async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.apiClient.post<T>(url, data, options)
  }

  async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.apiClient.put<T>(url, data, options)
  }

  async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.apiClient.patch<T>(url, data, options)
  }

  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.apiClient.delete<T>(url, options)
  }

  async request<T = any>(
    method: HTTPMethod,
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.apiClient.request<T>(method, url, data, options)
  }

  abortRequest(requestId: string): void {
    this.apiClient.abortRequest(requestId)
  }

  abortAllRequests(): void {
    this.apiClient.abortAllRequests()
  }
}

// ============================================================================
// API Functions
// ============================================================================

// Create API client instance
const apiClient = new HTTPClientImpl({
  baseURL: (typeof window !== 'undefined' && (window as any).__VITE_API_BASE_URL) || 'http://localhost:8000',
  timeout: 30000,
  retries: 3
})

// API functions with proper type safety
export const api = {
  /**
   * Get historical data
   */
  async getHistoricalData(request: any): Promise<any> {
    return apiClient.get('/api/history', { params: request })
  },

  /**
   * Get technical indicators
   */
  async getIndicators(request: any): Promise<any> {
    return apiClient.post('/api/indicators', request)
  },

  /**
   * Get trading signals
   */
  async getSignals(request: any): Promise<any> {
    return apiClient.post('/api/signals', request)
  },

  /**
   * Get news
   */
  async getNews(request: any): Promise<any> {
    return apiClient.get('/api/news', { params: request })
  },

  /**
   * Get economic events
   */
  async getEconomicEvents(request: any): Promise<any> {
    return apiClient.get('/api/economic-events', { params: request })
  },

  /**
   * Search symbols
   */
  async searchSymbols(request: any): Promise<any> {
    return apiClient.get('/api/symbols/search', { params: request })
  },

  /**
   * Get AI analysis
   */
  async getAIAnalysis(request: {
    symbol: string
    market: string
    summary: string
    indicators: any
    signals: any[]
    news: any[]
  }): Promise<any> {
    return apiClient.post('/api/llm/analyze', request)
  },

  /**
   * Get market scan
   */
  async getMarketScan(): Promise<any> {
    return apiClient.get('/api/llm/scan')
  }
}

// ============================================================================
// WebSocket Manager
// ============================================================================

export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: number | null = null
  private messageQueue: any[] = []
  private isConnected = false

  constructor(
    private url: string,
    private onMessage?: (data: any) => void,
    private onError?: (error: Event) => void,
    private onClose?: () => void
  ) {}

  connect(): void {
    try {
      this.ws = new WebSocket(this.url)
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      this.scheduleReconnect()
    }
  }

  private handleOpen(): void {
    console.log('WebSocket connected')
    this.isConnected = true
    this.reconnectAttempts = 0
    this.startHeartbeat()
    this.flushMessageQueue()
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data)
      if (this.onMessage) {
        this.onMessage(data)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error)
    if (this.onError) {
      this.onError(error)
    }
  }

  private handleClose(): void {
    console.log('WebSocket disconnected')
    this.isConnected = false
    this.stopHeartbeat()
    
    if (this.onClose) {
      this.onClose()
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connect()
    }, delay)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      if (this.isConnected && this.ws) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
      }
    }, 30000) // 30 second heartbeat
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  send(data: any): void {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(data))
    } else {
      this.messageQueue.push(data)
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.send(message)
    }
  }

  disconnect(): void {
    this.isConnected = false
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Export everything
export { apiClient }
export default api