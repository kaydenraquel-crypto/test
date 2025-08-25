import React, { useState, useEffect, useCallback } from 'react'
import { Search, TrendingUp, TrendingDown, Zap, Target, Filter, RefreshCw, AlertTriangle, BarChart3, Activity } from 'lucide-react'

interface TechnicalSignal {
  type: 'breakout' | 'bounce' | 'squeeze' | 'divergence' | 'momentum' | 'volume'
  strength: number
  description: string
  timeframe: '5m' | '15m' | '1h' | '4h' | '1d'
}

interface ScannerOpportunity {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  signals: TechnicalSignal[]
  urgency: 'high' | 'medium' | 'low'
  direction: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  targetPrice?: number
  stopLoss?: number
  riskReward?: number
  lastScanned: string
}

interface MarketScannerProps {
  onSymbolClick?: (symbol: string) => void
}

const MarketScannerEnhanced: React.FC<MarketScannerProps> = ({ onSymbolClick }) => {
  const [opportunities, setOpportunities] = useState<ScannerOpportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [autoScan, setAutoScan] = useState(false)
  const [filter, setFilter] = useState<'all' | 'high-urgency' | 'bullish' | 'bearish'>('all')
  const [sortBy, setSortBy] = useState<'confidence' | 'change' | 'volume' | 'signals'>('confidence')
  const [lastScanTime, setLastScanTime] = useState<Date>(new Date())

  // Generate realistic market scanning opportunities
  const generateScanResults = useCallback((): ScannerOpportunity[] => {
    const symbols = [
      { symbol: 'BTCUSDT', name: 'Bitcoin', basePrice: 43250 },
      { symbol: 'ETHUSDT', name: 'Ethereum', basePrice: 2580 },
      { symbol: 'BNBUSDT', name: 'BNB', basePrice: 315 },
      { symbol: 'SOLUSDT', name: 'Solana', basePrice: 98 },
      { symbol: 'ADAUSDT', name: 'Cardano', basePrice: 0.45 },
      { symbol: 'AVAXUSDT', name: 'Avalanche', basePrice: 24 },
      { symbol: 'DOTUSDT', name: 'Polkadot', basePrice: 6.8 },
      { symbol: 'LINKUSDT', name: 'Chainlink', basePrice: 14.5 },
      { symbol: 'UNIUSDT', name: 'Uniswap', basePrice: 8.2 },
      { symbol: 'MATICUSDT', name: 'Polygon', basePrice: 0.85 }
    ]

    const signalTypes = {
      breakout: [
        'Price breaking above key resistance level with strong volume',
        'Bullish pennant formation completing with breakout signal',
        'Breaking above 20-day moving average with momentum',
        'Volume spike confirming upward breakout pattern'
      ],
      bounce: [
        'Strong bounce from major support level detected',
        'RSI oversold bounce with bullish divergence',
        'Hammer candle formation at key support zone',
        'Double bottom pattern showing reversal signs'
      ],
      squeeze: [
        'Bollinger Bands squeeze indicating volatility expansion',
        'Triangle formation nearing apex for directional move',
        'Low volatility period ending, potential breakout imminent',
        'Coiling price action suggesting explosive move ahead'
      ],
      divergence: [
        'Bullish divergence between price and RSI indicator',
        'MACD showing positive divergence signal',
        'Volume divergence suggesting trend reversal',
        'Momentum indicators diverging from price action'
      ],
      momentum: [
        'Strong upward momentum with increasing volume',
        'Golden cross formation - 50 MA crossing above 200 MA',
        'Accelerating price movement with RSI above 60',
        'Momentum indicators all aligned bullishly'
      ],
      volume: [
        'Unusual volume spike detected - 3x average',
        'Volume accumulation pattern forming',
        'Institutional buying pressure evident',
        'On-balance volume showing strong accumulation'
      ]
    }

    const results: ScannerOpportunity[] = []
    const numOpportunities = 5 + Math.floor(Math.random() * 8) // 5-12 opportunities

    for (let i = 0; i < numOpportunities; i++) {
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
      
      // Skip if symbol is undefined or already added
      if (!randomSymbol || results.find(r => r.symbol === randomSymbol.symbol)) continue

      const priceChange = (Math.random() - 0.5) * 0.1 // ±10% max change
      const currentPrice = randomSymbol.basePrice * (1 + priceChange)
      const change24h = randomSymbol.basePrice * priceChange
      const changePercent24h = priceChange * 100

      // Determine direction based on price change and random factors
      let direction: 'bullish' | 'bearish' | 'neutral'
      if (changePercent24h > 2) direction = 'bullish'
      else if (changePercent24h < -2) direction = 'bearish'
      else direction = Math.random() > 0.5 ? 'bullish' : 'bearish'

      // Generate 1-4 signals per opportunity
      const numSignals = 1 + Math.floor(Math.random() * 3)
      const signals: TechnicalSignal[] = []
      const availableTypes = Object.keys(signalTypes) as (keyof typeof signalTypes)[]
      
      for (let j = 0; j < numSignals; j++) {
        const signalType = availableTypes[Math.floor(Math.random() * availableTypes.length)]
        if (!signalType) continue
        
        const descriptions = signalTypes[signalType]
        const description = descriptions[Math.floor(Math.random() * descriptions.length)]
        if (!description) continue
        
        signals.push({
          type: signalType,
          strength: 60 + Math.random() * 40, // 60-100% strength
          description,
          timeframe: ['5m', '15m', '1h', '4h', '1d'][Math.floor(Math.random() * 5)] as any
        })
      }

      // Calculate confidence based on signals and price action
      const avgSignalStrength = signals.reduce((sum, s) => sum + s.strength, 0) / signals.length
      const confidence = Math.min(95, avgSignalStrength + Math.abs(changePercent24h) * 2)

      // Determine urgency
      let urgency: 'high' | 'medium' | 'low'
      if (confidence > 85 && Math.abs(changePercent24h) > 5) urgency = 'high'
      else if (confidence > 70 || Math.abs(changePercent24h) > 3) urgency = 'medium'
      else urgency = 'low'

      // Calculate target and stop loss
      const targetMultiplier = direction === 'bullish' ? 1.08 + Math.random() * 0.07 : 0.92 - Math.random() * 0.07
      const stopMultiplier = direction === 'bullish' ? 0.96 - Math.random() * 0.02 : 1.04 + Math.random() * 0.02
      
      const targetPrice = currentPrice * targetMultiplier
      const stopLoss = currentPrice * stopMultiplier
      const riskReward = Math.abs((targetPrice - currentPrice) / (stopLoss - currentPrice))

      results.push({
        symbol: randomSymbol.symbol,
        name: randomSymbol.name,
        price: currentPrice,
        change24h,
        changePercent24h,
        volume24h: Math.random() * 10000000000, // Random volume
        signals,
        urgency,
        direction,
        confidence,
        targetPrice,
        stopLoss,
        riskReward,
        lastScanned: new Date().toISOString()
      })
    }

    return results.sort((a, b) => b.confidence - a.confidence)
  }, [])

  // Run scan
  const runScan = useCallback(async () => {
    setLoading(true)
    
    // Simulate scanning delay
    setTimeout(() => {
      setOpportunities(generateScanResults())
      setLastScanTime(new Date())
      setLoading(false)
    }, 1500)
  }, [generateScanResults])

  // Auto-scan functionality
  useEffect(() => {
    if (autoScan) {
      const interval = setInterval(runScan, 2 * 60 * 1000) // Every 2 minutes
      return () => clearInterval(interval)
    }
    return undefined;
  }, [autoScan, runScan])

  // Initial scan on mount
  useEffect(() => {
    runScan()
  }, [runScan])

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    if (filter === 'all') return true
    if (filter === 'high-urgency') return opp.urgency === 'high'
    if (filter === 'bullish') return opp.direction === 'bullish'
    if (filter === 'bearish') return opp.direction === 'bearish'
    return true
  })

  // Sort opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    switch (sortBy) {
      case 'confidence':
        return b.confidence - a.confidence
      case 'change':
        return Math.abs(b.changePercent24h) - Math.abs(a.changePercent24h)
      case 'volume':
        return b.volume24h - a.volume24h
      case 'signals':
        return b.signals.length - a.signals.length
      default:
        return 0
    }
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return { bg: '#3a1a1a', border: '#ff6b6b', text: '#ff6b6b' }
      case 'medium': return { bg: '#3a2a1a', border: '#fbbf24', text: '#fbbf24' }
      default: return { bg: '#1a2a3a', border: '#60a5fa', text: '#60a5fa' }
    }
  }

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'bullish': return '#00d4aa'
      case 'bearish': return '#ff6b6b'
      default: return '#888'
    }
  }

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'breakout': return <TrendingUp style={{ width: '12px', height: '12px' }} />
      case 'bounce': return <TrendingDown style={{ width: '12px', height: '12px' }} />
      case 'squeeze': return <Target style={{ width: '12px', height: '12px' }} />
      case 'divergence': return <BarChart3 style={{ width: '12px', height: '12px' }} />
      case 'momentum': return <Zap style={{ width: '12px', height: '12px' }} />
      case 'volume': return <Activity style={{ width: '12px', height: '12px' }} />
      default: return <AlertTriangle style={{ width: '12px', height: '12px' }} />
    }
  }

  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(4)
    if (price < 10) return price.toFixed(3)
    if (price < 100) return price.toFixed(2)
    return Math.round(price).toLocaleString()
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #333',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px'
        }}>
          <div>
            <h3 style={{ 
              color: '#7c2d12', 
              margin: '0 0 4px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔍 Market Scanner
              {loading && <RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
            </h3>
            <div style={{ 
              color: '#888', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>{sortedOpportunities.length} opportunities</span>
              <span>•</span>
              <span>Last scan: {lastScanTime.toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#888',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={autoScan}
                onChange={(e) => setAutoScan(e.target.checked)}
                style={{ accentColor: '#7c2d12' }}
              />
              Auto-scan
            </label>
            
            <button
              onClick={runScan}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#444' : '#7c2d12',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? (
                <>
                  <RefreshCw style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                  Scanning...
                </>
              ) : (
                <>
                  <Search style={{ width: '14px', height: '14px' }} />
                  Scan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filters and Sort */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px'
        }}>
          {/* Filter buttons */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'high-urgency', 'bullish', 'bearish'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: filter === f ? '#7c2d12' : 'transparent',
                  color: filter === f ? 'white' : '#888',
                  border: `1px solid ${filter === f ? '#7c2d12' : '#333'}`,
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                {f.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter style={{ width: '12px', height: '12px', color: '#888' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#888',
                fontSize: '11px',
                padding: '2px 6px'
              }}
            >
              <option value="confidence">Confidence</option>
              <option value="change">Price Change</option>
              <option value="volume">Volume</option>
              <option value="signals">Signal Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div style={{
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        {loading && opportunities.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#888'
          }}>
            <Search style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              color: '#444',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              Scanning Markets...
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Analyzing technical indicators and market patterns
            </div>
          </div>
        ) : sortedOpportunities.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#888'
          }}>
            <Target style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              color: '#444'
            }} />
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              No {filter !== 'all' ? filter.replace('-', ' ') : ''} opportunities found
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Try adjusting your filters or run a new scan
            </div>
          </div>
        ) : (
          sortedOpportunities.map((opportunity, index) => {
            const urgencyStyle = getUrgencyColor(opportunity.urgency)
            return (
              <div
                key={opportunity.symbol}
                onClick={() => onSymbolClick && onSymbolClick(opportunity.symbol)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #2a2a2a',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#252525'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a'
                }}
              >
                {/* Opportunity Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          {opportunity.symbol.replace('USDT', '')}
                        </span>
                        
                        <span style={{
                          color: getDirectionColor(opportunity.direction),
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {opportunity.direction === 'bullish' ? '↗' : opportunity.direction === 'bearish' ? '↘' : '→'}
                        </span>

                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: urgencyStyle.bg,
                          border: `1px solid ${urgencyStyle.border}`,
                          borderRadius: '4px',
                          color: urgencyStyle.text,
                          fontSize: '10px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {opportunity.urgency}
                        </span>
                      </div>
                      
                      <div style={{
                        color: '#888',
                        fontSize: '12px'
                      }}>
                        {opportunity.name} • ${formatPrice(opportunity.price)}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      color: opportunity.changePercent24h >= 0 ? '#00d4aa' : '#ff6b6b',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {opportunity.changePercent24h >= 0 ? '+' : ''}{opportunity.changePercent24h.toFixed(2)}%
                    </div>
                    
                    <div style={{
                      color: '#888',
                      fontSize: '11px'
                    }}>
                      {opportunity.confidence.toFixed(0)}% confidence
                    </div>
                  </div>
                </div>

                {/* Signals */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  {opportunity.signals.map((signal, signalIndex) => (
                    <div
                      key={signalIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        fontSize: '11px'
                      }}
                    >
                      <div style={{ color: '#7c2d12' }}>
                        {getSignalIcon(signal.type)}
                      </div>
                      <span style={{ color: '#ccc' }}>
                        {signal.type.toUpperCase()}
                      </span>
                      <span style={{ color: '#888' }}>
                        {signal.timeframe}
                      </span>
                      <span style={{ 
                        color: signal.strength > 80 ? '#00d4aa' : signal.strength > 60 ? '#fbbf24' : '#888',
                        fontWeight: 'bold'
                      }}>
                        {signal.strength.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Signal Description */}
                <div style={{
                  color: '#888',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  marginBottom: '12px'
                }}>
                  {opportunity.signals[0]?.description}
                </div>

                {/* Trading Levels */}
                {opportunity.targetPrice && opportunity.stopLoss && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    backgroundColor: '#0a0a0a',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}>
                    <div>
                      <span style={{ color: '#666' }}>Target: </span>
                      <span style={{ color: '#00d4aa', fontWeight: 'bold' }}>
                        ${formatPrice(opportunity.targetPrice)}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Stop: </span>
                      <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                        ${formatPrice(opportunity.stopLoss)}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>R:R </span>
                      <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                        1:{opportunity.riskReward?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      {opportunities.length > 0 && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#666'
          }}>
            Scanning: BTC, ETH, BNB, SOL, ADA, AVAX, DOT, LINK, UNI, MATIC
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: '#666'
          }}>
            <span>{opportunities.filter(o => o.urgency === 'high').length} high priority</span>
            <span>•</span>
            <span>{opportunities.filter(o => o.direction === 'bullish').length} bullish</span>
            <span>•</span>
            <span>Next scan: {autoScan ? '2m' : 'Manual'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MarketScannerEnhanced