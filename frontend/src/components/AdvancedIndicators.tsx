import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap, Target, AlertTriangle } from 'lucide-react';

interface SummaryData {
  last_price: number;
  price_change_pct: number;
  data_points: number;
  total_indicators: number;
}

interface IndicatorData {
  [key: string]: number[] | null | SummaryData;
}

interface AdvancedIndicatorsProps {
  indicators: IndicatorData;
  symbol: string;
}

const AdvancedIndicators: React.FC<AdvancedIndicatorsProps> = ({ indicators, symbol }) => {
  const [activeTab, setActiveTab] = useState<'momentum' | 'trend' | 'volatility' | 'volume' | 'custom'>('momentum');

  // Get latest value from indicator array
  const getLatestValue = (indicator: number[] | null | undefined): number | null => {
    if (!indicator || !Array.isArray(indicator) || indicator.length === 0) return null;
    const latest = indicator[indicator.length - 1];
    return latest !== null && latest !== undefined ? latest : null;
  };

  // Format value for display
  const formatValue = (value: number | null, precision: number = 2): string => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(precision);
  };

  // Get signal color based on value and thresholds
  const getSignalColor = (value: number | null, type: 'rsi' | 'momentum' | 'trend' | 'volume'): string => {
    if (value === null) return 'text-gray-400';
    
    switch (type) {
      case 'rsi':
        if (value > 70) return 'text-red-500'; // Overbought
        if (value < 30) return 'text-green-500'; // Oversold
        return 'text-gray-600';
      case 'momentum':
        return value > 0 ? 'text-green-500' : 'text-red-500';
      case 'trend':
        return value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-600';
      case 'volume':
        return value > 0 ? 'text-blue-500' : 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get trend icon
  const getTrendIcon = (value: number | null, size: string = 'w-4 h-4') => {
    if (value === null) return <Activity className={`${size} text-gray-400`} />;
    if (value > 0) return <TrendingUp className={`${size} text-green-500`} />;
    if (value < 0) return <TrendingDown className={`${size} text-red-500`} />;
    return <Activity className={`${size} text-gray-400`} />;
  };

  const momentumIndicators = [
    { key: 'rsi', name: 'RSI (14)', description: 'Relative Strength Index' },
    { key: 'stoch_k', name: 'Stochastic %K', description: 'Stochastic Oscillator' },
    { key: 'stoch_d', name: 'Stochastic %D', description: 'Stochastic Signal' },
    { key: 'williams_r', name: 'Williams %R', description: 'Williams Percent Range' },
    { key: 'roc', name: 'ROC (12)', description: 'Rate of Change' },
    { key: 'stoch_rsi', name: 'Stochastic RSI', description: 'Stochastic RSI Oscillator' },
    { key: 'mfi', name: 'MFI (14)', description: 'Money Flow Index' },
  ];

  const trendIndicators = [
    { key: 'adx', name: 'ADX (14)', description: 'Average Directional Index' },
    { key: 'adx_pos', name: '+DI', description: 'Positive Directional Indicator' },
    { key: 'adx_neg', name: '-DI', description: 'Negative Directional Indicator' },
    { key: 'psar', name: 'Parabolic SAR', description: 'Stop and Reverse' },
    { key: 'ichimoku_conversion', name: 'Tenkan-sen', description: 'Ichimoku Conversion Line' },
    { key: 'ichimoku_base', name: 'Kijun-sen', description: 'Ichimoku Base Line' },
    { key: 'ema_8', name: 'EMA (8)', description: 'Exponential Moving Average' },
    { key: 'ema_21', name: 'EMA (21)', description: 'Exponential Moving Average' },
    { key: 'ema_50', name: 'EMA (50)', description: 'Exponential Moving Average' },
    { key: 'ema_200', name: 'EMA (200)', description: 'Exponential Moving Average' },
  ];

  const volatilityIndicators = [
    { key: 'atr', name: 'ATR (14)', description: 'Average True Range' },
    { key: 'bb_width', name: 'BB Width', description: 'Bollinger Band Width' },
    { key: 'bb_percent', name: 'BB %B', description: 'Bollinger Band Percent' },
    { key: 'keltner_high', name: 'Keltner Upper', description: 'Keltner Channel Upper' },
    { key: 'keltner_low', name: 'Keltner Lower', description: 'Keltner Channel Lower' },
    { key: 'donchian_high', name: 'Donchian Upper', description: 'Donchian Channel Upper' },
    { key: 'donchian_low', name: 'Donchian Lower', description: 'Donchian Channel Lower' },
    { key: 'hist_vol', name: 'Historical Vol', description: 'Historical Volatility' },
  ];

  const volumeIndicators = [
    { key: 'obv', name: 'OBV', description: 'On Balance Volume' },
    { key: 'vwap', name: 'VWAP', description: 'Volume Weighted Average Price' },
    { key: 'cmf', name: 'CMF (20)', description: 'Chaikin Money Flow' },
    { key: 'vol_roc', name: 'Volume ROC', description: 'Volume Rate of Change' },
    { key: 'pv_trend', name: 'PV Trend', description: 'Price Volume Trend' },
  ];

  const customIndicators = [
    { key: 'supertrend', name: 'SuperTrend', description: 'SuperTrend Indicator' },
    { key: 'supertrend_signal', name: 'SuperTrend Signal', description: 'Trend Direction' },
    { key: 'squeeze', name: 'Squeeze', description: 'Bollinger-Keltner Squeeze' },
    { key: 'fib_23.6', name: 'Fib 23.6%', description: 'Fibonacci Retracement' },
    { key: 'fib_38.2', name: 'Fib 38.2%', description: 'Fibonacci Retracement' },
    { key: 'fib_50.0', name: 'Fib 50.0%', description: 'Fibonacci Retracement' },
    { key: 'fib_61.8', name: 'Fib 61.8%', description: 'Fibonacci Retracement' },
  ];

  const renderIndicatorGrid = (indicatorList: any[], type: 'rsi' | 'momentum' | 'trend' | 'volume') => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {indicatorList.map((indicator) => {
        const indicatorValue = indicators[indicator.key];
        const value = Array.isArray(indicatorValue) ? getLatestValue(indicatorValue) : null;
        const colorClass = getSignalColor(value, type);
        
        return (
          <div key={indicator.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getTrendIcon(value)}
                <span className="font-medium text-gray-900">{indicator.name}</span>
              </div>
              <span className={`text-lg font-bold ${colorClass}`}>
                {formatValue(value, indicator.key.includes('vol') ? 0 : 2)}
              </span>
            </div>
            <p className="text-xs text-gray-500">{indicator.description}</p>
            
            {/* Special indicators with additional info */}
            {indicator.key === 'rsi' && value !== null && (
              <div className="mt-2">
                {value > 70 && <span className="text-xs text-red-600 font-medium">Overbought</span>}
                {value < 30 && <span className="text-xs text-green-600 font-medium">Oversold</span>}
                {value >= 30 && value <= 70 && <span className="text-xs text-gray-600">Neutral</span>}
              </div>
            )}
            
            {indicator.key === 'adx' && value !== null && (
              <div className="mt-2">
                {value > 25 && <span className="text-xs text-blue-600 font-medium">Strong Trend</span>}
                {value <= 25 && <span className="text-xs text-gray-600">Weak Trend</span>}
              </div>
            )}
            
            {indicator.key === 'squeeze' && value !== null && (
              <div className="mt-2">
                {value === 1 && <span className="text-xs text-orange-600 font-medium">Squeeze Active</span>}
                {value === 0 && <span className="text-xs text-green-600 font-medium">No Squeeze</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Get market regime
  const marketRegime = indicators.market_regime && Array.isArray(indicators.market_regime) 
    ? String(indicators.market_regime[indicators.market_regime.length - 1]) 
    : null;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Advanced Technical Indicators</h2>
            <p className="text-sm text-gray-500">
              {symbol} • {(indicators.summary as SummaryData)?.total_indicators || 0} indicators
            </p>
          </div>
          
          {/* Market Regime Indicator */}
          {marketRegime && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${
              marketRegime === 'trending' 
                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
            }`}>
              {marketRegime === 'trending' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              <span className="font-medium">{marketRegime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'momentum', label: 'Momentum', icon: Zap },
          { key: 'trend', label: 'Trend', icon: TrendingUp },
          { key: 'volatility', label: 'Volatility', icon: BarChart3 },
          { key: 'volume', label: 'Volume', icon: Activity },
          { key: 'custom', label: 'Custom', icon: Target },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Indicator Content */}
      <div className="p-4">
        {activeTab === 'momentum' && renderIndicatorGrid(momentumIndicators, 'rsi')}
        {activeTab === 'trend' && renderIndicatorGrid(trendIndicators, 'trend')}
        {activeTab === 'volatility' && renderIndicatorGrid(volatilityIndicators, 'momentum')}
        {activeTab === 'volume' && renderIndicatorGrid(volumeIndicators, 'volume')}
        {activeTab === 'custom' && renderIndicatorGrid(customIndicators, 'trend')}
      </div>

      {/* Summary Stats */}
      {indicators.summary && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Last Price:</span>
              <span className="ml-2 font-medium">
                ${formatValue((indicators.summary as SummaryData)?.last_price || 0, 2)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Change:</span>
              <span                 className={`ml-2 font-medium ${
                  (indicators.summary as SummaryData)?.price_change_pct > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                                  {formatValue((indicators.summary as SummaryData)?.price_change_pct || 0, 2)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">Data Points:</span>
                              <span className="ml-2 font-medium">{(indicators.summary as SummaryData)?.data_points || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Total Indicators:</span>
                              <span className="ml-2 font-medium">{(indicators.summary as SummaryData)?.total_indicators || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedIndicators;