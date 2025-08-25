// ChartControls.tsx - Professional trading chart controls with Overlays, Indicators, and Signals
import React, { useState, useRef, useEffect } from 'react'
import { 
  TrendingUp, 
  Activity, 
  Target,
  ChevronDown,
  X,
  Check,
  BarChart3,
  Zap,
  AlertTriangle,
  Settings,
  PlayCircle,
  Brain
} from 'lucide-react'

interface ChartControlsProps {
  selectedOverlays: string[]
  selectedIndicators: string[]
  selectedSignals: string[]
  scalePriceOnly: boolean
  onOverlaysChange: (overlays: string[]) => void
  onIndicatorsChange: (indicators: string[]) => void
  onSignalsChange: (signals: string[]) => void
  onScalePriceOnlyChange: (enabled: boolean) => void
  onStrategyBuilderOpen?: () => void
  onBacktestOpen?: () => void
  onPortfolioOpen?: () => void
}

interface DropdownItem {
  id: string
  name: string
  description: string
  color: string
  category?: string
}

const OVERLAYS: DropdownItem[] = [
  // Moving Averages
  { id: 'sma_20', name: 'SMA 20', description: 'Simple Moving Average (20 periods)', color: '#ff9800', category: 'Moving Averages' },
  { id: 'sma_50', name: 'SMA 50', description: 'Simple Moving Average (50 periods)', color: '#9c27b0', category: 'Moving Averages' },
  { id: 'sma_200', name: 'SMA 200', description: 'Simple Moving Average (200 periods)', color: '#795548', category: 'Moving Averages' },
  { id: 'ema_20', name: 'EMA 20', description: 'Exponential Moving Average (20 periods)', color: '#4caf50', category: 'Moving Averages' },
  { id: 'ema_50', name: 'EMA 50', description: 'Exponential Moving Average (50 periods)', color: '#2196f3', category: 'Moving Averages' },
  { id: 'ema_200', name: 'EMA 200', description: 'Exponential Moving Average (200 periods)', color: '#3f51b5', category: 'Moving Averages' },
  { id: 'wma_20', name: 'WMA 20', description: 'Weighted Moving Average (20 periods)', color: '#00bcd4', category: 'Moving Averages' },
  { id: 'hull_20', name: 'Hull MA 20', description: 'Hull Moving Average (20 periods)', color: '#8bc34a', category: 'Moving Averages' },
  
  // Volatility Indicators
  { id: 'bb_bands', name: 'Bollinger Bands', description: 'Volatility bands (20, 2)', color: '#e91e63', category: 'Volatility' },
  { id: 'atr_bands', name: 'ATR Bands', description: 'Average True Range volatility bands', color: '#ff5722', category: 'Volatility' },
  { id: 'keltner', name: 'Keltner Channel', description: 'Keltner Channel (20, 2)', color: '#673ab7', category: 'Volatility' },
  { id: 'donchian', name: 'Donchian Channel', description: 'Donchian Channel (20 periods)', color: '#ff5722', category: 'Volatility' },
  { id: 'env_bands', name: 'Envelope Bands', description: 'Percentage envelope bands', color: '#607d8b', category: 'Volatility' },
  
  // Volume & Price
  { id: 'vwap', name: 'VWAP', description: 'Volume Weighted Average Price', color: '#795548', category: 'Volume' },
  { id: 'mvwap', name: 'MVWAP', description: 'Moving VWAP (20 periods)', color: '#5d4037', category: 'Volume' },
  { id: 'twap', name: 'TWAP', description: 'Time Weighted Average Price', color: '#424242', category: 'Volume' },
  { id: 'pnf', name: 'Point & Figure', description: 'Point and Figure overlay', color: '#37474f', category: 'Price Action' },
  
  // Support & Resistance
  { id: 'pivot', name: 'Pivot Points', description: 'Support and resistance levels', color: '#607d8b', category: 'S&R' },
  { id: 'camarilla', name: 'Camarilla Pivots', description: 'Camarilla pivot points', color: '#455a64', category: 'S&R' },
  { id: 'woodie', name: 'Woodie Pivots', description: 'Woodie pivot points', color: '#546e7a', category: 'S&R' },
  { id: 'fibonacci', name: 'Fibonacci Retracement', description: 'Fibonacci retracement levels', color: '#ffc107', category: 'S&R' },
  { id: 'fib_ext', name: 'Fibonacci Extension', description: 'Fibonacci extension levels', color: '#ff8f00', category: 'S&R' },
  
  // Trend Analysis
  { id: 'trend_line', name: 'Trend Lines', description: 'Automatic trend line detection', color: '#00e676', category: 'Trend' },
  { id: 'channel', name: 'Price Channel', description: 'Price channel overlay', color: '#1de9b6', category: 'Trend' },
  { id: 'regression', name: 'Linear Regression', description: 'Linear regression trend line', color: '#00bcd4', category: 'Trend' },
  { id: 'poly_regression', name: 'Polynomial Regression', description: 'Polynomial regression curve', color: '#0097a7', category: 'Trend' },
  
  // Specialized
  { id: 'heikin_ashi', name: 'Heikin-Ashi', description: 'Heikin-Ashi candlestick style', color: '#00bcd4', category: 'Candlestick' },
  { id: 'renko', name: 'Renko Boxes', description: 'Renko box overlay', color: '#009688', category: 'Candlestick' },
  { id: 'kagi', name: 'Kagi Chart', description: 'Kagi chart overlay', color: '#4db6ac', category: 'Candlestick' },
  { id: 'three_line_break', name: 'Three Line Break', description: 'Three Line Break chart', color: '#26a69a', category: 'Candlestick' },
  
  // Advanced Overlays
  { id: 'ichimoku', name: 'Ichimoku Cloud', description: 'Ichimoku Kinko Hyo system', color: '#ff7043', category: 'Advanced' },
  { id: 'parabolic_sar', name: 'Parabolic SAR', description: 'Stop and Reverse indicator', color: '#ff5722', category: 'Advanced' },
  { id: 'zigzag', name: 'ZigZag', description: 'ZigZag pattern overlay', color: '#e91e63', category: 'Advanced' },
  { id: 'gann_fan', name: 'Gann Fan', description: 'Gann angle fan lines', color: '#9c27b0', category: 'Advanced' },
  { id: 'elliott_wave', name: 'Elliott Wave', description: 'Elliott Wave pattern recognition', color: '#673ab7', category: 'Advanced' }
]

const INDICATORS: DropdownItem[] = [
  // Momentum Oscillators
  { id: 'rsi', name: 'RSI (14)', description: 'Relative Strength Index', color: '#f44336', category: 'Momentum' },
  { id: 'stoch', name: 'Stochastic', description: 'Stochastic Oscillator (%K, %D)', color: '#00bcd4', category: 'Momentum' },
  { id: 'stoch_rsi', name: 'Stoch RSI', description: 'Stochastic RSI', color: '#ff5722', category: 'Momentum' },
  { id: 'williams', name: 'Williams %R', description: 'Williams Percent Range', color: '#ffeb3b', category: 'Momentum' },
  { id: 'roc', name: 'ROC', description: 'Rate of Change', color: '#9c27b0', category: 'Momentum' },
  { id: 'momentum', name: 'Momentum', description: 'Price momentum oscillator', color: '#e91e63', category: 'Momentum' },
  { id: 'trix', name: 'TRIX', description: '1-day Rate-Of-Change (ROC) of a Triple Exponentially Smoothed Moving Average', color: '#673ab7', category: 'Momentum' },
  { id: 'ultimate', name: 'Ultimate Oscillator', description: 'Ultimate Oscillator', color: '#3f51b5', category: 'Momentum' },
  
  // Trend Following
  { id: 'macd', name: 'MACD', description: 'Moving Average Convergence Divergence', color: '#3f51b5', category: 'Trend' },
  { id: 'adx', name: 'ADX', description: 'Average Directional Index', color: '#ff5722', category: 'Trend' },
  { id: 'aroon', name: 'Aroon', description: 'Aroon Up/Down indicator', color: '#4caf50', category: 'Trend' },
  { id: 'dmi', name: 'DMI', description: 'Directional Movement Index', color: '#2196f3', category: 'Trend' },
  { id: 'ppo', name: 'PPO', description: 'Percentage Price Oscillator', color: '#00bcd4', category: 'Trend' },
  { id: 'vortex', name: 'Vortex Indicator', description: 'Vortex Indicator (VI)', color: '#795548', category: 'Trend' },
  
  // Volume Indicators  
  { id: 'obv', name: 'OBV', description: 'On-Balance Volume', color: '#607d8b', category: 'Volume' },
  { id: 'ad_line', name: 'A/D Line', description: 'Accumulation/Distribution Line', color: '#546e7a', category: 'Volume' },
  { id: 'cmf', name: 'CMF', description: 'Chaikin Money Flow', color: '#455a64', category: 'Volume' },
  { id: 'mfi', name: 'MFI', description: 'Money Flow Index', color: '#37474f', category: 'Volume' },
  { id: 'vwmacd', name: 'VW MACD', description: 'Volume Weighted MACD', color: '#263238', category: 'Volume' },
  { id: 'pvi', name: 'PVI', description: 'Positive Volume Index', color: '#1b5e20', category: 'Volume' },
  { id: 'nvi', name: 'NVI', description: 'Negative Volume Index', color: '#0d47a1', category: 'Volume' },
  
  // Market Strength
  { id: 'cci', name: 'CCI', description: 'Commodity Channel Index', color: '#8bc34a', category: 'Market Strength' },
  { id: 'dpo', name: 'DPO', description: 'Detrended Price Oscillator', color: '#689f38', category: 'Market Strength' },
  { id: 'kst', name: 'KST', description: 'Know Sure Thing', color: '#558b2f', category: 'Market Strength' },
  { id: 'mass_index', name: 'Mass Index', description: 'Mass Index', color: '#33691e', category: 'Market Strength' },
  { id: 'qstick', name: 'Qstick', description: 'Qstick Indicator', color: '#827717', category: 'Market Strength' },
  
  // Volatility
  { id: 'atr', name: 'ATR', description: 'Average True Range', color: '#ff6f00', category: 'Volatility' },
  { id: 'bb_width', name: 'BB Width', description: 'Bollinger Band Width', color: '#e65100', category: 'Volatility' },
  { id: 'bb_percent', name: '%B', description: 'Bollinger Band %B', color: '#bf360c', category: 'Volatility' },
  { id: 'chop', name: 'Choppiness', description: 'Choppiness Index', color: '#3e2723', category: 'Volatility' },
  { id: 'vhf', name: 'VHF', description: 'Vertical Horizontal Filter', color: '#4e342e', category: 'Volatility' },
  
  // Statistical
  { id: 'z_score', name: 'Z-Score', description: 'Z-Score (Price vs SMA)', color: '#1a237e', category: 'Statistical' },
  { id: 'skewness', name: 'Skewness', description: 'Price Distribution Skewness', color: '#283593', category: 'Statistical' },
  { id: 'kurtosis', name: 'Kurtosis', description: 'Price Distribution Kurtosis', color: '#303f9f', category: 'Statistical' },
  { id: 'variance', name: 'Variance', description: 'Price Variance', color: '#3949ab', category: 'Statistical' },
  
  // Custom & Advanced
  { id: 'supertrend', name: 'SuperTrend', description: 'SuperTrend Indicator', color: '#e91e63', category: 'Advanced' },
  { id: 'squeeze', name: 'Squeeze', description: 'TTM Squeeze Indicator', color: '#ad1457', category: 'Advanced' },
  { id: 'fisher', name: 'Fisher Transform', description: 'Fisher Transform', color: '#880e4f', category: 'Advanced' },
  { id: 'ehlers_filter', name: 'Ehlers Filter', description: 'Ehlers Super Smoother Filter', color: '#4a148c', category: 'Advanced' },
  { id: 'wave_trend', name: 'Wave Trend', description: 'Wave Trend Oscillator', color: '#6a1b9a', category: 'Advanced' },
  
  // Volume Analysis (from VolumeIndicators)
  { id: 'vpt', name: 'Volume Price Trend', description: 'Volume Price Trend indicator', color: '#795548', category: 'Volume' },
  { id: 'klinger', name: 'Klinger Oscillator', description: 'Klinger Volume Oscillator', color: '#5d4037', category: 'Volume' },
  { id: 'force_index', name: 'Force Index', description: 'Force Index with volume', color: '#4e342e', category: 'Volume' },
  { id: 'ease_movement', name: 'Ease of Movement', description: 'Ease of Movement indicator', color: '#3e2723', category: 'Volume' },
  
  // Volatility Analysis (from VolatilityIndicators)
  { id: 'volatility_index', name: 'Volatility Index', description: 'Market volatility measurement', color: '#b71c1c', category: 'Volatility' },
  { id: 'chaikin_volatility', name: 'Chaikin Volatility', description: 'Chaikin Volatility indicator', color: '#c62828', category: 'Volatility' },
  { id: 'mass_index_vol', name: 'Mass Index', description: 'Mass Index volatility indicator', color: '#d32f2f', category: 'Volatility' },
  
  // On-Chain Metrics (for crypto)
  { id: 'nvt_ratio', name: 'NVT Ratio', description: 'Network Value to Transactions ratio', color: '#1a237e', category: 'On-Chain' },
  { id: 'mvrv_ratio', name: 'MVRV Ratio', description: 'Market Value to Realized Value ratio', color: '#283593', category: 'On-Chain' },
  { id: 'sopr', name: 'SOPR', description: 'Spent Output Profit Ratio', color: '#303f9f', category: 'On-Chain' }
]

const SIGNALS: DropdownItem[] = [
  // Trend Signals
  { id: 'ema_cross', name: 'EMA×SMA Cross', description: 'EMA and SMA crossover signals', color: '#4caf50', category: 'Trend' },
  { id: 'ma_golden_cross', name: 'Golden/Death Cross', description: '50/200 SMA crossover signals', color: '#ffc107', category: 'Trend' },
  { id: 'trend_change', name: 'Trend Change', description: 'Trend reversal alerts', color: '#ff9800', category: 'Trend' },
  { id: 'adx_strength', name: 'ADX Strength', description: 'Strong trend emergence (ADX > 25)', color: '#ff5722', category: 'Trend' },
  { id: 'parabolic_flip', name: 'Parabolic SAR Flip', description: 'Parabolic SAR trend reversal', color: '#e91e63', category: 'Trend' },
  
  // Momentum Signals
  { id: 'macd_cross', name: 'MACD Cross', description: 'MACD line and signal line crossovers', color: '#2196f3', category: 'Momentum' },
  { id: 'rsi_levels', name: 'RSI 30/70', description: 'RSI overbought/oversold levels', color: '#ff5722', category: 'Momentum' },
  { id: 'stoch_cross', name: 'Stochastic Cross', description: 'Stochastic %K/%D crossovers', color: '#00bcd4', category: 'Momentum' },
  { id: 'williams_levels', name: 'Williams %R Levels', description: 'Williams %R extreme levels', color: '#ffeb3b', category: 'Momentum' },
  { id: 'momentum_divergence', name: 'Momentum Divergence', description: 'Price-momentum divergences', color: '#9c27b0', category: 'Momentum' },
  
  // Support/Resistance
  { id: 'breakout', name: 'Breakout Signals', description: 'Support/resistance breakouts', color: '#2196f3', category: 'S&R' },
  { id: 'pivot_bounce', name: 'Pivot Bounce', description: 'Price bouncing off pivot levels', color: '#607d8b', category: 'S&R' },
  { id: 'fib_retracement', name: 'Fib Retracement', description: 'Fibonacci retracement level touches', color: '#ffc107', category: 'S&R' },
  { id: 'channel_break', name: 'Channel Break', description: 'Price channel breakouts', color: '#1de9b6', category: 'S&R' },
  
  // Volatility Signals
  { id: 'bb_touch', name: 'BB Touch', description: 'Price touching Bollinger Bands', color: '#9c27b0', category: 'Volatility' },
  { id: 'bb_squeeze', name: 'BB Squeeze', description: 'Bollinger Band squeeze alerts', color: '#673ab7', category: 'Volatility' },
  { id: 'atr_expansion', name: 'ATR Expansion', description: 'Volatility expansion signals', color: '#ff5722', category: 'Volatility' },
  { id: 'keltner_break', name: 'Keltner Break', description: 'Keltner Channel breakouts', color: '#673ab7', category: 'Volatility' },
  
  // Volume Signals
  { id: 'volume_spike', name: 'Volume Spikes', description: 'Unusual volume activity', color: '#9c27b0', category: 'Volume' },
  { id: 'volume_confirmation', name: 'Volume Confirmation', description: 'Price moves confirmed by volume', color: '#607d8b', category: 'Volume' },
  { id: 'obv_divergence', name: 'OBV Divergence', description: 'On-Balance Volume divergence', color: '#546e7a', category: 'Volume' },
  { id: 'accumulation', name: 'Accumulation/Distribution', description: 'A/D line trend changes', color: '#455a64', category: 'Volume' },
  
  // Pattern Recognition (from our new pattern libraries)
  { id: 'candlestick_patterns', name: 'Candlestick Patterns', description: 'Doji, Hammer, Engulfing patterns', color: '#795548', category: 'Patterns' },
  { id: 'chart_patterns', name: 'Chart Patterns', description: 'Head & Shoulders, Triangles, Flags', color: '#5d4037', category: 'Patterns' },
  { id: 'doji_patterns', name: 'Doji Patterns', description: 'All types of Doji candlestick patterns', color: '#6d4c41', category: 'Patterns' },
  { id: 'engulfing_patterns', name: 'Engulfing Patterns', description: 'Bullish and Bearish Engulfing patterns', color: '#5d4037', category: 'Patterns' },
  { id: 'triangle_patterns', name: 'Triangle Patterns', description: 'Ascending, Descending, Symmetrical triangles', color: '#4e342e', category: 'Patterns' },
  { id: 'flag_pennant', name: 'Flags & Pennants', description: 'Flag and Pennant continuation patterns', color: '#3e2723', category: 'Patterns' },
  { id: 'elliott_wave_signals', name: 'Elliott Wave', description: 'Elliott Wave completion signals', color: '#673ab7', category: 'Patterns' },
  { id: 'harmonic_patterns', name: 'Harmonic Patterns', description: 'Gartley, Butterfly, Bat patterns', color: '#4e342e', category: 'Patterns' },
  
  // Advanced Signals
  { id: 'buy_sell', name: 'Buy/Sell Arrows', description: 'Automated buy and sell signals', color: '#4caf50', category: 'Advanced' },
  { id: 'divergence', name: 'Divergence', description: 'Price-indicator divergences', color: '#f44336', category: 'Advanced' },
  { id: 'ichimoku_signals', name: 'Ichimoku Signals', description: 'Ichimoku cloud signals', color: '#ff7043', category: 'Advanced' },
  { id: 'multi_timeframe', name: 'Multi-Timeframe', description: 'Signals from multiple timeframes', color: '#00bcd4', category: 'Advanced' },
  { id: 'ai_predictions', name: 'AI Predictions', description: 'Machine learning price predictions', color: '#e91e63', category: 'Advanced' },
  
  // Strategy Engine Signals
  { id: 'strategy_signals', name: 'Strategy Signals', description: 'Signals from custom trading strategies', color: '#1976d2', category: 'Strategy Engine' },
  { id: 'golden_cross_signal', name: 'Golden Cross Signal', description: 'Golden Cross strategy signals', color: '#ffc107', category: 'Strategy Engine' },
  { id: 'rsi_reversal_signal', name: 'RSI Reversal Signal', description: 'RSI mean reversion signals', color: '#f44336', category: 'Strategy Engine' },
  { id: 'bollinger_breakout_signal', name: 'Bollinger Breakout', description: 'Bollinger Band breakout signals', color: '#9c27b0', category: 'Strategy Engine' },
  { id: 'multi_indicator_signal', name: 'Multi-Indicator Signal', description: 'Combined indicator signals', color: '#2196f3', category: 'Strategy Engine' }
]

export default function ChartControls({
  selectedOverlays,
  selectedIndicators, 
  selectedSignals,
  scalePriceOnly,
  onOverlaysChange,
  onIndicatorsChange,
  onSignalsChange,
  onScalePriceOnlyChange,
  onStrategyBuilderOpen,
  onBacktestOpen,
  onPortfolioOpen
}: ChartControlsProps) {
  const [activeDropdown, setActiveDropdown] = useState<'overlays' | 'indicators' | 'signals' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleItemToggle = (category: 'overlays' | 'indicators' | 'signals', itemId: string) => {
    switch (category) {
      case 'overlays':
        const newOverlays = selectedOverlays.includes(itemId)
          ? selectedOverlays.filter(id => id !== itemId)
          : [...selectedOverlays, itemId]
        onOverlaysChange(newOverlays)
        break
      case 'indicators':
        const newIndicators = selectedIndicators.includes(itemId)
          ? selectedIndicators.filter(id => id !== itemId)
          : [...selectedIndicators, itemId]
        onIndicatorsChange(newIndicators)
        break
      case 'signals':
        const newSignals = selectedSignals.includes(itemId)
          ? selectedSignals.filter(id => id !== itemId)
          : [...selectedSignals, itemId]
        onSignalsChange(newSignals)
        break
    }
  }

  const getButtonCount = (category: 'overlays' | 'indicators' | 'signals') => {
    switch (category) {
      case 'overlays': return selectedOverlays.length
      case 'indicators': return selectedIndicators.length
      case 'signals': return selectedSignals.length
      default: return 0
    }
  }

  const renderDropdown = (
    category: 'overlays' | 'indicators' | 'signals',
    items: DropdownItem[],
    selectedItems: string[]
  ) => {
    // Group items by category
    const groupedItems = items.reduce((groups, item) => {
      const cat = item.category || 'Other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
      return groups
    }, {} as Record<string, DropdownItem[]>)

    return (
      <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-gray-600 flex items-center justify-between bg-gray-700">
          <h3 className="font-semibold text-white capitalize">{category}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300">{selectedItems.length} selected</span>
            <button
              onClick={() => setActiveDropdown(null)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content with categories */}
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
            <div key={categoryName}>
              {/* Category header */}
              <div className="px-3 py-2 bg-gray-750 border-b border-gray-600">
                <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  {categoryName}
                </h4>
              </div>
              
              {/* Category items */}
              {categoryItems.map((item) => {
                const isSelected = selectedItems.includes(item.id)
                const itemClass = `p-3 border-b border-gray-700 cursor-pointer transition-colors hover:bg-gray-700 ${
                  isSelected ? 'bg-gray-700' : ''
                }`
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemToggle(category, item.id)}
                    className={itemClass}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white text-sm">{item.name}</div>
                          <div className="text-xs text-gray-400 truncate">{item.description}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer with clear all and quick select */}
        <div className="p-3 border-t border-gray-600 bg-gray-700">
          <div className="flex items-center justify-between">
            {selectedItems.length > 0 ? (
              <button
                onClick={() => {
                  switch (category) {
                    case 'overlays': onOverlaysChange([]); break
                    case 'indicators': onIndicatorsChange([]); break
                    case 'signals': onSignalsChange([]); break
                  }
                }}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Clear All ({selectedItems.length})
              </button>
            ) : (
              <div></div>
            )}
            
            <button
              onClick={() => {
                // Quick select popular items
                const popularItems = items.slice(0, 5).map(item => item.id)
                switch (category) {
                  case 'overlays': onOverlaysChange(popularItems); break
                  case 'indicators': onIndicatorsChange(popularItems); break
                  case 'signals': onSignalsChange(popularItems); break
                }
              }}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Popular Set
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Dynamic class building functions
  const getOverlayButtonClass = () => {
    if (activeDropdown === 'overlays') return 'bg-blue-600 text-white'
    if (selectedOverlays.length > 0) return 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
    return 'bg-gray-700 text-gray-300 hover:bg-gray-600'
  }

  const getIndicatorButtonClass = () => {
    if (activeDropdown === 'indicators') return 'bg-purple-600 text-white'
    if (selectedIndicators.length > 0) return 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
    return 'bg-gray-700 text-gray-300 hover:bg-gray-600'
  }

  const getSignalButtonClass = () => {
    if (activeDropdown === 'signals') return 'bg-green-600 text-white'
    if (selectedSignals.length > 0) return 'bg-green-600/20 text-green-300 border border-green-500/30'
    return 'bg-gray-700 text-gray-300 hover:bg-gray-600'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Control buttons row */}
      <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
        {/* Chart scaling toggle */}
        <div className="flex items-center gap-2 mr-4 pr-4 border-r border-gray-600">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={scalePriceOnly}
              onChange={(e) => onScalePriceOnlyChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300">Scale price only</span>
          </label>
        </div>

        {/* Overlays button */}
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'overlays' ? null : 'overlays')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${getOverlayButtonClass()}`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Overlays</span>
          {selectedOverlays.length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
              {selectedOverlays.length}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${
            activeDropdown === 'overlays' ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Indicators button */}
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'indicators' ? null : 'indicators')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${getIndicatorButtonClass()}`}
        >
          <Activity className="w-4 h-4" />
          <span>Indicators</span>
          {selectedIndicators.length > 0 && (
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
              {selectedIndicators.length}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${
            activeDropdown === 'indicators' ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Signals button */}
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'signals' ? null : 'signals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${getSignalButtonClass()}`}
        >
          <Target className="w-4 h-4" />
          <span>Signals</span>
          {selectedSignals.length > 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
              {selectedSignals.length}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${
            activeDropdown === 'signals' ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Strategy Engine Controls */}
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-600">
          {/* Strategy Builder button */}
          {onStrategyBuilderOpen && (
            <button
              onClick={onStrategyBuilderOpen}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              title="Open Strategy Builder"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Strategy</span>
            </button>
          )}

          {/* Backtest button */}
          {onBacktestOpen && (
            <button
              onClick={onBacktestOpen}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
              title="Run Backtest"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Backtest</span>
            </button>
          )}

          {/* Portfolio button */}
          {onPortfolioOpen && (
            <button
              onClick={onPortfolioOpen}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              title="Portfolio Manager"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown windows */}
      {activeDropdown === 'overlays' && renderDropdown('overlays', OVERLAYS, selectedOverlays)}
      {activeDropdown === 'indicators' && renderDropdown('indicators', INDICATORS, selectedIndicators)}
      {activeDropdown === 'signals' && renderDropdown('signals', SIGNALS, selectedSignals)}

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  )
}