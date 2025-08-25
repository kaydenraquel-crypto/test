import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Save, 
  Play, 
  Settings,
  TrendingUp,
  Activity,
  Target,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  Info
} from 'lucide-react'
import StrategyEngine from '../services/strategyEngine.js'

interface StrategyBuilderProps {
  isOpen: boolean
  onClose: () => void
  onStrategyCreate?: (strategy: any) => void
  onBacktestRun?: (strategyId: string) => void
}

interface Condition {
  id: string
  indicator: string
  operator: string
  value: string | number
  weight: number
  active: boolean
}

interface Strategy {
  id?: string
  name: string
  description: string
  type: string
  entryConditions: Condition[]
  exitConditions: Condition[]
  riskManagement: {
    stopLoss: number
    takeProfit: number
    positionSize: number
    maxDrawdown: number
    maxPositions: number
  }
  parameters: Record<string, any>
}

const INDICATORS = [
  { id: 'rsi', name: 'RSI', description: 'Relative Strength Index' },
  { id: 'macd', name: 'MACD', description: 'MACD Line' },
  { id: 'sma20', name: 'SMA 20', description: '20-period Simple Moving Average' },
  { id: 'sma50', name: 'SMA 50', description: '50-period Simple Moving Average' },
  { id: 'ema12', name: 'EMA 12', description: '12-period Exponential Moving Average' },
  { id: 'ema26', name: 'EMA 26', description: '26-period Exponential Moving Average' },
  { id: 'bollinger', name: 'Bollinger Bands', description: 'Bollinger Band values' },
  { id: 'atr', name: 'ATR', description: 'Average True Range' },
  { id: 'adx', name: 'ADX', description: 'Average Directional Index' },
  { id: 'stochastic', name: 'Stochastic', description: 'Stochastic Oscillator' },
  { id: 'williams', name: 'Williams %R', description: 'Williams Percent Range' },
  { id: 'obv', name: 'OBV', description: 'On-Balance Volume' },
  { id: 'mfi', name: 'MFI', description: 'Money Flow Index' },
  { id: 'vwap', name: 'VWAP', description: 'Volume Weighted Average Price' }
]

const OPERATORS = [
  { id: '>', name: 'Greater than', symbol: '>' },
  { id: '<', name: 'Less than', symbol: '<' },
  { id: '>=', name: 'Greater than or equal', symbol: '≥' },
  { id: '<=', name: 'Less than or equal', symbol: '≤' },
  { id: '==', name: 'Equal to', symbol: '=' },
  { id: 'crossover', name: 'Crosses above', symbol: '↗' },
  { id: 'crossunder', name: 'Crosses below', symbol: '↘' },
  { id: 'between', name: 'Between', symbol: '⟷' }
]

const STRATEGY_TEMPLATES = [
  {
    name: 'Golden Cross',
    description: 'SMA 50 crosses above SMA 200 with RSI confirmation',
    type: 'trend_following',
    entryConditions: [
      { indicator: 'sma50', operator: 'crossover', value: 'sma200', weight: 2.0 },
      { indicator: 'rsi', operator: '>', value: 50, weight: 1.0 }
    ],
    exitConditions: [
      { indicator: 'sma50', operator: 'crossunder', value: 'sma200', weight: 2.0 }
    ]
  },
  {
    name: 'RSI Mean Reversion',
    description: 'Buy oversold, sell overbought conditions',
    type: 'mean_reversion',
    entryConditions: [
      { indicator: 'rsi', operator: '<', value: 30, weight: 2.0 },
      { indicator: 'obv', operator: '>', value: 'sma_obv_10', weight: 1.0 }
    ],
    exitConditions: [
      { indicator: 'rsi', operator: '>', value: 70, weight: 2.0 }
    ]
  },
  {
    name: 'Bollinger Breakout',
    description: 'Price breaks Bollinger Bands with volume confirmation',
    type: 'breakout',
    entryConditions: [
      { indicator: 'bollinger', operator: 'crossover', value: 'upper', weight: 2.0 },
      { indicator: 'volume', operator: '>', value: 'avg_volume_20', weight: 1.5 }
    ],
    exitConditions: [
      { indicator: 'bollinger', operator: 'crossunder', value: 'middle', weight: 1.0 }
    ]
  }
]

export default function StrategyBuilder({ 
  isOpen, 
  onClose, 
  onStrategyCreate, 
  onBacktestRun 
}: StrategyBuilderProps) {
  const [strategy, setStrategy] = useState<Strategy>({
    name: '',
    description: '',
    type: 'multi_signal',
    entryConditions: [],
    exitConditions: [],
    riskManagement: {
      stopLoss: 0.02,
      takeProfit: 0.04,
      positionSize: 0.1,
      maxDrawdown: 0.15,
      maxPositions: 5
    },
    parameters: {}
  })

  const [activeTab, setActiveTab] = useState<'entry' | 'exit' | 'risk' | 'test'>('entry')
  const [showTemplates, setShowTemplates] = useState(false)
  const [strategyEngine, setStrategyEngine] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      setStrategyEngine(StrategyEngine.getInstance())
    }
  }, [isOpen])

  const generateConditionId = () => {
    return 'condition_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  const addCondition = (type: 'entry' | 'exit') => {
    const newCondition: Condition = {
      id: generateConditionId(),
      indicator: 'rsi',
      operator: '>',
      value: 50,
      weight: 1.0,
      active: true
    }

    if (type === 'entry') {
      setStrategy(prev => ({
        ...prev,
        entryConditions: [...prev.entryConditions, newCondition]
      }))
    } else {
      setStrategy(prev => ({
        ...prev,
        exitConditions: [...prev.exitConditions, newCondition]
      }))
    }
  }

  const removeCondition = (type: 'entry' | 'exit', conditionId: string) => {
    if (type === 'entry') {
      setStrategy(prev => ({
        ...prev,
        entryConditions: prev.entryConditions.filter(c => c.id !== conditionId)
      }))
    } else {
      setStrategy(prev => ({
        ...prev,
        exitConditions: prev.exitConditions.filter(c => c.id !== conditionId)
      }))
    }
  }

  const updateCondition = (type: 'entry' | 'exit', conditionId: string, updates: Partial<Condition>) => {
    if (type === 'entry') {
      setStrategy(prev => ({
        ...prev,
        entryConditions: prev.entryConditions.map(c => 
          c.id === conditionId ? { ...c, ...updates } : c
        )
      }))
    } else {
      setStrategy(prev => ({
        ...prev,
        exitConditions: prev.exitConditions.map(c => 
          c.id === conditionId ? { ...c, ...updates } : c
        )
      }))
    }
  }

  const loadTemplate = (template: any) => {
    const entryConditions = template.entryConditions.map((cond: any) => ({
      ...cond,
      id: generateConditionId(),
      active: true
    }))

    const exitConditions = template.exitConditions.map((cond: any) => ({
      ...cond,
      id: generateConditionId(),
      active: true
    }))

    setStrategy(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      type: template.type,
      entryConditions,
      exitConditions
    }))

    setShowTemplates(false)
  }

  const saveStrategy = () => {
    if (!strategyEngine || !strategy.name.trim()) {
      alert('Please enter a strategy name')
      return
    }

    try {
      const createdStrategy = strategyEngine.createStrategy({
        name: strategy.name,
        description: strategy.description,
        type: strategy.type,
        entryConditions: strategy.entryConditions,
        exitConditions: strategy.exitConditions,
        riskManagement: strategy.riskManagement,
        parameters: strategy.parameters
      })

      if (onStrategyCreate) {
        onStrategyCreate(createdStrategy)
      }

      alert('Strategy saved successfully!')
      onClose()
    } catch (error) {
      console.error('Error saving strategy:', error)
      alert('Error saving strategy: ' + (error as Error).message)
    }
  }

  const testStrategy = () => {
    if (!strategyEngine || !strategy.name.trim()) {
      alert('Please save the strategy first')
      return
    }

    try {
      const createdStrategy = strategyEngine.createStrategy({
        name: strategy.name + '_test',
        description: strategy.description,
        type: strategy.type,
        entryConditions: strategy.entryConditions,
        exitConditions: strategy.exitConditions,
        riskManagement: strategy.riskManagement,
        parameters: strategy.parameters
      })

      if (onBacktestRun) {
        onBacktestRun(createdStrategy.id)
      }

      alert('Strategy test initiated!')
    } catch (error) {
      console.error('Error testing strategy:', error)
      alert('Error testing strategy: ' + (error as Error).message)
    }
  }

  const renderCondition = (condition: Condition, type: 'entry' | 'exit', index: number) => {
    return (
      <div key={condition.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">
              Condition {index + 1}
            </span>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={condition.active}
                onChange={(e) => updateCondition(type, condition.id, { active: e.target.checked })}
                className="w-3 h-3 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-gray-400">Active</span>
            </label>
          </div>
          <button
            onClick={() => removeCondition(type, condition.id)}
            className="text-red-400 hover:text-red-300 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Indicator */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Indicator</label>
            <select
              value={condition.indicator}
              onChange={(e) => updateCondition(type, condition.id, { indicator: e.target.value })}
              className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
            >
              {INDICATORS.map(indicator => (
                <option key={indicator.id} value={indicator.id}>
                  {indicator.name}
                </option>
              ))}
            </select>
          </div>

          {/* Operator */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Operator</label>
            <select
              value={condition.operator}
              onChange={(e) => updateCondition(type, condition.id, { operator: e.target.value })}
              className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
            >
              {OPERATORS.map(operator => (
                <option key={operator.id} value={operator.id}>
                  {operator.symbol} {operator.name}
                </option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Value</label>
            <input
              type="text"
              value={condition.value}
              onChange={(e) => {
                const value = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)
                updateCondition(type, condition.id, { value })
              }}
              placeholder="Value or another indicator"
              className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Weight</label>
            <input
              type="number"
              value={condition.weight}
              onChange={(e) => updateCondition(type, condition.id, { weight: Number(e.target.value) })}
              min="0.1"
              max="5.0"
              step="0.1"
              className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
            />
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-400">
          {INDICATORS.find(i => i.id === condition.indicator)?.description}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Strategy Builder</h2>
              <p className="text-sm text-gray-400">Create and customize trading strategies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Strategy Info */}
          <div className="w-1/3 p-6 border-r border-gray-700 overflow-y-auto">
            <div className="space-y-4">
              {/* Strategy Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Strategy Name *
                </label>
                <input
                  type="text"
                  value={strategy.name}
                  onChange={(e) => setStrategy(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter strategy name"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={strategy.description}
                  onChange={(e) => setStrategy(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your strategy"
                  rows={3}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Strategy Type
                </label>
                <select
                  value={strategy.type}
                  onChange={(e) => setStrategy(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="multi_signal">Multi-Signal</option>
                  <option value="trend_following">Trend Following</option>
                  <option value="mean_reversion">Mean Reversion</option>
                  <option value="breakout">Breakout</option>
                  <option value="momentum">Momentum</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Templates */}
              <div>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="w-full flex items-center justify-between p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
                >
                  <span>Load Template</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                </button>

                {showTemplates && (
                  <div className="mt-2 space-y-2">
                    {STRATEGY_TEMPLATES.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => loadTemplate(template)}
                        className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                      >
                        <div className="font-medium text-white">{template.name}</div>
                        <div className="text-xs text-gray-400 mt-1">{template.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Strategy Summary */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <h4 className="font-medium text-white mb-2">Strategy Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Entry Conditions:</span>
                    <span className="text-green-400">{strategy.entryConditions.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Exit Conditions:</span>
                    <span className="text-red-400">{strategy.exitConditions.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Risk Management:</span>
                    <span className="text-blue-400">Configured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Strategy Configuration */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-700">
              {[
                { id: 'entry', name: 'Entry Rules', icon: TrendingUp },
                { id: 'exit', name: 'Exit Rules', icon: Target },
                { id: 'risk', name: 'Risk Management', icon: AlertTriangle },
                { id: 'test', name: 'Test & Validate', icon: Activity }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'text-white bg-gray-700 border-b-2 border-indigo-500' 
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
              {/* Entry Rules Tab */}
              {activeTab === 'entry' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Entry Conditions</h3>
                      <p className="text-gray-400">Define when to enter a position</p>
                    </div>
                    <button
                      onClick={() => addCondition('entry')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Condition
                    </button>
                  </div>

                  <div className="space-y-4">
                    {strategy.entryConditions.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No entry conditions defined. Add a condition to get started.
                      </div>
                    ) : (
                      strategy.entryConditions.map((condition, index) => 
                        renderCondition(condition, 'entry', index)
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Exit Rules Tab */}
              {activeTab === 'exit' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Exit Conditions</h3>
                      <p className="text-gray-400">Define when to exit a position</p>
                    </div>
                    <button
                      onClick={() => addCondition('exit')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Condition
                    </button>
                  </div>

                  <div className="space-y-4">
                    {strategy.exitConditions.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No exit conditions defined. Add a condition to get started.
                      </div>
                    ) : (
                      strategy.exitConditions.map((condition, index) => 
                        renderCondition(condition, 'exit', index)
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Risk Management Tab */}
              {activeTab === 'risk' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Risk Management</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stop Loss (%)
                      </label>
                      <input
                        type="number"
                        value={strategy.riskManagement.stopLoss * 100}
                        onChange={(e) => setStrategy(prev => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            stopLoss: Number(e.target.value) / 100
                          }
                        }))}
                        min="0.1"
                        max="50"
                        step="0.1"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Take Profit (%)
                      </label>
                      <input
                        type="number"
                        value={strategy.riskManagement.takeProfit * 100}
                        onChange={(e) => setStrategy(prev => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            takeProfit: Number(e.target.value) / 100
                          }
                        }))}
                        min="0.1"
                        max="100"
                        step="0.1"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Position Size (%)
                      </label>
                      <input
                        type="number"
                        value={strategy.riskManagement.positionSize * 100}
                        onChange={(e) => setStrategy(prev => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            positionSize: Number(e.target.value) / 100
                          }
                        }))}
                        min="0.1"
                        max="100"
                        step="0.1"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Drawdown (%)
                      </label>
                      <input
                        type="number"
                        value={strategy.riskManagement.maxDrawdown * 100}
                        onChange={(e) => setStrategy(prev => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            maxDrawdown: Number(e.target.value) / 100
                          }
                        }))}
                        min="1"
                        max="50"
                        step="1"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Positions
                      </label>
                      <input
                        type="number"
                        value={strategy.riskManagement.maxPositions}
                        onChange={(e) => setStrategy(prev => ({
                          ...prev,
                          riskManagement: {
                            ...prev.riskManagement,
                            maxPositions: Number(e.target.value)
                          }
                        }))}
                        min="1"
                        max="20"
                        step="1"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-blue-300 font-medium mb-1">Risk Management Tips</p>
                        <ul className="text-blue-200 space-y-1">
                          <li>• Keep stop loss between 1-5% for most strategies</li>
                          <li>• Set take profit at least 2x your stop loss (Risk:Reward 1:2)</li>
                          <li>• Don't risk more than 1-2% per trade</li>
                          <li>• Limit maximum drawdown to 15% or less</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Test & Validate Tab */}
              {activeTab === 'test' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Test & Validate Strategy</h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Strategy Validation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          {strategy.name.trim() ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-gray-300">Strategy has a name</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {strategy.entryConditions.length > 0 ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-gray-300">Entry conditions defined</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {strategy.exitConditions.length > 0 ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-gray-300">Exit conditions defined</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {strategy.riskManagement.stopLoss > 0 && strategy.riskManagement.takeProfit > 0 ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <X className="w-4 h-4 text-red-400" />
                          )}
                          <span className="text-gray-300">Risk management configured</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={testStrategy}
                        className="flex items-center justify-center gap-2 p-4 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors"
                      >
                        <Play className="w-5 h-5" />
                        Run Backtest
                      </button>

                      <div className="p-4 bg-gray-700 rounded-lg">
                        <div className="text-sm text-gray-300">
                          <div className="font-medium mb-2">Risk:Reward Ratio</div>
                          <div className="text-2xl font-bold text-white">
                            1:{(strategy.riskManagement.takeProfit / strategy.riskManagement.stopLoss).toFixed(1)}
                          </div>
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
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            <button
              onClick={testStrategy}
              disabled={!strategy.name.trim() || strategy.entryConditions.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Test Strategy
            </button>

            <button
              onClick={saveStrategy}
              disabled={!strategy.name.trim() || strategy.entryConditions.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Strategy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}