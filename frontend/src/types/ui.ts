/**
 * UI Component Types for NovaSignal
 * TypeScript definitions for user interface components and interactions
 */

import { ReactNode, CSSProperties, MouseEvent, KeyboardEvent } from 'react'
import { MarketType, Timeframe, Symbol, TradingSignal, IndicatorData } from './market'

// ============================================================================
// Base UI Types
// ============================================================================

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'auto'

/**
 * Color scheme for charts and UI
 */
export interface ColorScheme {
  /** Primary color */
  primary: string
  /** Secondary color */
  secondary: string
  /** Success color (green) */
  success: string
  /** Warning color (orange) */
  warning: string
  /** Error color (red) */
  error: string
  /** Background color */
  background: string
  /** Surface color */
  surface: string
  /** Text color */
  text: string
  /** Muted text color */
  textMuted: string
  /** Border color */
  border: string
  /** Chart colors */
  chart: {
    /** Bullish candle color */
    bullish: string
    /** Bearish candle color */
    bearish: string
    /** Grid color */
    grid: string
    /** Axis color */
    axis: string
  }
}

/**
 * Size variants
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button variant
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

/**
 * Toast notification type
 */
export type ToastType = 'success' | 'warning' | 'error' | 'info'

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Base component props
 */
export interface BaseComponentProps {
  /** CSS class name */
  className?: string
  /** Inline styles */
  style?: CSSProperties
  /** Test ID for testing */
  testId?: string
  /** Whether component is disabled */
  disabled?: boolean
  /** Whether component is loading */
  loading?: boolean
}

/**
 * Button component props
 */
export interface ButtonProps extends BaseComponentProps {
  /** Button variant */
  variant?: ButtonVariant
  /** Button size */
  size?: Size
  /** Button type */
  type?: 'button' | 'submit' | 'reset'
  /** Click handler */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  /** Button content */
  children: ReactNode
  /** Whether button is full width */
  fullWidth?: boolean
  /** Button icon */
  icon?: ReactNode
  /** Icon position */
  iconPosition?: 'left' | 'right'
}

/**
 * Input component props
 */
export interface InputProps extends BaseComponentProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'search'
  /** Input value */
  value?: string
  /** Default value */
  defaultValue?: string
  /** Placeholder text */
  placeholder?: string
  /** Input size */
  size?: Size
  /** Whether input is required */
  required?: boolean
  /** Whether input is readonly */
  readonly?: boolean
  /** Input name */
  name?: string
  /** Input ID */
  id?: string
  /** Auto complete */
  autoComplete?: string
  /** Change handler */
  onChange?: (value: string) => void
  /** Focus handler */
  onFocus?: () => void
  /** Blur handler */
  onBlur?: () => void
  /** Key down handler */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  /** Error message */
  error?: string
  /** Help text */
  helpText?: string
  /** Input label */
  label?: string
}

/**
 * Select component props
 */
export interface SelectProps extends BaseComponentProps {
  /** Selected value */
  value?: string
  /** Default value */
  defaultValue?: string
  /** Placeholder text */
  placeholder?: string
  /** Select size */
  size?: Size
  /** Whether select is required */
  required?: boolean
  /** Select options */
  options: SelectOption[]
  /** Change handler */
  onChange?: (value: string) => void
  /** Select label */
  label?: string
  /** Error message */
  error?: string
}

/**
 * Select option
 */
export interface SelectOption {
  /** Option value */
  value: string
  /** Option label */
  label: string
  /** Whether option is disabled */
  disabled?: boolean
  /** Option group */
  group?: string
}

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps {
  /** Whether modal is open */
  isOpen: boolean
  /** Close handler */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Modal size */
  size?: Size
  /** Whether modal can be closed by clicking outside */
  closeOnOutsideClick?: boolean
  /** Whether modal can be closed with escape key */
  closeOnEscape?: boolean
  /** Modal content */
  children: ReactNode
}

/**
 * Toast notification props
 */
export interface ToastProps extends BaseComponentProps {
  /** Toast type */
  type: ToastType
  /** Toast message */
  message: string
  /** Toast title */
  title?: string
  /** Whether toast is visible */
  visible: boolean
  /** Auto dismiss timeout in ms */
  autoHideDuration?: number
  /** Close handler */
  onClose?: () => void
  /** Action button */
  action?: {
    label: string
    onClick: () => void
  }
}

// ============================================================================
// Chart Component Types
// ============================================================================

/**
 * Chart configuration
 */
export interface ChartConfig {
  /** Chart width */
  width?: number
  /** Chart height */
  height?: number
  /** Background color */
  backgroundColor?: string
  /** Text color */
  textColor?: string
  /** Grid configuration */
  grid?: {
    /** Vertical lines color */
    vertLines?: string
    /** Horizontal lines color */
    horzLines?: string
  }
  /** Time scale configuration */
  timeScale?: {
    /** Bar spacing */
    barSpacing?: number
    /** Minimum bar spacing */
    minBarSpacing?: number
    /** Right offset */
    rightOffset?: number
    /** Whether to fix left edge */
    fixLeftEdge?: boolean
    /** Whether to fix right edge */
    fixRightEdge?: boolean
  }
  /** Price scale configuration */
  priceScale?: {
    /** Border color */
    borderColor?: string
    /** Scale margins */
    scaleMargins?: {
      top: number
      bottom: number
    }
  }
}

/**
 * Chart spacing manager configuration
 */
export interface ChartSpacingConfig {
  /** Base spacing between candles */
  baseSpacing: number
  /** Minimum spacing */
  minSpacing: number
  /** Maximum spacing */
  maxSpacing: number
  /** Right offset */
  rightOffset: number
  /** Whether to auto resize */
  autoResize: boolean
}

/**
 * Chart component props
 */
export interface ChartProps extends BaseComponentProps {
  /** Chart configuration */
  config?: ChartConfig
  /** Chart data */
  data: any[] // TODO: Use proper chart data type
  /** Chart width */
  width?: number
  /** Chart height */
  height?: number
  /** Loading state */
  loading?: boolean
  /** Error state */
  error?: string
  /** Ref for chart container */
  chartRef?: React.RefObject<HTMLDivElement>
}

// ============================================================================
// Trading Interface Types
// ============================================================================

/**
 * Symbol selector props
 */
export interface SymbolSelectorProps extends BaseComponentProps {
  /** Selected symbol */
  selectedSymbol: string
  /** Available symbols */
  symbols: Symbol[]
  /** Symbol change handler */
  onSymbolChange: (symbol: string) => void
  /** Whether to show search */
  showSearch?: boolean
  /** Whether to show favorites */
  showFavorites?: boolean
  /** Market filter */
  marketFilter?: MarketType
}

/**
 * Timeframe selector props
 */
export interface TimeframeSelectorProps extends BaseComponentProps {
  /** Selected timeframe */
  selectedTimeframe: Timeframe
  /** Available timeframes */
  timeframes?: Timeframe[]
  /** Timeframe change handler */
  onTimeframeChange: (timeframe: Timeframe) => void
}

/**
 * Market selector props
 */
export interface MarketSelectorProps extends BaseComponentProps {
  /** Selected market */
  selectedMarket: MarketType
  /** Available markets */
  markets?: MarketType[]
  /** Market change handler */
  onMarketChange: (market: MarketType) => void
}

/**
 * Technical indicators panel props
 */
export interface TechnicalIndicatorsProps extends BaseComponentProps {
  /** Indicator data */
  indicators: IndicatorData
  /** Current symbol */
  symbol: string
  /** Current timeframe */
  timeframe: Timeframe
  /** Whether panel is expanded */
  expanded?: boolean
  /** Expand toggle handler */
  onToggleExpanded?: () => void
}

/**
 * Trading signals panel props
 */
export interface TradingSignalsProps extends BaseComponentProps {
  /** Trading signals */
  signals: TradingSignal[]
  /** Current symbol */
  symbol: string
  /** Signal click handler */
  onSignalClick?: (signal: TradingSignal) => void
  /** Maximum signals to display */
  maxSignals?: number
}

/**
 * News panel props
 */
export interface NewsPanelProps extends BaseComponentProps {
  /** News articles */
  news: any[] // TODO: Use proper news type
  /** Current symbol */
  symbol: string
  /** Article click handler */
  onArticleClick?: (article: any) => void
  /** Maximum articles to display */
  maxArticles?: number
}

// ============================================================================
// Performance Monitoring Types
// ============================================================================

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Frames per second */
  fps: number
  /** Memory usage in MB */
  memoryUsage: number
  /** Average render time in ms */
  renderTime: number
  /** API latency in ms */
  apiLatency: number
  /** Chart render time in ms */
  chartRenderTime: number
  /** WebSocket latency in ms */
  wsLatency: number
  /** Last update timestamp */
  lastUpdate: number
}

/**
 * Performance alert
 */
export interface PerformanceAlert {
  /** Alert type */
  type: 'warning' | 'info' | 'error'
  /** Alert message */
  message: string
  /** Alert timestamp */
  timestamp: number
  /** Alert metric */
  metric?: keyof PerformanceMetrics
  /** Alert threshold */
  threshold?: number
}

/**
 * Performance monitor props
 */
export interface PerformanceMonitorProps extends BaseComponentProps {
  /** Performance metrics */
  metrics: PerformanceMetrics
  /** Performance alerts */
  alerts: PerformanceAlert[]
  /** Whether to show detailed view */
  detailed?: boolean
  /** Update interval in ms */
  updateInterval?: number
  /** Alert thresholds */
  thresholds?: Partial<PerformanceMetrics>
}

// ============================================================================
// Data Export Types
// ============================================================================

/**
 * Export format
 */
export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf' | 'png' | 'svg'

/**
 * Export options
 */
export interface ExportOptions {
  /** Export format */
  format: ExportFormat
  /** File name */
  filename?: string
  /** Date range */
  dateRange?: {
    start: Date
    end: Date
  }
  /** Data columns to include */
  columns?: string[]
  /** Chart settings for image export */
  chartSettings?: {
    width: number
    height: number
    theme: ThemeMode
  }
}

/**
 * Data export panel props
 */
export interface DataExportPanelProps extends BaseComponentProps {
  /** Current symbol */
  symbol: string
  /** Current market */
  market: MarketType
  /** Current timeframe */
  timeframe: Timeframe
  /** Chart data */
  data: any[]
  /** Indicator data */
  indicators?: IndicatorData
  /** Trading signals */
  signals?: TradingSignal[]
  /** News data */
  news?: any[]
  /** Chart container reference */
  chartContainer?: HTMLElement | null
  /** Export handler */
  onExport?: (options: ExportOptions) => void
}

// ============================================================================
// Search & Filter Types
// ============================================================================

/**
 * Search filter options
 */
export interface SearchFilters {
  /** Text search query */
  query?: string
  /** Market filter */
  market?: MarketType
  /** Category filter */
  category?: string
  /** Favorites only */
  favoritesOnly?: boolean
  /** Active symbols only */
  activeOnly?: boolean
}

/**
 * Search result
 */
export interface SearchResult<T = any> {
  /** Result item */
  item: T
  /** Search score (relevance) */
  score: number
  /** Matched fields */
  matches: string[]
}

/**
 * Search component props
 */
export interface SearchProps extends BaseComponentProps {
  /** Search query */
  query: string
  /** Search results */
  results: SearchResult[]
  /** Search handler */
  onSearch: (query: string) => void
  /** Result selection handler */
  onSelectResult: (result: SearchResult) => void
  /** Search placeholder */
  placeholder?: string
  /** Maximum results to display */
  maxResults?: number
  /** Whether search is loading */
  loading?: boolean
  /** Search filters */
  filters?: SearchFilters
  /** Filter change handler */
  onFiltersChange?: (filters: SearchFilters) => void
}

// ============================================================================
// WebSocket & Real-time Types
// ============================================================================

/**
 * WebSocket connection status
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting'

/**
 * WebSocket message types
 */
export type MessageType = 'price_data' | 'indicators' | 'signals' | 'news' | 'error' | 'status'

/**
 * WebSocket message
 */
export interface WebSocketMessage {
  /** Message type */
  type: MessageType
  /** Message data */
  data?: any
  /** Error message */
  error?: string
  /** Message timestamp */
  timestamp: number
  /** Message ID */
  id?: string
}

/**
 * WebSocket hook return type
 */
export interface UseWebSocketReturn {
  /** Connection status */
  isConnected: boolean
  /** Connection status text */
  connectionStatus: string
  /** Last received message */
  lastMessage: WebSocketMessage | null
  /** Send message function */
  sendMessage: (message: any) => void
  /** Connection error */
  error: string | null
  /** Reconnect function */
  reconnect: () => void
}

// ============================================================================
// User Preferences Types
// ============================================================================

/**
 * User preferences
 */
export interface UserPreferences {
  /** Theme settings */
  theme: {
    /** Theme mode */
    mode: ThemeMode
    /** Custom color scheme */
    colorScheme?: Partial<ColorScheme>
  }
  /** Chart preferences */
  chart: {
    /** Default timeframe */
    defaultTimeframe: Timeframe
    /** Chart spacing configuration */
    spacing: ChartSpacingConfig
    /** Enabled indicators */
    indicators: string[]
    /** Chart height */
    height: number
  }
  /** Trading preferences */
  trading: {
    /** Favorite symbols */
    favorites: string[]
    /** Default market */
    defaultMarket: MarketType
    /** Signal notifications enabled */
    signalNotifications: boolean
  }
  /** Performance settings */
  performance: {
    /** Performance monitoring enabled */
    monitoringEnabled: boolean
    /** Update interval */
    updateInterval: number
    /** Alert thresholds */
    alertThresholds: Partial<PerformanceMetrics>
  }
  /** Export settings */
  export: {
    /** Default format */
    defaultFormat: ExportFormat
    /** Default filename pattern */
    filenamePattern: string
  }
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Use local storage hook return type
 */
export interface UseLocalStorageReturn<T> {
  /** Stored value */
  value: T
  /** Set value function */
  setValue: (value: T | ((prev: T) => T)) => void
  /** Remove value function */
  removeValue: () => void
}

/**
 * Use async hook return type
 */
export interface UseAsyncReturn<T> {
  /** Async data */
  data: T | null
  /** Loading state */
  loading: boolean
  /** Error state */
  error: Error | null
  /** Execute function */
  execute: (...args: any[]) => Promise<void>
  /** Reset function */
  reset: () => void
}

// ============================================================================
// UI Types (exported through main index.ts)
// ============================================================================

// Note: All types are now exported through the main types/index.ts file
// to avoid conflicts and maintain a single source of truth