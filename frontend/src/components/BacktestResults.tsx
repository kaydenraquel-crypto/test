import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  Target,
  AlertTriangle,
  Info,
  Download,
  X,
  Play,
  Pause
} from 'lucide-react'

interface BacktestResultsProps {
  isOpen: boolean
  onClose: () => void
  backtestData: any
  onRunBacktest?: (strategyId: string, options: any) => void
}

interface EquityPoint {
  date: Date
  value: number
}

interface Trade {
  id: number
  type: string
  entryTime: Date
  exitTime: Date
  entryPrice: number
  exitPrice: number
  size: number
  netPnL: number
  returnPercent: number
  duration: number
  exitReason: string
}

interface BacktestMetrics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalReturn: number
  annualizedReturn: number
  maxDrawdown: number
  sharpeRatio: number
  profitFactor: number
  avgTrade: number
  bestTrade: number
  worstTrade: number
  averageWin: number
  averageLoss: number
}

export default function BacktestResults({ 
  isOpen, 
  onClose, 
  backtestData,
  onRunBacktest 
}: BacktestResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'chart' | 'analysis'>('overview')
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y')
  const [isRunning, setIsRunning] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const formatDuration = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h`
    }
    return `${hours}h`
  }

  const getMetricColor = (value: number, type: 'profit' | 'ratio' | 'percent') => {
    if (type === 'profit') {
      return value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'
    }
    if (type === 'ratio') {
      return value > 1.5 ? 'text-green-400' : value > 1.0 ? 'text-yellow-400' : 'text-red-400'
    }
    if (type === 'percent') {
      return value > 60 ? 'text-green-400' : value > 40 ? 'text-yellow-400' : 'text-red-400'
    }
    return 'text-gray-400'
  }

  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    icon?: React.ReactNode,
    colorClass?: string,
    trend?: 'up' | 'down' | 'neutral'
  ) => {
    return (
      <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="text-sm font-medium text-gray-300">{title}</h4>
          </div>
          {trend && (
            <div className={`p-1 rounded ${
              trend === 'up' ? 'bg-green-500/20 text-green-400' :
              trend === 'down' ? 'bg-red-500/20 text-red-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend === 'neutral' && <Activity className="w-3 h-3" />}
            </div>
          )}
        </div>
        <div className={`text-xl font-bold ${colorClass || 'text-white'}`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
        )}
      </div>
    )
  }

  const renderTradesList = (trades: Trade[]) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left p-3 text-gray-300 font-medium">Trade #</th>
              <th className="text-left p-3 text-gray-300 font-medium">Entry</th>
              <th className="text-left p-3 text-gray-300 font-medium">Exit</th>
              <th className="text-right p-3 text-gray-300 font-medium">P&L</th>
              <th className="text-right p-3 text-gray-300 font-medium">Return</th>
              <th className="text-right p-3 text-gray-300 font-medium">Duration</th>
              <th className="text-left p-3 text-gray-300 font-medium">Exit Reason</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, index) => (
              <tr key={trade.id} className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-800/50' : ''}`}>
                <td className="p-3 text-gray-300">#{trade.id}</td>
                <td className="p-3">
                  <div className="text-white">{formatCurrency(trade.entryPrice)}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(trade.entryTime).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-white">{formatCurrency(trade.exitPrice)}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(trade.exitTime).toLocaleDateString()}
                  </div>
                </td>
                <td className={`p-3 text-right font-medium ${getMetricColor(trade.netPnL, 'profit')}`}>
                  {formatCurrency(trade.netPnL)}
                </td>
                <td className={`p-3 text-right font-medium ${getMetricColor(trade.returnPercent, 'profit')}`}>
                  {formatPercent(trade.returnPercent)}
                </td>
                <td className="p-3 text-right text-gray-300">
                  {formatDuration(trade.duration)}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    trade.exitReason === 'take_profit' ? 'bg-green-500/20 text-green-400' :
                    trade.exitReason === 'stop_loss' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {trade.exitReason.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!isOpen) return null

  // Mock data if no backtest data provided
  const mockMetrics: BacktestMetrics = backtestData?.metrics || {
    totalTrades: 45,
    winningTrades: 28,
    losingTrades: 17,
    winRate: 62.22,
    totalReturn: 24.50,
    annualizedReturn: 18.75,
    maxDrawdown: 8.34,
    sharpeRatio: 1.45,
    profitFactor: 1.85,
    avgTrade: 125.50,
    bestTrade: 1250.00,
    worstTrade: -485.00,
    averageWin: 285.50,
    averageLoss: -165.25
  }

  const mockTrades: Trade[] = backtestData?.trades || [
    {
      id: 1,
      type: 'long',
      entryTime: new Date('2024-01-15'),
      exitTime: new Date('2024-01-18'),
      entryPrice: 150.25,
      exitPrice: 156.80,
      size: 100,
      netPnL: 655.00,
      returnPercent: 4.36,
      duration: 3 * 24 * 60 * 60 * 1000,
      exitReason: 'take_profit'
    },
    {
      id: 2,
      type: 'long',
      entryTime: new Date('2024-01-20'),
      exitTime: new Date('2024-01-22'),
      entryPrice: 158.90,
      exitPrice: 152.30,
      size: 100,
      netPnL: -660.00,
      returnPercent: -4.15,
      duration: 2 * 24 * 60 * 60 * 1000,
      exitReason: 'stop_loss'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-orange-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Backtest Results</h2>
              <p className="text-sm text-gray-400">
                {backtestData?.strategyId || 'Strategy Performance Analysis'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {/* Export functionality */}}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Quick Stats */}
          <div className="w-80 p-6 border-r border-gray-700 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
            
            <div className="space-y-4">
              {renderMetricCard(
                'Total Return',
                formatPercent(mockMetrics.totalReturn),
                'Since inception',
                <TrendingUp className="w-4 h-4 text-green-400" />,
                getMetricColor(mockMetrics.totalReturn, 'profit'),
                mockMetrics.totalReturn > 0 ? 'up' : 'down'
              )}

              {renderMetricCard(
                'Annualized Return',
                formatPercent(mockMetrics.annualizedReturn),
                'Risk-adjusted',
                <Calendar className="w-4 h-4 text-blue-400" />,
                getMetricColor(mockMetrics.annualizedReturn, 'profit')
              )}

              {renderMetricCard(
                'Win Rate',
                formatPercent(mockMetrics.winRate),
                `${mockMetrics.winningTrades}/${mockMetrics.totalTrades} trades`,
                <Target className="w-4 h-4 text-purple-400" />,
                getMetricColor(mockMetrics.winRate, 'percent')
              )}

              {renderMetricCard(
                'Profit Factor',
                mockMetrics.profitFactor.toFixed(2),
                'Gross profit / Gross loss',
                <Activity className="w-4 h-4 text-cyan-400" />,
                getMetricColor(mockMetrics.profitFactor, 'ratio')
              )}

              {renderMetricCard(
                'Max Drawdown',
                formatPercent(mockMetrics.maxDrawdown),
                'Peak-to-trough decline',
                <AlertTriangle className="w-4 h-4 text-red-400" />,
                'text-red-400',
                'down'
              )}

              {renderMetricCard(
                'Sharpe Ratio',
                mockMetrics.sharpeRatio.toFixed(2),
                'Risk-adjusted performance',
                <BarChart3 className="w-4 h-4 text-green-400" />,
                getMetricColor(mockMetrics.sharpeRatio, 'ratio')
              )}
            </div>

            {/* Strategy Settings */}
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <h4 className="font-medium text-white mb-2">Backtest Settings</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Initial Capital:</span>
                  <span>{formatCurrency(backtestData?.initialCapital || 10000)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission:</span>
                  <span>{((backtestData?.commission || 0.001) * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Period:</span>
                  <span>1 Year</span>
                </div>
                <div className="flex justify-between">
                  <span>Trades:</span>
                  <span>{mockMetrics.totalTrades}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {[
                { id: 'overview', name: 'Overview', icon: PieChart },
                { id: 'trades', name: 'Trades', icon: Activity },
                { id: 'chart', name: 'Equity Curve', icon: TrendingUp },
                { id: 'analysis', name: 'Analysis', icon: BarChart3 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'text-white bg-gray-700 border-b-2 border-orange-500' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Performance Metrics */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {renderMetricCard(
                          'Average Trade',
                          formatCurrency(mockMetrics.avgTrade),
                          'Per trade profit/loss',
                          <DollarSign className="w-4 h-4 text-green-400" />
                        )}
                        
                        {renderMetricCard(
                          'Best Trade',
                          formatCurrency(mockMetrics.bestTrade),
                          'Highest single trade',
                          <TrendingUp className="w-4 h-4 text-green-400" />,
                          'text-green-400'
                        )}
                        
                        {renderMetricCard(
                          'Worst Trade',
                          formatCurrency(mockMetrics.worstTrade),
                          'Worst single trade',
                          <TrendingDown className="w-4 h-4 text-red-400" />,
                          'text-red-400'
                        )}
                        
                        {renderMetricCard(
                          'Avg Win',
                          formatCurrency(mockMetrics.averageWin),
                          'Average winning trade',
                          <Target className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>

                    {/* Trade Distribution */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Trade Distribution</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-400 font-medium">Winning Trades</span>
                            <span className="text-green-400">{mockMetrics.winningTrades}</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(mockMetrics.winningTrades / mockMetrics.totalTrades) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-red-400 font-medium">Losing Trades</span>
                            <span className="text-red-400">{mockMetrics.losingTrades}</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${(mockMetrics.losingTrades / mockMetrics.totalTrades) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Insights */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Performance Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-blue-300 font-medium mb-1">Strategy Strengths</h4>
                            <ul className="text-blue-200 text-sm space-y-1">
                              <li>• High win rate of {mockMetrics.winRate.toFixed(1)}%</li>
                              <li>• Consistent profit factor above 1.5</li>
                              <li>• Well-managed drawdown levels</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-yellow-300 font-medium mb-1">Areas for Improvement</h4>
                            <ul className="text-yellow-200 text-sm space-y-1">
                              <li>• Consider position sizing optimization</li>
                              <li>• Monitor correlation with market</li>
                              <li>• Test across different market conditions</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trades Tab */}
              {activeTab === 'trades' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Trade History</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400">
                        {mockTrades.length} trades shown
                      </span>
                    </div>
                  </div>

                  {renderTradesList(mockTrades)}
                </div>
              )}

              {/* Equity Curve Tab */}
              {activeTab === 'chart' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Equity Curve</h3>
                  
                  <div className="h-96 bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Equity curve visualization would go here</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Integration with charting library needed
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Tab */}
              {activeTab === 'analysis' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Detailed Analysis</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Risk Metrics */}
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-white mb-4">Risk Analysis</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Value at Risk (95%)</span>
                          <span className="text-red-400">-$485</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Expected Shortfall</span>
                          <span className="text-red-400">-$625</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Volatility (Annualized)</span>
                          <span className="text-yellow-400">12.8%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Beta (vs SPY)</span>
                          <span className="text-blue-400">0.85</span>
                        </div>
                      </div>
                    </div>

                    {/* Trade Statistics */}
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-white mb-4">Trade Statistics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Avg Holding Period</span>
                          <span className="text-white">2.5 days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Longest Winner</span>
                          <span className="text-green-400">8 days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Longest Loser</span>
                          <span className="text-red-400">3 days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Max Consecutive Wins</span>
                          <span className="text-green-400">7</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Max Consecutive Losses</span>
                          <span className="text-red-400">4</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Last updated: {new Date().toLocaleString()}
          </div>
          
          <div className="flex gap-3">
            {onRunBacktest && (
              <button
                onClick={() => onRunBacktest('strategy_id', {})}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Running...' : 'Run New Backtest'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}