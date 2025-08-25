import React, { useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Activity, Eye, EyeOff } from 'lucide-react'

interface SummaryData {
  last_price: number;
  price_change_pct: number;
  data_points: number;
  total_indicators: number;
}

interface IndicatorData {
  [key: string]: number[] | null | SummaryData;
}

interface KeyIndicatorsProps {
  indicators: IndicatorData;
  symbol: string;
  onToggleOverlay?: (indicator: string, enabled: boolean) => void;
}

const KeyIndicators: React.FC<KeyIndicatorsProps> = ({ 
  indicators, 
  symbol, 
  onToggleOverlay 
}) => {
  const [overlayStates, setOverlayStates] = useState({
    stochastic: false,
    williamsR: false,
    fibonacci: false
  })

  // Get latest values from indicator arrays
  const getLatestValue = (indicator: number[] | null | undefined): number | null => {
    if (!indicator || !Array.isArray(indicator) || indicator.length === 0) return null;
    const latest = indicator[indicator.length - 1];
    return latest !== null && latest !== undefined ? latest : null;
  };

  // Get previous value for trend calculation
  const getPreviousValue = (indicator: number[] | null | undefined): number | null => {
    if (!indicator || !Array.isArray(indicator) || indicator.length < 2) return null;
    const previous = indicator[indicator.length - 2];
    return previous !== null && previous !== undefined ? previous : null;
  };

  // Calculate trend direction
  const getTrend = (current: number | null, previous: number | null): 'up' | 'down' | 'neutral' => {
    if (current === null || previous === null) return 'neutral';
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  // Format value for display
  const formatValue = (value: number | null, precision: number = 2): string => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(precision);
  };

  // Stochastic analysis
  const stochastic = useMemo(() => {
    const stochK = indicators.stoch_k;
    const stochD = indicators.stoch_d;
    const k = Array.isArray(stochK) ? getLatestValue(stochK) : null;
    const d = Array.isArray(stochD) ? getLatestValue(stochD) : null;
    const kPrev = Array.isArray(stochK) ? getPreviousValue(stochK) : null;
    const dPrev = Array.isArray(stochD) ? getPreviousValue(stochD) : null;
    
    let signal = 'neutral';
    let strength = 'weak';
    let zone = 'neutral';
    
    if (k !== null && d !== null) {
      // Determine zones
      if (k > 80 && d > 80) zone = 'overbought';
      else if (k < 20 && d < 20) zone = 'oversold';
      
      // Signal analysis
      if (kPrev !== null && dPrev !== null) {
        // Bullish crossover
        if (k > d && kPrev <= dPrev && k < 80) {
          signal = 'bullish';
          strength = k < 20 ? 'strong' : 'moderate';
        }
        // Bearish crossover
        else if (k < d && kPrev >= dPrev && k > 20) {
          signal = 'bearish';
          strength = k > 80 ? 'strong' : 'moderate';
        }
      }
    }
    
    return {
      k, d, kPrev, dPrev,
      signal, strength, zone,
      trend: getTrend(k, kPrev)
    };
  }, [indicators.stoch_k, indicators.stoch_d]);

  // Williams %R analysis
  const williamsR = useMemo(() => {
    const williamsR = indicators.williams_r;
    const value = Array.isArray(williamsR) ? getLatestValue(williamsR) : null;
    const prevValue = Array.isArray(williamsR) ? getPreviousValue(williamsR) : null;
    
    let signal = 'neutral';
    let zone = 'neutral';
    let strength = 'weak';
    
    if (value !== null) {
      // Determine zones (Williams %R is negative, so -20 is overbought, -80 is oversold)
      if (value > -20) zone = 'overbought';
      else if (value < -80) zone = 'oversold';
      
      // Signal analysis
      if (prevValue !== null) {
        // Bullish signal (moving up from oversold)
        if (value > -80 && prevValue <= -80) {
          signal = 'bullish';
          strength = 'strong';
        }
        // Bearish signal (moving down from overbought)
        else if (value < -20 && prevValue >= -20) {
          signal = 'bearish';
          strength = 'strong';
        }
        // Momentum signals
        else if (value > prevValue && value < -50) {
          signal = 'bullish';
          strength = 'moderate';
        }
        else if (value < prevValue && value > -50) {
          signal = 'bearish';
          strength = 'moderate';
        }
      }
    }
    
    return {
      value, prevValue,
      signal, zone, strength,
      trend: getTrend(value, prevValue)
    };
  }, [indicators.williams_r]);

  // Fibonacci analysis
  const fibonacci = useMemo(() => {
    const fib236Data = indicators['fib_23.6'];
    const fib382Data = indicators['fib_38.2'];
    const fib500Data = indicators['fib_50.0'];
    const fib618Data = indicators['fib_61.8'];
    
    const fib236 = Array.isArray(fib236Data) ? getLatestValue(fib236Data) : null;
    const fib382 = Array.isArray(fib382Data) ? getLatestValue(fib382Data) : null;
    const fib500 = Array.isArray(fib500Data) ? getLatestValue(fib500Data) : null;
    const fib618 = Array.isArray(fib618Data) ? getLatestValue(fib618Data) : null;
    const currentPrice = (indicators.summary as SummaryData)?.last_price;
    
    let supportLevel = null;
    let resistanceLevel = null;
    let signal = 'neutral';
    
    if (currentPrice && fib236 && fib382 && fib500 && fib618) {
      const fibLevels = [
        { level: 23.6, value: fib236 },
        { level: 38.2, value: fib382 },
        { level: 50.0, value: fib500 },
        { level: 61.8, value: fib618 }
      ].sort((a, b) => a.value - b.value);
      
      // Find support and resistance
      for (let i = 0; i < fibLevels.length; i++) {
        const level = fibLevels[i];
        if (level && currentPrice > level.value) {
          supportLevel = level;
        } else if (level) {
          resistanceLevel = level;
          break;
        }
      }
      
      // Generate signals based on proximity to levels
      if (supportLevel && Math.abs(currentPrice - supportLevel.value) / currentPrice < 0.01) {
        signal = 'support';
      } else if (resistanceLevel && Math.abs(currentPrice - resistanceLevel.value) / currentPrice < 0.01) {
        signal = 'resistance';
      }
    }
    
    return {
      levels: { fib236, fib382, fib500, fib618 },
      currentPrice,
      supportLevel,
      resistanceLevel,
      signal
    };
  }, [indicators['fib_23.6'], indicators['fib_38.2'], indicators['fib_50.0'], indicators['fib_61.8'], indicators.summary]);

  const toggleOverlay = (indicator: string) => {
    const newState = !overlayStates[indicator as keyof typeof overlayStates];
    setOverlayStates(prev => ({
      ...prev,
      [indicator]: newState
    }));
    onToggleOverlay?.(indicator, newState);
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish': return 'text-red-600 bg-red-50 border-red-200';
      case 'support': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'resistance': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'overbought': return 'text-red-600 bg-red-50';
      case 'oversold': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="panel" style={{ marginTop: 8 }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
        Key Technical Indicators
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        
        {/* Stochastic Oscillator */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Stochastic Oscillator</h4>
              {getTrendIcon(stochastic.trend)}
            </div>
            <button
              onClick={() => toggleOverlay('stochastic')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: overlayStates.stochastic ? 'var(--accent)' : 'var(--muted)'
              }}
              title="Toggle chart overlay"
            >
              {overlayStates.stochastic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>%K</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>
                {formatValue(stochastic.k, 1)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>%D</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>
                {formatValue(stochastic.d, 1)}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getZoneColor(stochastic.zone)}`}>
              {stochastic.zone.charAt(0).toUpperCase() + stochastic.zone.slice(1)}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getSignalColor(stochastic.signal)}`}>
              {stochastic.signal === 'neutral' ? 'No Signal' : 
               `${stochastic.signal.charAt(0).toUpperCase() + stochastic.signal.slice(1)} (${stochastic.strength})`}
            </span>
          </div>
          
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            Momentum oscillator (0-100). Overbought &gt;80, Oversold &lt;20
          </div>
        </div>

        {/* Williams %R */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Williams %R</h4>
              {getTrendIcon(williamsR.trend)}
            </div>
            <button
              onClick={() => toggleOverlay('williamsR')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: overlayStates.williamsR ? 'var(--accent)' : 'var(--muted)'
              }}
              title="Toggle chart overlay"
            >
              {overlayStates.williamsR ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Current Value</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text)' }}>
              {formatValue(williamsR.value, 1)}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getZoneColor(williamsR.zone)}`}>
              {williamsR.zone.charAt(0).toUpperCase() + williamsR.zone.slice(1)}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getSignalColor(williamsR.signal)}`}>
              {williamsR.signal === 'neutral' ? 'No Signal' : 
               `${williamsR.signal.charAt(0).toUpperCase() + williamsR.signal.slice(1)} (${williamsR.strength})`}
            </span>
          </div>
          
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            Momentum oscillator (-100 to 0). Overbought &gt;-20, Oversold &lt;-80
          </div>
        </div>

        {/* Fibonacci Retracements */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Fibonacci Levels</h4>
            <button
              onClick={() => toggleOverlay('fibonacci')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                padding: '4px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: overlayStates.fibonacci ? 'var(--accent)' : 'var(--muted)'
              }}
              title="Toggle chart overlay"
            >
              {overlayStates.fibonacci ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Current Price</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)' }}>
              ${fibonacci.currentPrice ? formatValue(fibonacci.currentPrice, 2) : 'N/A'}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '6px', background: 'var(--card)', borderRadius: '4px' }}>
              <div style={{ color: 'var(--muted)' }}>23.6%</div>
              <div style={{ fontWeight: '600' }}>${formatValue(fibonacci.levels.fib236, 2)}</div>
            </div>
            <div style={{ padding: '6px', background: 'var(--card)', borderRadius: '4px' }}>
              <div style={{ color: 'var(--muted)' }}>38.2%</div>
              <div style={{ fontWeight: '600' }}>${formatValue(fibonacci.levels.fib382, 2)}</div>
            </div>
            <div style={{ padding: '6px', background: 'var(--card)', borderRadius: '4px' }}>
              <div style={{ color: 'var(--muted)' }}>50.0%</div>
              <div style={{ fontWeight: '600' }}>${formatValue(fibonacci.levels.fib500, 2)}</div>
            </div>
            <div style={{ padding: '6px', background: 'var(--card)', borderRadius: '4px' }}>
              <div style={{ color: 'var(--muted)' }}>61.8%</div>
              <div style={{ fontWeight: '600' }}>${formatValue(fibonacci.levels.fib618, 2)}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {fibonacci.supportLevel && (
              <div style={{ fontSize: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>Support: </span>
                <span style={{ fontWeight: '600', color: 'var(--green)' }}>
                  {fibonacci.supportLevel.level}% (${formatValue(fibonacci.supportLevel.value, 2)})
                </span>
              </div>
            )}
            {fibonacci.resistanceLevel && (
              <div style={{ fontSize: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>Resistance: </span>
                <span style={{ fontWeight: '600', color: 'var(--red)' }}>
                  {fibonacci.resistanceLevel.level}% (${formatValue(fibonacci.resistanceLevel.value, 2)})
                </span>
              </div>
            )}
            {fibonacci.signal !== 'neutral' && (
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getSignalColor(fibonacci.signal)}`}>
                Near {fibonacci.signal} Level
              </span>
            )}
          </div>
          
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            Dynamic retracement levels based on 50-period range
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyIndicators;