// Advanced Timeframe Management Panel
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, TrendingUp, BarChart3, Eye, EyeOff, Grid3X3, Maximize2, RefreshCw, Zap } from 'lucide-react';

interface TimeframeData {
  interval: number;
  label: string;
  description: string;
  category: 'scalping' | 'intraday' | 'swing' | 'position';
  color: string;
  data?: any[];
  lastUpdated?: number;
  isLoading?: boolean;
}

interface MultiTimeframeAnalysis {
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  confluence: number; // 0-100 - how many timeframes agree
  signals: {
    timeframe: number;
    signal: 'buy' | 'sell' | 'hold';
    strength: number;
  }[];
}

interface Props {
  currentInterval: number;
  symbol: string;
  market: 'crypto' | 'stocks';
  onIntervalChange: (interval: number) => void;
  onMultiTimeframeView?: (intervals: number[]) => void;
  style?: React.CSSProperties;
}

const TIMEFRAMES: TimeframeData[] = [
  // Scalping (seconds/minutes)
  { interval: 0.25, label: '15s', description: 'Ultra-short scalping', category: 'scalping', color: '#f44336' },
  { interval: 0.5, label: '30s', description: 'High-frequency scalping', category: 'scalping', color: '#e57373' },
  { interval: 1, label: '1m', description: 'Minute scalping', category: 'scalping', color: '#ef5350' },
  { interval: 3, label: '3m', description: 'Quick scalping', category: 'scalping', color: '#ff5722' },
  { interval: 5, label: '5m', description: 'Short-term scalping', category: 'scalping', color: '#ff7043' },
  
  // Intraday (minutes/hours)
  { interval: 10, label: '10m', description: 'Micro swing trading', category: 'intraday', color: '#ff9800' },
  { interval: 15, label: '15m', description: 'Short intraday moves', category: 'intraday', color: '#ffb74d' },
  { interval: 30, label: '30m', description: 'Intraday analysis', category: 'intraday', color: '#ffc107' },
  { interval: 60, label: '1h', description: 'Hourly trends', category: 'intraday', color: '#ffeb3b' },
  { interval: 120, label: '2h', description: 'Extended intraday', category: 'intraday', color: '#fff176' },
  { interval: 240, label: '4h', description: 'Quarter-day view', category: 'intraday', color: '#fff59d' },
  
  // Swing (hours/days)
  { interval: 480, label: '8h', description: 'Third-day analysis', category: 'swing', color: '#8bc34a' },
  { interval: 720, label: '12h', description: 'Half-day swing', category: 'swing', color: '#9ccc65' },
  { interval: 1440, label: '1D', description: 'Daily swing trading', category: 'swing', color: '#aed581' },
  { interval: 2880, label: '2D', description: 'Multi-day swings', category: 'swing', color: '#c5e1a5' },
  { interval: 4320, label: '3D', description: 'Extended swing trades', category: 'swing', color: '#dcedc8' },
  
  // Position (days/weeks/months)
  { interval: 10080, label: '1W', description: 'Weekly position trading', category: 'position', color: '#2196f3' },
  { interval: 20160, label: '2W', description: 'Bi-weekly analysis', category: 'position', color: '#42a5f5' },
  { interval: 43200, label: '1M', description: 'Monthly trends', category: 'position', color: '#64b5f6' },
  { interval: 129600, label: '3M', description: 'Quarterly analysis', category: 'position', color: '#90caf9' },
  { interval: 259200, label: '6M', description: 'Semi-annual view', category: 'position', color: '#bbdefb' },
  { interval: 525600, label: '1Y', description: 'Yearly perspective', category: 'position', color: '#e3f2fd' }
];

const TimeframePanel: React.FC<Props> = ({ 
  currentInterval, 
  symbol, 
  market, 
  onIntervalChange, 
  onMultiTimeframeView,
  style 
}) => {
  const [selectedTimeframes, setSelectedTimeframes] = useState<number[]>([currentInterval]);
  const [viewMode, setViewMode] = useState<'single' | 'multi' | 'analysis'>('single');
  const [analysisMode, setAnalysisMode] = useState<'trend' | 'momentum' | 'volume'>('trend');
  const [showCategories, setShowCategories] = useState(true);
  const [multiTimeframeData, setMultiTimeframeData] = useState<Map<number, any>>(new Map());
  const [analysis, setAnalysis] = useState<MultiTimeframeAnalysis | null>(null);

  // Group timeframes by category
  const groupedTimeframes = useMemo(() => {
    return TIMEFRAMES.reduce((groups, tf) => {
      if (!groups[tf.category]) groups[tf.category] = [];
      groups[tf.category].push(tf);
      return groups;
    }, {} as Record<string, TimeframeData[]>);
  }, []);

  // Get category info
  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'scalping': return { icon: Zap, label: 'Scalping', description: 'Seconds to minutes' };
      case 'intraday': return { icon: Clock, label: 'Intraday', description: 'Minutes to hours' };
      case 'swing': return { icon: TrendingUp, label: 'Swing', description: 'Hours to days' };
      case 'position': return { icon: BarChart3, label: 'Position', description: 'Days to months' };
      default: return { icon: Clock, label: category, description: '' };
    }
  };

  // Multi-timeframe analysis
  const performMultiTimeframeAnalysis = useCallback(async () => {
    if (selectedTimeframes.length < 2) return;

    // Simulate multi-timeframe analysis
    const signals = selectedTimeframes.map((tf, index) => {
      const strength = Math.random() * 100;
      const signalType = strength > 60 ? 'buy' : strength < 40 ? 'sell' : 'hold';
      
      return {
        timeframe: tf,
        signal: signalType as 'buy' | 'sell' | 'hold',
        strength
      };
    });

    const bullishCount = signals.filter(s => s.signal === 'buy').length;
    const bearishCount = signals.filter(s => s.signal === 'sell').length;
    const totalCount = signals.length;

    const confluence = Math.max(bullishCount, bearishCount) / totalCount * 100;
    const trend = bullishCount > bearishCount ? 'bullish' : bearishCount > bullishCount ? 'bearish' : 'neutral';
    const strength = confluence;

    setAnalysis({
      trend,
      strength,
      confluence,
      signals
    });
  }, [selectedTimeframes]);

  // Update analysis when timeframes change
  useEffect(() => {
    if (viewMode === 'analysis') {
      performMultiTimeframeAnalysis();
    }
  }, [selectedTimeframes, viewMode, performMultiTimeframeAnalysis]);

  // Handle timeframe selection
  const handleTimeframeSelect = (interval: number) => {
    if (viewMode === 'single') {
      onIntervalChange(interval);
    } else if (viewMode === 'multi') {
      const newSelection = selectedTimeframes.includes(interval)
        ? selectedTimeframes.filter(tf => tf !== interval)
        : [...selectedTimeframes, interval].slice(0, 4); // Limit to 4 timeframes
      
      setSelectedTimeframes(newSelection);
      if (onMultiTimeframeView) {
        onMultiTimeframeView(newSelection);
      }
    }
  };

  // Get timeframe label
  const getTimeframeLabel = (interval: number) => {
    const tf = TIMEFRAMES.find(t => t.interval === interval);
    return tf ? tf.label : `${interval}m`;
  };

  // Popular timeframe sets
  const popularSets = {
    scalping: [1, 5, 15],
    intraday: [15, 60, 240],
    swing: [240, 1440, 10080],
    position: [1440, 10080, 43200]
  };

  const formatInterval = (interval: number): string => {
    if (interval < 1) return `${Math.round(interval * 60)}s`;
    if (interval < 60) return `${interval}m`;
    if (interval < 1440) return `${Math.round(interval / 60)}h`;
    if (interval < 10080) return `${Math.round(interval / 1440)}d`;
    if (interval < 43200) return `${Math.round(interval / 10080)}w`;
    return `${Math.round(interval / 43200)}M`;
  };

  return (
    <div className="panel" style={style}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock className="w-5 h-5" />
          Timeframes
          <span style={{
            fontSize: '12px',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            {getTimeframeLabel(currentInterval)}
          </span>
        </h3>
        
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setShowCategories(!showCategories)}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              backgroundColor: showCategories ? '#4caf50' : '#f5f5f5',
              color: showCategories ? 'white' : '#666',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            <Grid3X3 className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => setViewMode(viewMode === 'multi' ? 'single' : 'multi')}
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              backgroundColor: viewMode === 'multi' ? '#2196f3' : '#f5f5f5',
              color: viewMode === 'multi' ? 'white' : '#666',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
            title="Multi-timeframe view"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {(['single', 'multi', 'analysis'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              fontSize: '11px',
              padding: '4px 12px',
              backgroundColor: viewMode === mode ? '#2196f3' : '#f5f5f5',
              color: viewMode === mode ? 'white' : '#666',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {mode === 'single' ? 'Single TF' : mode === 'multi' ? 'Multi TF' : 'Analysis'}
          </button>
        ))}
      </div>

      {/* Multi-timeframe Analysis */}
      {viewMode === 'analysis' && analysis && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Multi-Timeframe Analysis</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Overall Trend</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: analysis.trend === 'bullish' ? '#4caf50' : analysis.trend === 'bearish' ? '#f44336' : '#ff9800'
              }}>
                {analysis.trend.toUpperCase()}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Strength</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {analysis.strength.toFixed(0)}%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>Confluence</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {analysis.confluence.toFixed(0)}%
              </div>
            </div>
          </div>
          
          <div style={{ fontSize: '11px' }}>
            <strong>Signals:</strong>
            {analysis.signals.map((signal, idx) => (
              <span 
                key={idx}
                style={{ 
                  marginLeft: 8,
                  padding: '2px 6px',
                  backgroundColor: signal.signal === 'buy' ? '#e8f5e8' : signal.signal === 'sell' ? '#ffebee' : '#f5f5f5',
                  color: signal.signal === 'buy' ? '#2e7d32' : signal.signal === 'sell' ? '#c62828' : '#666',
                  borderRadius: '3px'
                }}
              >
                {getTimeframeLabel(signal.timeframe)}: {signal.signal.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Popular Sets */}
      {viewMode !== 'single' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>Popular Sets:</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {Object.entries(popularSets).map(([setName, intervals]) => (
              <button
                key={setName}
                onClick={() => {
                  setSelectedTimeframes(intervals);
                  if (onMultiTimeframeView) onMultiTimeframeView(intervals);
                }}
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  border: '1px solid #bbdefb',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {setName} ({intervals.map(i => getTimeframeLabel(i)).join(', ')})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeframe Grid */}
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {showCategories ? (
          // Categorized view
          Object.entries(groupedTimeframes).map(([category, timeframes]) => {
            const categoryInfo = getCategoryInfo(category);
            const Icon = categoryInfo.icon;
            
            return (
              <div key={category} style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  padding: '4px 0',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <Icon className="w-4 h-4" style={{ color: timeframes[0].color }} />
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
                    {categoryInfo.label}
                  </span>
                  <span style={{ fontSize: '10px', color: '#666' }}>
                    {categoryInfo.description}
                  </span>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: 4
                }}>
                  {timeframes.map(tf => {
                    const isSelected = viewMode === 'single' 
                      ? currentInterval === tf.interval
                      : selectedTimeframes.includes(tf.interval);
                    
                    return (
                      <button
                        key={tf.interval}
                        onClick={() => handleTimeframeSelect(tf.interval)}
                        style={{
                          padding: '8px 4px',
                          fontSize: '11px',
                          backgroundColor: isSelected ? tf.color : '#f8f9fa',
                          color: isSelected ? 'white' : '#666',
                          border: `1px solid ${isSelected ? tf.color : '#e9ecef'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          textAlign: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        title={tf.description}
                      >
                        <div style={{ fontWeight: 'bold' }}>{tf.label}</div>
                        {viewMode === 'multi' && isSelected && (
                          <div style={{ fontSize: '8px', opacity: 0.8 }}>✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          // Flat view
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: 4
          }}>
            {TIMEFRAMES.map(tf => {
              const isSelected = viewMode === 'single' 
                ? currentInterval === tf.interval
                : selectedTimeframes.includes(tf.interval);
              
              return (
                <button
                  key={tf.interval}
                  onClick={() => handleTimeframeSelect(tf.interval)}
                  style={{
                    padding: '8px 4px',
                    fontSize: '11px',
                    backgroundColor: isSelected ? tf.color : '#f8f9fa',
                    color: isSelected ? 'white' : '#666',
                    border: `1px solid ${isSelected ? tf.color : '#e9ecef'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title={tf.description}
                >
                  <div style={{ fontWeight: 'bold' }}>{tf.label}</div>
                  {viewMode === 'multi' && isSelected && (
                    <div style={{ fontSize: '8px', opacity: 0.8 }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Timeframes Summary */}
      {viewMode !== 'single' && selectedTimeframes.length > 0 && (
        <div style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: '#f0f7ff',
          borderRadius: 8,
          border: '1px solid #bbdefb'
        }}>
          <div style={{ fontSize: '12px', color: '#1976d2', marginBottom: 4 }}>
            Selected Timeframes ({selectedTimeframes.length}/4):
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {selectedTimeframes.map(interval => (
              <span
                key={interval}
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 'bold'
                }}
              >
                {getTimeframeLabel(interval)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeframePanel;