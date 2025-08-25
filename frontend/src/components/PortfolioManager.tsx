import React, { useState, useEffect } from 'react'
import { 
  Brain,
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  PieChart,
  Activity,
  Settings
} from 'lucide-react'
import PortfolioManagerService from '../services/portfolioManager.js'

interface PortfolioManagerProps {
  isOpen: boolean
  onClose: () => void
}

interface Portfolio {
  id: string
  name: string
  initialCapital: number
  currentCapital: number
  totalValue: number
  performance: {
    totalReturn: number
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
  }
  positions: any[]
}

export default function PortfolioManager({ isOpen, onClose }: PortfolioManagerProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null)
  const [portfolioManager, setPortfolioManager] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'performance' | 'risk'>('overview')

  useEffect(() => {
    if (isOpen) {
      const manager = PortfolioManagerService.getInstance()
      setPortfolioManager(manager)
      
      // Load portfolios
      const allPortfolios = manager.getAllPortfolios()
      setPortfolios(allPortfolios)
      
      if (allPortfolios.length > 0) {
        setSelectedPortfolio(allPortfolios[0].id)
      }
    }
  }, [isOpen])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const getCurrentPortfolio = () => {
    if (!selectedPortfolio) return null
    return portfolios.find(p => p.id === selectedPortfolio) || null
  }

  if (!isOpen) return null

  const currentPortfolio = getCurrentPortfolio()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Portfolio Manager</h2>
              <p className="text-sm text-gray-400">Manage your trading portfolios and positions</p>
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
          {/* Sidebar - Portfolio List */}
          <div className="w-80 p-6 border-r border-gray-700 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Portfolios</h3>
              <button className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm transition-colors">
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>
            
            <div className="space-y-3">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio.id}
                  onClick={() => setSelectedPortfolio(portfolio.id)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    selectedPortfolio === portfolio.id
                      ? 'bg-emerald-600/20 border-emerald-500/50'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium text-white mb-1">{portfolio.name}</div>
                  <div className="text-sm text-gray-300">
                    {formatCurrency(portfolio.totalValue)}
                  </div>
                  <div className={`text-xs ${
                    portfolio.performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatPercent(portfolio.performance.totalReturn)}
                  </div>
                </button>
              ))}
              
              {portfolios.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p>No portfolios created</p>
                  <p className="text-sm">Create your first portfolio to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {currentPortfolio ? (
              <>
                {/* Portfolio Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{currentPortfolio.name}</h2>
                      <div className="flex items-center gap-6 mt-2">
                        <div className="text-sm">
                          <span className="text-gray-400">Total Value: </span>
                          <span className="text-white font-medium">
                            {formatCurrency(currentPortfolio.totalValue)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Return: </span>
                          <span className={`font-medium ${
                            currentPortfolio.performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatPercent(currentPortfolio.performance.totalReturn)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Positions: </span>
                          <span className="text-white font-medium">{currentPortfolio.positions.length}</span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                  {[
                    { id: 'overview', name: 'Overview', icon: PieChart },
                    { id: 'positions', name: 'Positions', icon: Target },
                    { id: 'performance', name: 'Performance', icon: TrendingUp },
                    { id: 'risk', name: 'Risk', icon: AlertTriangle }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                        activeTab === tab.id 
                          ? 'text-white bg-gray-700 border-b-2 border-emerald-500' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.name}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Performance Cards */}
                      <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <DollarSign className="w-5 h-5 text-green-400" />
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(currentPortfolio.totalValue)}
                        </div>
                        <div className="text-sm text-gray-400">Total Value</div>
                      </div>

                      <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <Activity className="w-5 h-5 text-blue-400" />
                          <span className={`text-xs px-2 py-1 rounded ${
                            currentPortfolio.performance.totalReturn >= 0 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {currentPortfolio.performance.totalReturn >= 0 ? '↗' : '↘'}
                          </span>
                        </div>
                        <div className={`text-2xl font-bold ${
                          currentPortfolio.performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatPercent(currentPortfolio.performance.totalReturn)}
                        </div>
                        <div className="text-sm text-gray-400">Total Return</div>
                      </div>

                      <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <Target className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {currentPortfolio.performance.sharpeRatio.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">Sharpe Ratio</div>
                      </div>

                      <div className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-red-400">
                          {formatPercent(currentPortfolio.performance.maxDrawdown)}
                        </div>
                        <div className="text-sm text-gray-400">Max Drawdown</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'positions' && (
                    <div className="text-center py-12 text-gray-400">
                      <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Active Positions</h3>
                      <p className="text-sm">Your portfolio positions will appear here once you start trading</p>
                    </div>
                  )}

                  {activeTab === 'performance' && (
                    <div className="text-center py-12 text-gray-400">
                      <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Performance Analytics</h3>
                      <p className="text-sm">Detailed performance metrics and charts will be displayed here</p>
                    </div>
                  )}

                  {activeTab === 'risk' && (
                    <div className="text-center py-12 text-gray-400">
                      <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Risk Analysis</h3>
                      <p className="text-sm">Risk metrics and portfolio analysis will be shown here</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Portfolio Selected</h3>
                  <p className="text-sm">Select a portfolio from the sidebar to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            Portfolio Manager v1.0
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}