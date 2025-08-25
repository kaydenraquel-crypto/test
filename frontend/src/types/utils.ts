/**
 * Utility Types for NovaSignal
 * Common TypeScript utility types and helper types
 */

// ============================================================================
// Common Utility Types
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/**
 * Pick properties that are functions
 */
export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T]

/**
 * Pick properties that are not functions
 */
export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]

/**
 * Extract function properties
 */
export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>

/**
 * Extract non-function properties
 */
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * Union to intersection
 */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

/**
 * Flatten object type
 */
export type Flatten<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

// ============================================================================
// Event Handler Types
// ============================================================================

/**
 * Generic event handler
 */
export type EventHandler<T = any> = (event: T) => void

/**
 * Async event handler
 */
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>

/**
 * Callback with error handling
 */
export type CallbackWithError<T = any> = (error: Error | null, data?: T) => void

/**
 * Generic callback
 */
export type Callback<T = any> = (data: T) => void

/**
 * Async callback
 */
export type AsyncCallback<T = any> = (data: T) => Promise<void>

/**
 * Unsubscribe function
 */
export type Unsubscribe = () => void

/**
 * Event emitter callback
 */
export type EmitterCallback<T = any> = (...args: T[]) => void

// ============================================================================
// Data Transformation Types
// ============================================================================

/**
 * Data transformer function
 */
export type DataTransformer<TInput, TOutput> = (input: TInput) => TOutput

/**
 * Async data transformer
 */
export type AsyncDataTransformer<TInput, TOutput> = (input: TInput) => Promise<TOutput>

/**
 * Data validator function
 */
export type DataValidator<T> = (data: T) => boolean

/**
 * Data validator with error message
 */
export type DataValidatorWithError<T> = (data: T) => { valid: boolean; error?: string }

/**
 * Data serializer
 */
export type DataSerializer<T> = {
  serialize: (data: T) => string
  deserialize: (serialized: string) => T
}

/**
 * Generic parser
 */
export type Parser<TInput, TOutput> = (input: TInput) => TOutput | null

// ============================================================================
// Promise and Async Types
// ============================================================================

/**
 * Promise resolver
 */
export type PromiseResolver<T> = (value: T | PromiseLike<T>) => void

/**
 * Promise rejector
 */
export type PromiseRejector = (reason?: any) => void

/**
 * Deferred promise
 */
export interface Deferred<T> {
  promise: Promise<T>
  resolve: PromiseResolver<T>
  reject: PromiseRejector
}

/**
 * Async operation state
 */
export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Async operation result
 */
export type AsyncResult<T> = 
  | { success: true; data: T }
  | { success: false; error: Error }

// ============================================================================
// API Types
// ============================================================================

/**
 * API endpoint configuration
 */
export interface APIEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  timeout?: number
  retries?: number
  cache?: boolean
}

/**
 * API request configuration
 */
export interface APIRequestConfig {
  headers?: Record<string, string>
  params?: Record<string, any>
  timeout?: number
  signal?: AbortSignal
}

/**
 * API response wrapper
 */
export interface APIResponseWrapper<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: APIRequestConfig
}

/**
 * Paginated response
 */
export interface PaginatedData<T> {
  items: T[]
  page: number
  limit: number
  total: number
  hasNext: boolean
  hasPrevious: boolean
}

// ============================================================================
// State Management Types
// ============================================================================

/**
 * State action
 */
export interface StateAction<T = any> {
  type: string
  payload?: T
  meta?: Record<string, any>
}

/**
 * State reducer
 */
export type StateReducer<TState, TAction> = (state: TState, action: TAction) => TState

/**
 * State selector
 */
export type StateSelector<TState, TResult> = (state: TState) => TResult

/**
 * State middleware
 */
export type StateMiddleware<TState, TAction> = (
  state: TState,
  action: TAction,
  next: (action: TAction) => TState
) => TState

/**
 * Store subscription
 */
export interface StoreSubscription<T> {
  unsubscribe: Unsubscribe
  selector?: StateSelector<any, T>
  callback: Callback<T>
}

// ============================================================================
// Component Types
// ============================================================================

/**
 * Component with children
 */
export interface WithChildren {
  children?: React.ReactNode
}

/**
 * Component with className
 */
export interface WithClassName {
  className?: string
}

/**
 * Component with test ID
 */
export interface WithTestId {
  testId?: string
}

/**
 * Component with loading state
 */
export interface WithLoading {
  loading?: boolean
}

/**
 * Component with error state
 */
export interface WithError {
  error?: string | null
}

/**
 * Base component props
 */
export interface BaseProps extends WithChildren, WithClassName, WithTestId, WithLoading, WithError {
  id?: string
  style?: React.CSSProperties
  disabled?: boolean
}

/**
 * Forward ref component type
 */
export type ForwardRefComponent<T, P = {}> = React.ForwardRefRenderFunction<T, P>

// ============================================================================
// Chart Types
// ============================================================================

/**
 * Chart point
 */
export interface ChartPoint {
  x: number | string
  y: number
}

/**
 * Chart dataset
 */
export interface ChartDataset {
  label: string
  data: ChartPoint[]
  color?: string
  borderColor?: string
  backgroundColor?: string
  borderWidth?: number
  fill?: boolean
}

/**
 * Chart configuration
 */
export interface ChartConfiguration {
  type: 'line' | 'candlestick' | 'area' | 'histogram'
  datasets: ChartDataset[]
  options?: Record<string, any>
}

/**
 * Chart event
 */
export interface ChartEvent {
  type: string
  target: any
  point?: ChartPoint
  series?: string
  time?: number
}

// ============================================================================
// Performance Types
// ============================================================================

/**
 * Performance measurement
 */
export interface PerformanceMeasurement {
  name: string
  startTime: number
  endTime: number
  duration: number
  metadata?: Record<string, any>
}

/**
 * Performance observer entry
 */
export interface PerformanceObserverEntry {
  name: string
  entryType: string
  startTime: number
  duration: number
}

/**
 * Memory usage info
 */
export interface MemoryUsage {
  used: number
  total: number
  percentage: number
  timestamp: number
}

/**
 * FPS measurement
 */
export interface FPSMeasurement {
  fps: number
  frameTime: number
  timestamp: number
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Application error
 */
export interface AppError extends Error {
  code?: string
  context?: Record<string, any>
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Validation error
 */
export interface ValidationError extends AppError {
  field?: string
  value?: any
  constraints?: string[]
}

/**
 * Network error
 */
export interface NetworkError extends AppError {
  status?: number
  statusText?: string
  url?: string
  method?: string
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test'
  API_BASE_URL: string
  WS_BASE_URL: string
  API_TIMEOUT: number
  CACHE_TTL: number
  DEBUG: boolean
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  enablePerformanceMonitoring: boolean
  enableDebugMode: boolean
  enableExperimentalFeatures: boolean
  enableOfflineMode: boolean
  enableAnalytics: boolean
}

/**
 * Application metadata
 */
export interface AppMetadata {
  name: string
  version: string
  buildTime: string
  commitHash: string
  environment: string
}

// ============================================================================
// Utility Types (exported through main index.ts)
// ============================================================================

// Note: All types are now exported through the main types/index.ts file
// to avoid conflicts and maintain a single source of truth