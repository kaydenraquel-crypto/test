import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Clock, 
  Target, 
  Award, 
  AlertCircle,
  RefreshCw,
  Calendar,
  Percent,
  LineChart,
  PieChart
} from 'lucide-react'

interface TradingStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  bestTrade: number
  worstTrade: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  avgHoldTime: string
}

interface SymbolPerformance {
  symbol: string
  trades: number
  pnl: number
  winRate: number
  avgReturn: number
}

interface TimeframePerfomance {
  period: string
  trades: number
  pnl: number
  winRate: number
  roi: number
}

interface AnalyticsDashboardProps {}

const AnalyticsDashboardEnhanced: React.FC<AnalyticsDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'symbols' | 'timeframes'>('overview')
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Generate demo trading statistics
  const generateTradingStats = useCallback((): TradingStats => {
    const totalTrades = 150 + Math.floor(Math.random() * 100)
    const winRate = 0.62 + Math.random() * 0.15 // 62-77% win rate
    const winningTrades = Math.floor(totalTrades * winRate)
    const losingTrades = totalTrades - winningTrades
    
    const totalPnL = -5000 + Math.random() * 25000 // -5k to +20k
    const bestTrade = 1000 + Math.random() * 3000
    const worstTrade = -800 - Math.random() * 1200
    const avgWin = 200 + Math.random() * 400
    const avgLoss = -150 - Math.random() * 200
    const profitFactor = Math.abs((winningTrades * avgWin) / (losingTrades * avgLoss))
    const sharpeRatio = 0.8 + Math.random() * 1.2
    const maxDrawdown = -2000 - Math.random() * 3000

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: winRate * 100,
      totalPnL,
      bestTrade,
      worstTrade,
      avgWin,
      avgLoss,
      profitFactor,
      sharpeRatio,
      maxDrawdown,
      avgHoldTime: '2h 34m'
    }
  }, [timeRange])

  const generateSymbolPerformance = useCallback((): SymbolPerformance[] => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'AVAXUSDT']
    return symbols.map(symbol => {
      const trades = 10 + Math.floor(Math.random() * 40)
      const winRate = 50 + Math.random() * 30 // 50-80%
      const pnl = -1000 + Math.random() * 5000
      const avgReturn = -5 + Math.random() * 15 // -5% to +10%
      
      return {
        symbol,
        trades,
        pnl,
        winRate,
        avgReturn
      }
    }).sort((a, b) => b.pnl - a.pnl)
  }, [timeRange])

  const generateTimeframePerformance = useCallback((): TimeframePerfomance[] => {
    const periods = ['This Week', 'Last Week', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months']
    return periods.map(period => {
      const trades = 5 + Math.floor(Math.random() * 25)
      const winRate = 45 + Math.random() * 35 // 45-80%
      const pnl = -500 + Math.random() * 3000
      const roi = -10 + Math.random() * 25 // -10% to +15%
      
      return {
        period,
        trades,
        pnl,
        winRate,
        roi
      }
    })
  }, [timeRange])

  const [tradingStats, setTradingStats] = useState<TradingStats>(generateTradingStats)
  const [symbolPerformance, setSymbolPerformance] = useState<SymbolPerformance[]>(generateSymbolPerformance)
  const [timeframePerformance, setTimeframePerformance] = useState<TimeframePerfomance[]>(generateTimeframePerformance)

  // Refresh data when time range changes
  useEffect(() => {
    setTradingStats(generateTradingStats())
    setSymbolPerformance(generateSymbolPerformance())
    setTimeframePerformance(generateTimeframePerformance())
    setLastUpdated(new Date())
  }, [timeRange, generateTradingStats, generateSymbolPerformance, generateTimeframePerformance])

  const refreshData = useCallback(() => {
    setTradingStats(generateTradingStats())
    setSymbolPerformance(generateSymbolPerformance())
    setTimeframePerformance(generateTimeframePerformance())
    setLastUpdated(new Date())
  }, [generateTradingStats, generateSymbolPerformance, generateTimeframePerformance])

  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}$${Math.abs(value).toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? '#00d4aa' : '#ff6b6b'
  }

  const getPerformanceIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown
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
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ 
              color: '#7c3aed', 
              margin: '0 0 4px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BarChart3 style={{ width: '18px', height: '18px' }} />
              Analytics Dashboard
            </h3>
            <div style={{ 
              color: '#888', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Clock style={{ width: '12px', height: '12px' }} />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* Time Range Selector */}
            <div style={{
              display: 'flex',
              backgroundColor: '#0a0a0a',
              borderRadius: '6px',
              padding: '2px'
            }}>
              {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: timeRange === range ? '#7c3aed' : 'transparent',
                    color: timeRange === range ? 'white' : '#888',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: timeRange === range ? 'bold' : 'normal'
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
            
            <button
              onClick={refreshData}
              style={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '6px',
                padding: '6px',
                color: '#888',
                cursor: 'pointer'
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #333',
        backgroundColor: '#0a0a0a'
      }}>
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'performance', label: 'Performance', icon: TrendingUp },
          { key: 'symbols', label: 'By Symbol', icon: PieChart },
          { key: 'timeframes', label: 'Timeline', icon: Calendar }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: activeTab === tab.key ? '#7c3aed' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#888',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal'
              }}
            >
              <Icon style={{ width: '14px', height: '14px' }} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div style={{
        padding: '20px',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Key Metrics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Total P&L */}
              <div style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#888', fontSize: '12px' }}>Total P&L</span>
                  <DollarSign style={{ 
                    width: '16px', 
                    height: '16px', 
                    color: getPerformanceColor(tradingStats.totalPnL) 
                  }} />
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: getPerformanceColor(tradingStats.totalPnL)
                }}>
                  {formatCurrency(tradingStats.totalPnL)}
                </div>
              </div>

              {/* Win Rate */}
              <div style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#888', fontSize: '12px' }}>Win Rate</span>
                  <Target style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: tradingStats.winRate > 60 ? '#00d4aa' : tradingStats.winRate > 50 ? '#fbbf24' : '#ff6b6b'
                }}>
                  {formatPercent(tradingStats.winRate)}
                </div>
              </div>

              {/* Total Trades */}
              <div style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#888', fontSize: '12px' }}>Total Trades</span>
                  <Activity style={{ width: '16px', height: '16px', color: '#60a5fa' }} />
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {tradingStats.totalTrades}
                </div>
              </div>

              {/* Profit Factor */}
              <div style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#888', fontSize: '12px' }}>Profit Factor</span>
                  <Award style={{ width: '16px', height: '16px', color: '#a855f7' }} />
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: tradingStats.profitFactor > 2 ? '#00d4aa' : tradingStats.profitFactor > 1.5 ? '#fbbf24' : '#ff6b6b'
                }}>
                  {tradingStats.profitFactor.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* Trading Performance */}
              <div style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{ 
                  color: 'white', 
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  Trading Performance
                </h4>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Winning Trades:</span>
                    <span style={{ color: '#00d4aa', fontWeight: 'bold' }}>
                      {tradingStats.winningTrades} ({formatPercent(tradingStats.winRate)})
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Losing Trades:</span>
                    <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                      {tradingStats.losingTrades} ({formatPercent(100 - tradingStats.winRate)})
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Best Trade:</span>
                    <span style={{ color: '#00d4aa', fontWeight: 'bold' }}>
                      {formatCurrency(tradingStats.bestTrade)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Worst Trade:</span>
                    <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                      {formatCurrency(tradingStats.worstTrade)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Avg Win:</span>
                    <span style={{ color: '#00d4aa', fontWeight: 'bold' }}>
                      {formatCurrency(tradingStats.avgWin)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Avg Loss:</span>
                    <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                      {formatCurrency(tradingStats.avgLoss)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Metrics */}
              <div style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{ 
                  color: 'white', 
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  Risk Metrics
                </h4>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Sharpe Ratio:</span>
                    <span style={{ 
                      color: tradingStats.sharpeRatio > 1.5 ? '#00d4aa' : tradingStats.sharpeRatio > 1 ? '#fbbf24' : '#ff6b6b',
                      fontWeight: 'bold' 
                    }}>
                      {tradingStats.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Max Drawdown:</span>
                    <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                      {formatCurrency(tradingStats.maxDrawdown)}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Avg Hold Time:</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>
                      {tradingStats.avgHoldTime}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Risk/Reward:</span>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                      1:{(Math.abs(tradingStats.avgWin / tradingStats.avgLoss)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div>
            <h4 style={{ 
              color: 'white', 
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              Performance Analysis ({timeRange})
            </h4>
            
            {/* Performance Chart Placeholder */}
            <div style={{
              backgroundColor: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <LineChart style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                color: '#444'
              }} />
              <div style={{ color: '#888', fontSize: '16px', marginBottom: '8px' }}>
                Performance Chart
              </div>
              <div style={{ color: '#666', fontSize: '12px' }}>
                P&L curve, equity growth, and drawdown visualization would appear here
              </div>
            </div>

            {/* Monthly Performance Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '8px'
            }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                const pnl = -500 + Math.random() * 2000
                const isCurrentMonth = new Date().getMonth() === index
                
                return (
                  <div
                    key={month}
                    style={{
                      backgroundColor: isCurrentMonth ? '#2a2a2a' : '#0a0a0a',
                      border: `1px solid ${isCurrentMonth ? '#7c3aed' : '#333'}`,
                      borderRadius: '6px',
                      padding: '12px 8px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>
                      {month}
                    </div>
                    <div style={{
                      color: getPerformanceColor(pnl),
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}>
                      {formatCurrency(pnl)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Symbols Tab */}
        {activeTab === 'symbols' && (
          <div>
            <h4 style={{ 
              color: 'white', 
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              Performance by Symbol
            </h4>
            
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              {symbolPerformance.map((symbol, index) => {
                const PerformanceIcon = getPerformanceIcon(symbol.pnl)
                
                return (
                  <div
                    key={symbol.symbol}
                    style={{
                      backgroundColor: '#0a0a0a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        backgroundColor: '#2a2a2a',
                        borderRadius: '6px',
                        padding: '8px',
                        minWidth: '60px',
                        textAlign: 'center'
                      }}>
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                          {symbol.symbol.replace('USDT', '')}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                          {formatCurrency(symbol.pnl)}
                        </div>
                        <div style={{ color: '#888', fontSize: '12px' }}>
                          {symbol.trades} trades • {formatPercent(symbol.winRate)} win rate
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        color: getPerformanceColor(symbol.avgReturn),
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {formatPercent(symbol.avgReturn)}
                      </div>
                      <PerformanceIcon style={{
                        width: '16px',
                        height: '16px',
                        color: getPerformanceColor(symbol.pnl)
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeframes' && (
          <div>
            <h4 style={{ 
              color: 'white', 
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              Performance Timeline
            </h4>
            
            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              {timeframePerformance.map((period, index) => (
                <div
                  key={period.period}
                  style={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    padding: '16px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <h5 style={{ color: 'white', margin: 0, fontSize: '16px' }}>
                      {period.period}
                    </h5>
                    <div style={{
                      color: getPerformanceColor(period.pnl),
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {formatCurrency(period.pnl)}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                    gap: '12px',
                    fontSize: '12px'
                  }}>
                    <div>
                      <span style={{ color: '#888' }}>Trades: </span>
                      <span style={{ color: 'white', fontWeight: 'bold' }}>
                        {period.trades}
                      </span>
                    </div>
                    
                    <div>
                      <span style={{ color: '#888' }}>Win Rate: </span>
                      <span style={{ 
                        color: period.winRate > 60 ? '#00d4aa' : '#fbbf24',
                        fontWeight: 'bold'
                      }}>
                        {formatPercent(period.winRate)}
                      </span>
                    </div>
                    
                    <div>
                      <span style={{ color: '#888' }}>ROI: </span>
                      <span style={{ 
                        color: getPerformanceColor(period.roi),
                        fontWeight: 'bold'
                      }}>
                        {formatPercent(period.roi)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
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
          Analytics powered by NovaSignal • Real-time performance tracking
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '11px',
          color: '#666'
        }}>
          <span>{tradingStats.totalTrades} total trades</span>
          <span>•</span>
          <span>{formatPercent(tradingStats.winRate)} win rate</span>
          <span>•</span>
          <span style={{ color: getPerformanceColor(tradingStats.totalPnL) }}>
            {formatCurrency(tradingStats.totalPnL)} total P&L
          </span>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboardEnhanced