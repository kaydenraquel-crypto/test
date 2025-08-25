// Alpha Vantage Advanced Technical Analysis Panel
import React, { useState, useEffect, useCallback } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  Zap, 
  Target, 
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  Volume2,
  HelpCircle
} from 'lucide-react'
import alphaVantageService from '../services/alphaVantageService'
import LightweightChart from './LightweightChartFixed'
import ChartControls from './ChartControls'
import { useRealTimeData } from '../hooks/useRealTimeData'

// Simple tooltip component
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  
  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-600 text-xs text-white rounded-lg shadow-lg z-50 max-w-xs">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  )
}

interface AlphaVantagePanelProps {
  symbol?: string
  onSymbolChange?: (symbol: string) => void
  style?: React.CSSProperties
}

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: string
}

interface TechnicalIndicators {
  rsi: { value: number; signal: 'oversold' | 'overbought' | 'neutral' }
  macd: { macd: number; signal: number; histogram: number; trend: 'bullish' | 'bearish' | 'neutral' }
  sma20: number
  sma50: number
  ema20: number
  bollinger: { upper: number; middle: number; lower: number; position: 'upper' | 'middle' | 'lower' }
  stoch: { k: number; d: number; signal: 'oversold' | 'overbought' | 'neutral' }
  adx: { value: number; trend: 'strong' | 'weak' | 'ranging' }
}

interface CompanyInfo {
  name: string
  sector: string
  marketCap: string
  peRatio: string
  dividendYield: string
  description: string
}

export default function AlphaVantagePanel({ 
  symbol: propSymbol = 'AAPL', 
  onSymbolChange,
  style 
}: AlphaVantagePanelProps) {
  const [symbol, setSymbol] = useState(propSymbol)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'indicators' | 'news' | 'fundamentals'>('overview')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])
  const [chartIndicators, setChartIndicators] = useState<any>(null)
  const [scalePriceOnly, setScalePriceOnly] = useState(true)  // Chart scaling option
  // New chart controls state
  const [selectedOverlays, setSelectedOverlays] = useState<string[]>(['sma_20', 'ema_20'])
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['rsi'])
  const [selectedSignals, setSelectedSignals] = useState<string[]>([])
  const { simulateRealTimeUpdates, isSimulating } = useRealTimeData()
  
  // Symbol data cache to avoid repeated API calls
  const [symbolCache, setSymbolCache] = useState<Map<string, { data: any; timestamp: number; expiresAt: number }>>(new Map())
  
  // Cache helper functions
  const getCachedData = useCallback((symbol: string) => {
    const cached = symbolCache.get(symbol)
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`📦 Using cached data for ${symbol}`)
      return cached.data
    }
    return null
  }, [])
  
  const setCachedData = useCallback((symbol: string, data: any) => {
    const now = Date.now()
    const cacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + (5 * 60 * 1000) // 5 minutes cache
    }
    
    setSymbolCache(prev => {
      const newCache = new Map(prev)
      newCache.set(symbol, cacheEntry)
      
      // Clean old entries (keep cache size manageable)
      if (newCache.size > 10) {
        const oldestKey = Array.from(newCache.keys())[0]
        if (oldestKey) {
          newCache.delete(oldestKey)
        }
      }
      
      return newCache
    })
    
    console.log(`💾 Cached data for ${symbol} (expires in 5 min)`)
  }, [])

  // Helper function to calculate indicators from daily data
  const calculateIndicatorsFromDaily = async (dailyData: any, indicator: string, period?: number) => {
    if (!dailyData || !dailyData.formatted || dailyData.formatted.length === 0) {
      return { formatted: [] }
    }

    const prices = dailyData.formatted
    const requiredPeriod = period || 14
    
    // Ensure we have enough data points for the calculation
    if (prices.length < requiredPeriod + 5) {
      console.warn(`Insufficient data for ${indicator} calculation. Need at least ${requiredPeriod + 5} data points, got ${prices.length}`)
      return { formatted: [] }
    }
    
    // Validate that all price data has required fields
    const isValidData = prices.every((price: any, index: number) => {
      const hasPrice = price && typeof price.close === 'number'
      const hasTimestamp = price && (price.date || price.timestamp)
      if (!hasPrice || !hasTimestamp) {
        console.warn(`Invalid price data at index ${index}:`, price)
        return false
      }
      return true
    })
    
    if (!isValidData) {
      console.warn(`Invalid price data format for ${indicator} calculation`)
      return { formatted: [] }
    }
    
    let result: any[] = []

    switch (indicator) {
      case 'RSI':
        // Simple RSI calculation with improved handling
        const rsiPeriod = period || 14
        for (let i = rsiPeriod; i < prices.length; i++) {
          let gains = 0, losses = 0, validChanges = 0
          
          for (let j = i - rsiPeriod + 1; j <= i; j++) {
            if (j > 0 && prices[j] && prices[j-1] && 
                typeof prices[j].close === 'number' && typeof prices[j-1].close === 'number') {
              const change = prices[j].close - prices[j-1].close
              if (change > 0) gains += change
              else if (change < 0) losses -= change
              validChanges++
            }
          }
          
          if (validChanges > 0) {
            const avgGain = gains / rsiPeriod
            const avgLoss = losses / rsiPeriod
            const rs = avgGain / (avgLoss || 0.001) // Avoid division by zero
            const rsi = 100 - (100 / (1 + rs))
            
            result.push({
              timestamp: prices[i].date || prices[i].timestamp,
              RSI: Math.round(Math.max(0, Math.min(100, rsi)) * 100) / 100 // Clamp between 0-100
            })
          }
        }
        break

      case 'SMA':
        for (let i = (period || 20) - 1; i < prices.length; i++) {
          let sum = 0
          for (let j = i - (period || 20) + 1; j <= i; j++) {
            sum += prices[j].close
          }
          result.push({
            timestamp: prices[i].date || prices[i].timestamp,
            SMA: Math.round((sum / (period || 20)) * 100) / 100
          })
        }
        break

      case 'EMA':
        const multiplier = 2 / ((period || 20) + 1)
        let ema = prices.slice(0, period || 20).reduce((sum: number, p: any) => sum + p.close, 0) / (period || 20)
        
        const startIndex = (period || 20) - 1
        if (startIndex < prices.length && prices[startIndex]) {
          result.push({
            timestamp: prices[startIndex].date || prices[startIndex].timestamp,
            EMA: Math.round(ema * 100) / 100
          })
        }

        for (let i = period || 20; i < prices.length; i++) {
          ema = (prices[i].close * multiplier) + (ema * (1 - multiplier))
          result.push({
            timestamp: prices[i].date || prices[i].timestamp,
            EMA: Math.round(ema * 100) / 100
          })
        }
        break

      case 'MACD':
        // Simplified MACD using 12 and 26 day EMAs
        const fast = 12, slow = 26, signal = 9
        const fastMultiplier = 2 / (fast + 1)
        const slowMultiplier = 2 / (slow + 1)
        
        let fastEMA = prices.slice(0, fast).reduce((sum: number, p: any) => sum + p.close, 0) / fast
        let slowEMA = prices.slice(0, slow).reduce((sum: number, p: any) => sum + p.close, 0) / slow
        
        for (let i = slow; i < prices.length; i++) {
          fastEMA = (prices[i].close * fastMultiplier) + (fastEMA * (1 - fastMultiplier))
          slowEMA = (prices[i].close * slowMultiplier) + (slowEMA * (1 - slowMultiplier))
          
          const macd = fastEMA - slowEMA
          result.push({
            timestamp: prices[i].date || prices[i].timestamp,
            MACD: Math.round(macd * 100) / 100,
            MACD_Signal: Math.round(macd * 100) / 100, // Simplified
            MACD_Hist: 0
          })
        }
        break

      case 'BBANDS':
        const sma20 = []
        // First calculate SMA
        for (let i = 19; i < prices.length; i++) {
          let sum = 0
          for (let j = i - 19; j <= i; j++) {
            sum += prices[j].close
          }
          sma20.push(sum / 20)
        }

        // Then calculate Bollinger Bands with proper error checking
        for (let i = 0; i < sma20.length; i++) {
          const priceIndex = i + 19
          
          if (priceIndex < prices.length && sma20[i] !== undefined) {
            let variance = 0
            let validPoints = 0
            
            for (let j = priceIndex - 19; j <= priceIndex; j++) {
              if (prices[j] && typeof prices[j].close === 'number' && sma20[i] !== undefined) {
                const price = prices[j]
                const smaValue = sma20[i] as number
                variance += Math.pow(price.close - smaValue, 2)
                validPoints++
              }
            }
            
            if (validPoints > 0) {
              const stdDev = Math.sqrt(variance / validPoints)
              const smaValue = sma20[i] as number
              
              result.push({
                timestamp: prices[priceIndex].date || prices[priceIndex].timestamp,
                'Real Upper Band': Math.round((smaValue + (stdDev * 2)) * 100) / 100,
                'Real Middle Band': Math.round(smaValue * 100) / 100,
                'Real Lower Band': Math.round((smaValue - (stdDev * 2)) * 100) / 100
              })
            }
          }
        }
        break

      case 'STOCH':
        // Stochastic Oscillator (%K and %D) with better error handling
        const stochPeriod = period || 14

        for (let i = stochPeriod - 1; i < prices.length; i++) {
          // Find highest high and lowest low in period
          let highestHigh = -Infinity
          let lowestLow = Infinity
          let validPrices = 0
          
          for (let j = i - stochPeriod + 1; j <= i; j++) {
            if (prices[j] && typeof prices[j].high === 'number' && typeof prices[j].low === 'number') {
              highestHigh = Math.max(highestHigh, prices[j].high)
              lowestLow = Math.min(lowestLow, prices[j].low)
              validPrices++
            }
          }
          
          if (validPrices > 0 && highestHigh > lowestLow && prices[i] && 
              typeof prices[i].close === 'number') {
            // Calculate %K
            const k = ((prices[i].close - lowestLow) / (highestHigh - lowestLow)) * 100
            const clampedK = Math.max(0, Math.min(100, k))
            
            result.push({
              timestamp: prices[i].date || prices[i].timestamp,
              'K': Math.round(clampedK * 100) / 100,
              'D': Math.round(clampedK * 100) / 100 // Simplified - should be SMA of %K
            })
          }
        }
        break

      case 'ADX':
        // Average Directional Index (simplified version) with error handling
        const adxPeriod = period || 14
        
        for (let i = adxPeriod; i < prices.length; i++) {
          let totalTR = 0
          let totalPDM = 0
          let totalNDM = 0
          let validPeriods = 0
          
          // Calculate TR (True Range), +DM, -DM for period
          for (let j = i - adxPeriod + 1; j <= i; j++) {
            if (j > 0 && prices[j] && prices[j-1] && 
                typeof prices[j].high === 'number' && typeof prices[j].low === 'number' &&
                typeof prices[j].close === 'number' && typeof prices[j-1].close === 'number') {
              
              const prevHigh = prices[j-1].high
              const prevLow = prices[j-1].low
              const prevClose = prices[j-1].close
              
              // True Range
              const tr1 = prices[j].high - prices[j].low
              const tr2 = Math.abs(prices[j].high - prevClose)
              const tr3 = Math.abs(prices[j].low - prevClose)
              const tr = Math.max(tr1, tr2, tr3)
              totalTR += tr
              
              // Directional Movement
              const highMove = prices[j].high - prevHigh
              const lowMove = prevLow - prices[j].low
              const pdm = (highMove > lowMove && highMove > 0) ? highMove : 0
              const ndm = (lowMove > highMove && lowMove > 0) ? lowMove : 0
              totalPDM += pdm
              totalNDM += ndm
              validPeriods++
            }
          }
          
          if (validPeriods > 0 && totalTR > 0) {
            // Calculate DI+ and DI-
            const diPlus = (totalPDM / totalTR) * 100
            const diMinus = (totalNDM / totalTR) * 100
            
            // Calculate ADX (simplified)
            const diSum = diPlus + diMinus
            if (diSum > 0) {
              const dx = Math.abs(diPlus - diMinus) / diSum * 100
              const adx = Math.max(0, Math.min(100, dx)) // Clamp ADX between 0-100
              
              result.push({
                timestamp: prices[i].date || prices[i].timestamp,
                'ADX': Math.round(adx * 100) / 100
              })
            }
          }
        }
        break
    }

    return { formatted: result }
  }

  // Load comprehensive data for symbol
  const loadSymbolData = useCallback(async (targetSymbol: string) => {
    if (!targetSymbol) return
    
    setLoading(true)
    setError('')
    setLoadingStage('Fetching market data...')
    
    try {
      // Check cache first
      const cachedData = getCachedData(targetSymbol)
      let dailyData
      
      if (cachedData) {
        setLoadingStage('Using cached data...')
        dailyData = cachedData
      } else {
        setLoadingStage('Downloading price data...')
        // Get daily price data from API
        dailyData = await alphaVantageService.getDailyData(targetSymbol, 'compact')
        
        // Cache the data
        if (dailyData && dailyData.formatted && dailyData.formatted.length > 0) {
          setCachedData(targetSymbol, dailyData)
        }
      }
      
      if (dailyData.formatted && dailyData.formatted.length > 0) {
        const latestData = dailyData.formatted[dailyData.formatted.length - 1]
        const previousData = dailyData.formatted[dailyData.formatted.length - 2] || latestData
        
        const change = latestData.close - previousData.close
        const changePercent = (change / previousData.close) * 100
        
        setMarketData({
          symbol: targetSymbol,
          price: latestData.close,
          change,
          changePercent,
          volume: latestData.volume,
          timestamp: latestData.timestamp
        })

        // Format data for LightweightChart component
        const formattedChartData = dailyData.formatted.map((item: any) => ({
          time: new Date(item.date || item.timestamp).getTime() / 1000, // Convert to Unix timestamp in seconds
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        })).sort((a, b) => a.time - b.time)

        setChartData(formattedChartData)
      }
      
      // Calculate all indicators client-side from daily data to save API calls
      // This uses 0 additional API calls since we already have the daily data
      setLoadingStage('Calculating RSI momentum indicators...')
      const rsiData = { status: 'fulfilled', value: await calculateIndicatorsFromDaily(dailyData, 'RSI', 14) }
      
      setLoadingStage('Calculating MACD trend indicators...')
      const macdData = { status: 'fulfilled', value: await calculateIndicatorsFromDaily(dailyData, 'MACD') }
      
      setLoadingStage('Calculating moving averages...')
      const sma20Data = { status: 'fulfilled', value: await calculateIndicatorsFromDaily(dailyData, 'SMA', 20) }
      const sma50Data = { status: 'fulfilled', value: await calculateIndicatorsFromDaily(dailyData, 'SMA', 50) }
      const ema20Data = { status: 'fulfilled', value: await calculateIndicatorsFromDaily(dailyData, 'EMA', 20) }
      
      setLoadingStage('Calculating Bollinger Bands...')
      const bbandsData = { status: 'fulfilled', value: await calculateIndicatorsFromDaily(dailyData, 'BBANDS', 20) }
      
      setLoadingStage('Calculating Stochastic oscillator...')
      const stochData = { status: 'fulfilled', value: await calculateIndicatorsFromDaily(dailyData, 'STOCH', 14) }
      
      setLoadingStage('Calculating ADX trend strength...')
      const adxData = { status: 'fulfilled', value: await calculateIndicatorsFromDaily(dailyData, 'ADX', 14) }
      
      // Process indicators
      const processedIndicators: TechnicalIndicators = {
        rsi: { value: 0, signal: 'neutral' },
        macd: { macd: 0, signal: 0, histogram: 0, trend: 'neutral' },
        sma20: 0,
        sma50: 0,
        ema20: 0,
        bollinger: { upper: 0, middle: 0, lower: 0, position: 'middle' },
        stoch: { k: 0, d: 0, signal: 'neutral' },
        adx: { value: 0, trend: 'ranging' }
      }
      
      // RSI
      if (rsiData.status === 'fulfilled' && rsiData.value.formatted.length > 0) {
        const latestRSI = rsiData.value.formatted[rsiData.value.formatted.length - 1].RSI
        processedIndicators.rsi = {
          value: latestRSI,
          signal: latestRSI > 70 ? 'overbought' : latestRSI < 30 ? 'oversold' : 'neutral'
        }
      }
      
      // MACD
      if (macdData.status === 'fulfilled' && macdData.value.formatted.length > 0) {
        const latestMACD = macdData.value.formatted[macdData.value.formatted.length - 1]
        processedIndicators.macd = {
          macd: latestMACD.MACD || 0,
          signal: latestMACD.MACD_Signal || 0,
          histogram: latestMACD.MACD_Hist || 0,
          trend: (latestMACD.MACD || 0) > (latestMACD.MACD_Signal || 0) ? 'bullish' : 'bearish'
        }
      }
      
      // SMAs
      if (sma20Data.status === 'fulfilled' && sma20Data.value.formatted.length > 0) {
        processedIndicators.sma20 = sma20Data.value.formatted[sma20Data.value.formatted.length - 1].SMA
      }
      
      if (sma50Data.status === 'fulfilled' && sma50Data.value.formatted.length > 0) {
        processedIndicators.sma50 = sma50Data.value.formatted[sma50Data.value.formatted.length - 1].SMA
      }
      
      // EMA
      if (ema20Data.status === 'fulfilled' && ema20Data.value.formatted.length > 0) {
        processedIndicators.ema20 = ema20Data.value.formatted[ema20Data.value.formatted.length - 1].EMA
      }
      
      // Stochastic
      if (stochData.status === 'fulfilled' && stochData.value.formatted.length > 0) {
        const latestStoch = stochData.value.formatted[stochData.value.formatted.length - 1]
        const k = latestStoch.K || 0
        processedIndicators.stoch = {
          k: k,
          d: latestStoch.D || 0,
          signal: k > 80 ? 'overbought' : k < 20 ? 'oversold' : 'neutral'
        }
      }
      
      // ADX
      if (adxData.status === 'fulfilled' && adxData.value.formatted.length > 0) {
        const latestADX = adxData.value.formatted[adxData.value.formatted.length - 1].ADX
        processedIndicators.adx = {
          value: latestADX,
          trend: latestADX > 25 ? 'strong' : latestADX > 20 ? 'ranging' : 'weak'
        }
      }
      
      setIndicators(processedIndicators)
      
      // Prepare chart indicators data for the LightweightChart component
      const preparedChartIndicators = {
        sma: sma20Data.status === 'fulfilled' && sma20Data.value.formatted.length > 0 
          ? sma20Data.value.formatted.map((item: any) => item.SMA) 
          : null,
        ema: ema20Data.status === 'fulfilled' && ema20Data.value.formatted.length > 0
          ? ema20Data.value.formatted.map((item: any) => item.EMA)
          : null,
        rsi: rsiData.status === 'fulfilled' && rsiData.value.formatted.length > 0
          ? rsiData.value.formatted.map((item: any) => item.RSI)
          : null,
        macd_hist: macdData.status === 'fulfilled' && macdData.value.formatted.length > 0
          ? macdData.value.formatted.map((item: any) => item.MACD_Hist || 0)
          : null,
        macd_signal: macdData.status === 'fulfilled' && macdData.value.formatted.length > 0
          ? macdData.value.formatted.map((item: any) => item.MACD_Signal || 0)
          : null,
        bb_high: bbandsData.status === 'fulfilled' && bbandsData.value.formatted.length > 0
          ? bbandsData.value.formatted.map((item: any) => item['Real Upper Band'])
          : null,
        bb_low: bbandsData.status === 'fulfilled' && bbandsData.value.formatted.length > 0
          ? bbandsData.value.formatted.map((item: any) => item['Real Lower Band'])
          : null
      }

      setChartIndicators(preparedChartIndicators)
      setLastUpdate(new Date())
      
      // Check if we're in demo mode
      setDemoMode(alphaVantageService.isDemoMode())
      
      setLoadingStage('Processing technical indicators...')
      
      // Load company overview (for fundamentals tab)
      try {
        setLoadingStage('Loading company overview...')
        const overview = await alphaVantageService.getCompanyOverview(targetSymbol)
        if (overview.Symbol) {
          setCompanyInfo({
            name: overview.Name || 'N/A',
            sector: overview.Sector || 'N/A',
            marketCap: overview.MarketCapitalization || 'N/A',
            peRatio: overview.PERatio || 'N/A',
            dividendYield: overview.DividendYield || 'N/A',
            description: overview.Description || 'No description available.'
          })
        }
      } catch (err) {
        console.warn('Could not load company overview:', err)
      }
      
      // Load news sentiment
      try {
        setLoadingStage('Fetching latest news sentiment...')
        const newsData = await (alphaVantageService as any).getNewsSentiment(null, null, null, null, null, 10)
        if (newsData.feed) {
          setNews(newsData.feed.slice(0, 5)) // Show top 5 news items
        }
      } catch (err) {
        console.warn('Could not load news sentiment:', err)
      }
      
      setLoadingStage('Finalizing data presentation...')
      
    } catch (err) {
      setError(`Failed to load data for ${targetSymbol}: ${err instanceof Error ? err.message : String(err)}`)
      console.error('Alpha Vantage error:', err)
      
      // Check if we're now in demo mode due to rate limits
      setDemoMode(alphaVantageService.isDemoMode())
    } finally {
      setLoading(false)
    }
  }, [])

  // Search for symbols
  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    
    try {
      const results = await alphaVantageService.symbolSearch(query)
      if (results.bestMatches) {
        setSearchResults(results.bestMatches.slice(0, 10))
      }
    } catch (err) {
      console.warn('Symbol search failed:', err)
    }
  }

  // Handle symbol selection
  const handleSymbolSelect = (newSymbol: string) => {
    setSymbol(newSymbol)
    setSearchQuery('')
    setSearchResults([])
    if (onSymbolChange) {
      onSymbolChange(newSymbol)
    }
    loadSymbolData(newSymbol)
  }

  // Initial load
  useEffect(() => {
    loadSymbolData(symbol)
  }, [symbol, loadSymbolData])

  // Update search results
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery)
      }
    }, 300)
    
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': case 'oversold': return '#10b981'
      case 'bearish': case 'overbought': return '#ef4444'
      case 'strong': return '#3b82f6'
      case 'weak': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'bullish': case 'oversold': return <TrendingUp className="w-4 h-4" />
      case 'bearish': case 'overbought': return <TrendingDown className="w-4 h-4" />
      case 'strong': return <Zap className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '20px',
      color: 'white',
      maxWidth: '1200px',
      ...style
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-green-400">
            <BarChart3 className="w-6 h-6" />
            <h2 className="text-xl font-bold">Alpha Vantage Pro</h2>
          </div>
          {lastUpdate && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Updated {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => loadSymbolData(symbol)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="mb-4 p-3 bg-amber-900 border border-amber-700 rounded-lg">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Demo Mode Active</span>
          </div>
          <p className="text-sm text-amber-200 mt-1">
            API rate limit reached (25 requests/day). Using sample data for demonstration.
          </p>
        </div>
      )}

      {/* Symbol Search */}
      <div className="mb-6 relative">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search symbols (e.g., AAPL, TSLA, GOOGL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <div className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-gray-300">
            Current: {symbol}
          </div>
        </div>
        
        {searchResults.length > 0 && (
          <div className="absolute top-12 left-0 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                onClick={() => handleSymbolSelect(result['1. symbol'])}
                className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0"
              >
                <div className="font-medium text-white">{result['1. symbol']}</div>
                <div className="text-sm text-gray-400 truncate">{result['2. name']}</div>
                <div className="text-xs text-gray-500">{result['3. type']} • {result['4. region']}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500 rounded-lg mb-6 text-red-200">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-800 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'charts', label: 'Interactive Charts', icon: TrendingUp },
          { key: 'indicators', label: 'Technical Analysis', icon: Activity },
          { key: 'fundamentals', label: 'Fundamentals', icon: DollarSign },
          { key: 'news', label: 'News & Sentiment', icon: Volume2 }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="text-lg">Loading Alpha Vantage Data...</span>
            </div>
            {loadingStage && (
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>{loadingStage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Professional Trading Chart */}
              {chartData.length > 0 && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Live Chart - {symbol}
                    </h3>
                    <div className="text-xs text-gray-400">
                      TradingView Lightweight Charts
                    </div>
                  </div>
                  {/* Chart Controls */}
                  <div className="mb-4">
                    <ChartControls
                      selectedOverlays={selectedOverlays}
                      selectedIndicators={selectedIndicators}
                      selectedSignals={selectedSignals}
                      scalePriceOnly={scalePriceOnly}
                      onOverlaysChange={setSelectedOverlays}
                      onIndicatorsChange={setSelectedIndicators}
                      onSignalsChange={setSelectedSignals}
                      onScalePriceOnlyChange={setScalePriceOnly}
                    />
                  </div>
                  <LightweightChart
                    data={chartData}
                    symbol={symbol}
                    height={400}
                    width="100%"
                    indicators={chartIndicators}
                    scalePriceOnly={scalePriceOnly}
                    onRealTimeUpdate={(updateFn) => simulateRealTimeUpdates(chartData, symbol, updateFn)}
                  />
                </div>
              )}

              {/* Current Price */}
              {marketData && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Price</div>
                    <div className="text-2xl font-bold">${marketData.price.toFixed(2)}</div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Change</div>
                    <div className={`text-xl font-bold flex items-center gap-2 ${
                      marketData.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {marketData.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      ${Math.abs(marketData.change).toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Change %</div>
                    <div className={`text-xl font-bold ${
                      marketData.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Volume</div>
                    <div className="text-xl font-bold">{marketData.volume.toLocaleString()}</div>
                  </div>
                </div>
              )}

              {/* Quick Indicators Summary */}
              {indicators && (
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Quick Technical Summary</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getSignalColor(indicators.rsi.signal) + '20' }}
                      >
                        {getSignalIcon(indicators.rsi.signal)}
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">RSI</div>
                        <div className="font-semibold" style={{ color: getSignalColor(indicators.rsi.signal) }}>
                          {indicators.rsi.value.toFixed(1)} • {indicators.rsi.signal}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getSignalColor(indicators.macd.trend) + '20' }}
                      >
                        {getSignalIcon(indicators.macd.trend)}
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">MACD</div>
                        <div className="font-semibold" style={{ color: getSignalColor(indicators.macd.trend) }}>
                          {indicators.macd.trend}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">SMA20</div>
                        <div className="font-semibold text-blue-400">
                          ${indicators.sma20.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">SMA50</div>
                        <div className="font-semibold text-purple-400">
                          ${indicators.sma50.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Charts Tab */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              {/* Main Trading Chart */}
              {chartData.length > 0 ? (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        {symbol} - Advanced Chart
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Professional candlestick chart with volume and technical indicators
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <div>TradingView Lightweight Charts</div>
                      <div className="flex items-center gap-2 justify-end">
                        <span>{chartData.length} data points</span>
                        {isSimulating && (
                          <div className="flex items-center gap-1 text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs">Live Updates</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Chart Controls */}
                  <div className="mb-4">
                    <ChartControls
                      selectedOverlays={selectedOverlays}
                      selectedIndicators={selectedIndicators}
                      selectedSignals={selectedSignals}
                      scalePriceOnly={scalePriceOnly}
                      onOverlaysChange={setSelectedOverlays}
                      onIndicatorsChange={setSelectedIndicators}
                      onSignalsChange={setSelectedSignals}
                      onScalePriceOnlyChange={setScalePriceOnly}
                    />
                  </div>
                  <LightweightChart
                    data={chartData}
                    symbol={symbol}
                    height={500}
                    width="100%"
                    indicators={chartIndicators}
                    scalePriceOnly={scalePriceOnly}
                    onRealTimeUpdate={(updateFn) => simulateRealTimeUpdates(chartData, symbol, updateFn)}
                  />
                </div>
              ) : (
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                  <div className="text-gray-400 mb-4">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-lg">No chart data available</p>
                    <p className="text-sm">Try refreshing or selecting a different symbol</p>
                  </div>
                </div>
              )}

              {/* Chart Features Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-green-400 mb-2">
                    <Activity className="w-8 h-8 mx-auto" />
                  </div>
                  <h4 className="font-semibold mb-1">Technical Indicators</h4>
                  <p className="text-sm text-gray-400">
                    SMA, EMA, RSI, MACD, Bollinger Bands overlaid on price action
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-blue-400 mb-2">
                    <Volume2 className="w-8 h-8 mx-auto" />
                  </div>
                  <h4 className="font-semibold mb-1">Volume Analysis</h4>
                  <p className="text-sm text-gray-400">
                    Volume bars synchronized with price movements for better analysis
                  </p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-purple-400 mb-2">
                    <Target className="w-8 h-8 mx-auto" />
                  </div>
                  <h4 className="font-semibold mb-1">Interactive Features</h4>
                  <p className="text-sm text-gray-400">
                    Hover for OHLC data, zoom, pan, and professional chart interactions
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Technical Analysis Tab */}
          {activeTab === 'indicators' && indicators && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Momentum Indicators */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Momentum Indicators
                  </h3>
                  
                  <div className="space-y-4">
                    {/* RSI */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-400">RSI (14)</span>
                          <Tooltip text="Relative Strength Index (14-day): Momentum oscillator that measures price change velocity. Values above 70 indicate overbought conditions, below 30 indicate oversold conditions.">
                            <HelpCircle className="w-3 h-3 text-gray-500 cursor-help" />
                          </Tooltip>
                        </div>
                        <span className="font-semibold">{indicators.rsi.value.toFixed(2)}</span>
                      </div>
                      <div className="relative">
                        <div className="h-2 bg-gray-700 rounded-full">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${indicators.rsi.value}%`,
                              backgroundColor: getSignalColor(indicators.rsi.signal)
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Oversold (30)</span>
                          <span>Neutral (50)</span>
                          <span>Overbought (70)</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm" style={{ color: getSignalColor(indicators.rsi.signal) }}>
                        Signal: {indicators.rsi.signal.toUpperCase()}
                      </div>
                    </div>

                    {/* MACD */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-400">MACD</span>
                          <Tooltip text="Moving Average Convergence Divergence: Shows relationship between two moving averages. When MACD line is above signal line, it indicates bullish momentum; below indicates bearish momentum.">
                            <HelpCircle className="w-3 h-3 text-gray-500 cursor-help" />
                          </Tooltip>
                        </div>
                        <span 
                          className="font-semibold"
                          style={{ color: getSignalColor(indicators.macd.trend) }}
                        >
                          {indicators.macd.trend.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>MACD: {indicators.macd.macd.toFixed(4)}</div>
                        <div>Signal: {indicators.macd.signal.toFixed(4)}</div>
                        <div>Histogram: {indicators.macd.histogram.toFixed(4)}</div>
                      </div>
                    </div>

                    {/* Stochastic */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-400">Stochastic</span>
                          <Tooltip text="Stochastic Oscillator: Momentum indicator comparing closing price to price range over time. Values above 80 suggest overbought conditions, below 20 suggest oversold conditions.">
                            <HelpCircle className="w-3 h-3 text-gray-500 cursor-help" />
                          </Tooltip>
                        </div>
                        <span 
                          className="font-semibold"
                          style={{ color: getSignalColor(indicators.stoch.signal) }}
                        >
                          {indicators.stoch.signal.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>%K: {indicators.stoch.k.toFixed(2)}</div>
                        <div>%D: {indicators.stoch.d.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trend Indicators */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Trend Indicators
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Moving Averages */}
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Moving Averages</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-blue-400">SMA 20</span>
                          <span className="font-semibold">${indicators.sma20.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-400">SMA 50</span>
                          <span className="font-semibold">${indicators.sma50.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400">EMA 20</span>
                          <span className="font-semibold">${indicators.ema20.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {marketData && indicators.sma20 > indicators.sma50 && marketData.price > indicators.sma20 ? (
                          <span className="text-green-400">• Bullish alignment (Price &gt; SMA20 &gt; SMA50)</span>
                        ) : marketData && indicators.sma20 < indicators.sma50 && marketData.price < indicators.sma20 ? (
                          <span className="text-red-400">• Bearish alignment (Price &lt; SMA20 &lt; SMA50)</span>
                        ) : (
                          <span className="text-yellow-400">• Mixed signals</span>
                        )}
                      </div>
                    </div>

                    {/* ADX */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-400">ADX (Trend Strength)</span>
                          <Tooltip text="Average Directional Index: Measures trend strength regardless of direction. Values above 25 indicate strong trend, above 20 moderate trend, below 20 weak/sideways trend.">
                            <HelpCircle className="w-3 h-3 text-gray-500 cursor-help" />
                          </Tooltip>
                        </div>
                        <span 
                          className="font-semibold"
                          style={{ color: getSignalColor(indicators.adx.trend) }}
                        >
                          {indicators.adx.value.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: getSignalColor(indicators.adx.trend) }}>
                        {indicators.adx.trend.toUpperCase()} TREND
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {indicators.adx.value > 25 ? 'Strong directional movement' : 'Weak trend or consolidation'}
                      </div>
                    </div>

                    {/* Bollinger Bands */}
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Bollinger Bands</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-red-400">Upper</span>
                          <span>${indicators.bollinger.upper.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-400">Middle</span>
                          <span>${indicators.bollinger.middle.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-400">Lower</span>
                          <span>${indicators.bollinger.lower.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fundamentals Tab */}
          {activeTab === 'fundamentals' && (
            <div className="space-y-6">
              {companyInfo ? (
                <>
                  <div className="bg-gray-800 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">{companyInfo.name}</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400">Sector</div>
                        <div className="font-semibold">{companyInfo.sector}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Market Cap</div>
                        <div className="font-semibold">{companyInfo.marketCap}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">P/E Ratio</div>
                        <div className="font-semibold">{companyInfo.peRatio}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Dividend Yield</div>
                        <div className="font-semibold">{companyInfo.dividendYield}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Description</div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {companyInfo.description.length > 500 
                          ? companyInfo.description.substring(0, 500) + '...'
                          : companyInfo.description
                        }
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <div className="text-gray-400">No fundamental data available for this symbol</div>
                </div>
              )}
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              {news && news.length > 0 ? (
                news.map((article, idx) => (
                  <div key={idx} className="bg-gray-800 p-6 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2 leading-tight">
                          {article.title}
                        </h4>
                        <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                          {article.summary?.length > 200 
                            ? article.summary.substring(0, 200) + '...'
                            : article.summary
                          }
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(article.time_published).toLocaleDateString()}</span>
                          <span>{article.source}</span>
                          {article.overall_sentiment_label && (
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: article.overall_sentiment_label === 'Bullish' ? '#10b98120' : 
                                                article.overall_sentiment_label === 'Bearish' ? '#ef444420' : '#6b728020',
                                color: article.overall_sentiment_label === 'Bullish' ? '#10b981' : 
                                       article.overall_sentiment_label === 'Bearish' ? '#ef4444' : '#6b7280'
                              }}
                            >
                              {article.overall_sentiment_label}
                            </span>
                          )}
                        </div>
                      </div>
                      {article.banner_image && (
                        <img 
                          src={article.banner_image} 
                          alt=""
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-800 p-6 rounded-lg text-center">
                  <div className="text-gray-400">No recent news available</div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Footer with API Info */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg text-center">
        <p className="text-xs text-gray-400 mb-2">
          🔥 Powered by Alpha Vantage • Real-time data and advanced technical indicators
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Real Market Data</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Advanced Indicators</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>News Sentiment</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span>Company Fundamentals</span>
          </div>
        </div>
      </div>
    </div>
  )
}