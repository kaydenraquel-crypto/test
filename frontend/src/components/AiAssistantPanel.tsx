// Enhanced AI Financial Advisor Panel
import React, { useState, useEffect } from 'react'
import { API } from '../lib/api'
import { Brain, TrendingUp, AlertTriangle, Target, DollarSign, BarChart3, Zap } from 'lucide-react'

type Props = {
  style?: React.CSSProperties
  symbol: string
  market: 'crypto' | 'stocks'
  interval: number
  provider: string
  indicators: any
  signals: any[]
  news: any[]
}

interface AnalysisResponse {
  analysis: string
  technical_summary?: any
  hot_moments?: any[]
  trading_recommendation?: any
  market_outlook?: any
  confidence_score?: string
  error?: string
}

export default function AiAssistantPanel(props: Props) {
  const { style, symbol, market, interval, provider, indicators, signals, news } = props
  const [analysisMode, setAnalysisMode] = useState<'comprehensive' | 'custom'>('comprehensive')
  const [customPrompt, setCustomPrompt] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoUpdate, setAutoUpdate] = useState(false)

  // Auto-update when symbol changes
  useEffect(() => {
    if (autoUpdate && symbol) {
      runComprehensiveAnalysis()
    }
  }, [symbol, autoUpdate])

  async function runComprehensiveAnalysis() {
    setLoading(true)
    try {
      const summary = `Comprehensive financial analysis for ${symbol} (${market})`
      
      const res = await API.analyzeLLM({
        symbol,
        market,
        summary,
        indicators,
        signals,
        news,
      })
      
      setAnalysisResult({
        analysis: (res as any)?.analysis || 'Analysis completed successfully',
        technical_summary: (res as any)?.technical_summary,
        hot_moments: (res as any)?.hot_moments,
        trading_recommendation: (res as any)?.trading_recommendation,
        market_outlook: (res as any)?.market_outlook,
        confidence_score: (res as any)?.confidence_score,
        error: (res as any)?.error
      })
    } catch (e: any) {
      setAnalysisResult({
        analysis: `Analysis error: ${e?.message || e || 'Unknown error'}`,
        error: e?.message || e || 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  async function runCustomAnalysis() {
    if (!customPrompt.trim()) return
    
    setLoading(true)
    try {
      const summary = `${customPrompt}. Context: Symbol: ${symbol}, Market: ${market}, Interval: ${interval}m`
      
      const res = await API.analyzeLLM({
        symbol,
        market,
        summary,
        indicators,
        signals,
        news,
      })
      
      setAnalysisResult({
        analysis: (res as any)?.analysis || 'Analysis completed successfully',
        technical_summary: (res as any)?.technical_summary,
        hot_moments: (res as any)?.hot_moments,
        trading_recommendation: (res as any)?.trading_recommendation,
        market_outlook: (res as any)?.market_outlook,
        confidence_score: (res as any)?.confidence_score,
        error: (res as any)?.error
      })
    } catch (e: any) {
      setAnalysisResult({
        analysis: `Analysis error: ${e?.message || e || 'Unknown error'}`,
        error: e?.message || e || 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: string) => {
    const conf = parseFloat(confidence || '0')
    if (conf >= 70) return 'text-green-600'
    if (conf >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecommendationColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'buy': return 'text-green-600 bg-green-50 border-green-200'
      case 'sell': return 'text-red-600 bg-red-50 border-red-200'
      case 'watch': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow" style={style}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">AI Financial Advisor</h3>
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-1 text-sm">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
              className="rounded"
            />
            <span>Auto-update</span>
          </label>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setAnalysisMode('comprehensive')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              analysisMode === 'comprehensive'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Comprehensive Analysis
          </button>
          <button
            onClick={() => setAnalysisMode('custom')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              analysisMode === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Brain className="w-4 h-4 inline mr-1" />
            Custom Query
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-b border-gray-200">
        {analysisMode === 'comprehensive' ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Get a complete financial advisory analysis including market outlook, technical analysis, 
              risk assessment, trading strategy, and hot moment detection for {symbol}.
            </p>
            <button
              onClick={runComprehensiveAnalysis}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Generate Financial Analysis</span>
                </div>
              )}
            </button>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ask the AI Financial Advisor
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              placeholder="Ask about trading strategies, market conditions, risk analysis, entry/exit points, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={runCustomAnalysis}
              disabled={loading || !customPrompt.trim()}
              className={`mt-2 w-full py-2 px-4 rounded-md font-medium transition-colors ${
                loading || !customPrompt.trim()
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Analyzing...' : 'Ask AI Advisor'}
            </button>
          </div>
        )}
      </div>

      {/* Results Area */}
      {analysisResult && (
        <div className="max-h-96 overflow-y-auto">
          {/* Quick Summary Cards */}
          {analysisResult.trading_recommendation && (
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Trading Recommendation */}
                <div className={`p-3 rounded-lg border ${getRecommendationColor(analysisResult.trading_recommendation.action)}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="font-medium text-sm">Recommendation</span>
                  </div>
                  <div className="text-lg font-bold">
                    {analysisResult.trading_recommendation.action?.toUpperCase()}
                  </div>
                  <div className="text-xs">
                    {analysisResult.trading_recommendation.timeframe}
                  </div>
                </div>

                {/* Confidence Score */}
                {analysisResult.confidence_score && (
                  <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-2 mb-1">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-sm text-gray-700">Confidence</span>
                    </div>
                    <div className={`text-lg font-bold ${getConfidenceColor(analysisResult.confidence_score)}`}>
                      {analysisResult.confidence_score}
                    </div>
                  </div>
                )}

                {/* Risk Level */}
                {analysisResult.trading_recommendation.risk_level && (
                  <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-sm text-gray-700">Risk Level</span>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {analysisResult.trading_recommendation.risk_level?.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-600">
                      Size: {analysisResult.trading_recommendation.position_size}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hot Moments */}
          {analysisResult.hot_moments && analysisResult.hot_moments.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>Hot Moments Detected</span>
              </h4>
              <div className="space-y-2">
                {analysisResult.hot_moments.map((moment, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      moment.urgency === 'high'
                        ? 'border-red-200 bg-red-50'
                        : moment.urgency === 'medium'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {moment.alert_type?.toUpperCase()} - {moment.urgency?.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-600">
                        {Math.round(moment.probability * 100)}% probability
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{moment.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trading Levels */}
          {analysisResult.trading_recommendation && analysisResult.trading_recommendation.entry_price && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>Trading Levels</span>
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Entry:</span>
                  <div className="font-medium">${analysisResult.trading_recommendation.entry_price?.toFixed(2)}</div>
                </div>
                {analysisResult.trading_recommendation.stop_loss && (
                  <div>
                    <span className="text-gray-500">Stop Loss:</span>
                    <div className="font-medium text-red-600">
                      ${analysisResult.trading_recommendation.stop_loss?.toFixed(2)}
                    </div>
                  </div>
                )}
                {analysisResult.trading_recommendation.take_profit && (
                  <div>
                    <span className="text-gray-500">Take Profit:</span>
                    <div className="font-medium text-green-600">
                      ${analysisResult.trading_recommendation.take_profit?.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Analysis */}
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Detailed Analysis</h4>
            <div className="prose prose-sm max-w-none">
              <div 
                className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700"
                style={{ fontSize: '13px', lineHeight: '1.5' }}
              >
                {analysisResult.analysis}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {analysisResult?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg m-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 font-medium">Analysis Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{analysisResult.error}</p>
        </div>
      )}

      {/* Empty State */}
      {!analysisResult && !loading && (
        <div className="p-8 text-center text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Ready to Analyze {symbol}</p>
          <p className="text-sm">
            {analysisMode === 'comprehensive'
              ? 'Click "Generate Financial Analysis" for a complete market assessment'
              : 'Ask any question about trading strategies, market conditions, or risk analysis'}
          </p>
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          ⚠️ AI analysis is for educational purposes only. Not financial advice. Always do your own research.
        </p>
      </div>
    </div>
  )
}