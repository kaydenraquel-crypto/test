// Alpha Vantage API Integration for NovaSignal
// Provides real market data and advanced technical indicators
import { 
  mockDailyData, 
  mockRSI, 
  mockMACD, 
  mockSMA, 
  mockCompanyOverview, 
  mockNews, 
  mockSymbolSearch,
  generateMockData 
} from './alphaVantageMockData'

import {
  calculateRSI,
  calculateSMA,
  calculateMACD,
  calculateEMA,
  calculateBollingerBands,
  calculateStochastic,
  calculateADX,
  getRSISignal,
  getMACDSignal,
  getStochasticSignal,
  getADXSignal
} from './alphaVantageFreeTier'

class AlphaVantageService {
  constructor() {
    // Get API key from environment variables
    this.apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY
    this.baseURL = 'https://www.alphavantage.co/query'
    this.backendURL = 'http://localhost:8000/api/alpha-vantage'
    this.useBackend = false // Keep backend disabled for direct API calls
    this.cache = new Map()
    this.rateLimitDelay = 12000 // 12 seconds between requests (free tier: 5 calls per minute)
    this.lastRequestTime = 0
    this.rateLimitExceeded = false // Track if we've hit the daily limit
    this.demoMode = false // Force real data mode - no mock data unless API fails
    
    // Real-time update configuration
    this.realTimeInterval = 60000 // 1 minute updates
    this.activeSubscriptions = new Map() // Track active real-time subscriptions
    
    console.log(`🔑 Alpha Vantage initialized with API key: ${this.apiKey ? `${this.apiKey.substring(0, 8)}...` : 'MISSING'}`)
    
    if (!this.apiKey || this.apiKey === 'demo') {
      console.warn('⚠️ No valid Alpha Vantage API key found. Please add VITE_ALPHA_VANTAGE_KEY to your .env file')
    }
  }

  // Rate limiting helper
  async ensureRateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    this.lastRequestTime = Date.now()
  }

  // Try backend API first
  async tryBackendAPI(endpoint, params = {}) {
    if (!this.useBackend) return null
    
    try {
      const url = new URL(`${this.backendURL}${endpoint}`)
      
      // Add query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key])
        }
      })
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        console.warn(`Backend API error: ${response.status}`)
        return null
      }
      
      return await response.json()
    } catch (error) {
      console.warn('Backend API not available, falling back to direct API:', error.message)
      this.useBackend = false // Disable backend for this session
      return null
    }
  }

  // Generic API call helper
  async makeRequest(params, cacheKey = null, cacheDuration = 300000) { // 5 min cache
    // Only use mock data if we're explicitly in demo mode AND rate limit exceeded
    if (this.rateLimitExceeded && this.demoMode) {
      console.log('🎭 Using demo mode - rate limit exceeded')
      return this.getMockData(params.function, params.symbol)
    }
    
    // Force real API calls if we have a valid key
    if (!this.apiKey || this.apiKey === 'demo') {
      console.warn('⚠️ No API key available, falling back to mock data')
      return this.getMockData(params.function, params.symbol)
    }

    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < cacheDuration) {
        return cached.data
      }
    }

    await this.ensureRateLimit()

    const url = new URL(this.baseURL)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key])
      }
    })
    url.searchParams.append('apikey', this.apiKey)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Check for API errors
      if (data['Error Message']) {
        throw new Error(`Alpha Vantage API Error: ${data['Error Message']}`)
      }
      if (data['Information']) {
        const info = data['Information']
        
        // Check if it's a rate limit error
        if (info.includes('rate limit') || info.includes('requests per day') || info.includes('premium plans')) {
          console.warn('🚨 Alpha Vantage daily rate limit exceeded. Switching to demo mode.')
          this.rateLimitExceeded = true
          this.demoMode = true
          
          // Return mock data for this request
          return this.getMockData(params.function, params.symbol)
        }
        
        throw new Error(`Alpha Vantage Rate Limit: ${info}`)
      }

      // Cache successful response
      if (cacheKey) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
      }

      return data
    } catch (error) {
      console.error('Alpha Vantage API Error:', error)
      
      // Check if it's a rate limit error in the error message
      if (error.message && (error.message.includes('rate limit') || error.message.includes('requests per day'))) {
        console.warn('🚨 Switching to demo mode due to rate limit')
        this.rateLimitExceeded = true
        this.demoMode = true
        return this.getMockData(params.function, params.symbol)
      }
      
      // Return mock data if API fails and we're using demo key
      if (this.apiKey === 'demo') {
        return this.getMockData(params.function, params.symbol)
      }
      throw error
    }
  }

  // ==============================================================================
  // MARKET DATA FUNCTIONS
  // ==============================================================================

  // Get intraday stock data
  async getIntradayData(symbol, interval = '5min', outputsize = 'compact') {
    const cacheKey = `intraday_${symbol}_${interval}_${outputsize}`
    const params = {
      function: 'TIME_SERIES_INTRADAY',
      symbol,
      interval,
      outputsize
    }

    const data = await this.makeRequest(params, cacheKey, 60000) // 1 min cache
    return this.formatTimeSeriesData(data, `Time Series (${interval})`)
  }

  // Get last 7 hours of intraday data for real-time trading
  async getLast7HoursData(symbol, interval = '1min') {
    console.log(`📊 Fetching last 7 hours of ${interval} data for ${symbol}`)
    
    const cacheKey = `intraday_7h_${symbol}_${interval}`
    const params = {
      function: 'TIME_SERIES_INTRADAY',
      symbol,
      interval,
      outputsize: 'full', // Get full dataset
      adjusted: 'false',
      extended_hours: 'true' // Include pre/post market data
    }

    try {
      const data = await this.makeRequest(params, cacheKey, 30000) // 30 second cache for real-time
      const formatted = this.formatTimeSeriesData(data, `Time Series (${interval})`)
      
      if (formatted.formatted && formatted.formatted.length > 0) {
        // Filter to last 7 hours (420 minutes)
        const now = Date.now() / 1000
        const sevenHoursAgo = now - (7 * 60 * 60) // 7 hours in seconds
        
        const filteredData = formatted.formatted.filter(item => 
          item.time >= sevenHoursAgo
        ).sort((a, b) => a.time - b.time)
        
        console.log(`📊 Filtered to ${filteredData.length} data points from last 7 hours`)
        
        return {
          ...formatted,
          formatted: filteredData,
          timeRange: '7h',
          interval
        }
      }
      
      return formatted
    } catch (error) {
      console.error(`❌ Failed to fetch 7h data for ${symbol}:`, error)
      
      // Don't fall back to mock data - return empty result for real-time trading
      return {
        formatted: [],
        metadata: { symbol, interval, error: error.message },
        timeRange: '7h'
      }
    }
  }

  // Get daily stock data
  async getDailyData(symbol, outputsize = 'compact') {
    // Try backend API first
    const backendData = await this.tryBackendAPI(`/daily/${symbol}`, { outputsize })
    if (backendData && backendData.data && backendData.data.length > 0) {
      console.log('✅ Using backend API for daily data')
      return {
        formatted: backendData.data.map(item => ({
          date: item.date,
          time: new Date(item.date).getTime() / 1000,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        })),
        metadata: { symbol, outputsize },
        raw: backendData
      }
    }

    // Fallback to direct API
    const cacheKey = `daily_${symbol}_${outputsize}`
    const params = {
      function: 'TIME_SERIES_DAILY',
      symbol,
      outputsize
    }

    const data = await this.makeRequest(params, cacheKey, 300000) // 5 min cache
    return this.formatTimeSeriesData(data, 'Time Series (Daily)')
  }

  // Get weekly stock data
  async getWeeklyData(symbol) {
    const cacheKey = `weekly_${symbol}`
    const params = {
      function: 'TIME_SERIES_WEEKLY',
      symbol
    }

    const data = await this.makeRequest(params, cacheKey, 600000) // 10 min cache
    return this.formatTimeSeriesData(data, 'Weekly Time Series')
  }

  // Get monthly stock data
  async getMonthlyData(symbol) {
    const cacheKey = `monthly_${symbol}`
    const params = {
      function: 'TIME_SERIES_MONTHLY',
      symbol
    }

    const data = await this.makeRequest(params, cacheKey, 1800000) // 30 min cache
    return this.formatTimeSeriesData(data, 'Monthly Time Series')
  }

  // ==============================================================================
  // TECHNICAL INDICATORS
  // ==============================================================================

  // Simple Moving Average (SMA)
  async getSMA(symbol, interval = 'daily', time_period = 20, series_type = 'close') {
    // Try direct API first (might be premium)
    try {
      const cacheKey = `sma_${symbol}_${interval}_${time_period}_${series_type}`
      const params = {
        function: 'SMA',
        symbol,
        interval,
        time_period,
        series_type
      }

      const data = await this.makeRequest(params, cacheKey)
      return this.formatIndicatorData(data, 'Technical Analysis: SMA')
    } catch (error) {
      console.warn('⚠️ SMA API failed, calculating from daily data:', error.message)
      
      // Calculate SMA client-side from daily data
      try {
        const dailyData = await this.getDailyData(symbol, 'compact')
        if (dailyData && dailyData.formatted && dailyData.formatted.length > 0) {
          const smaData = calculateSMA(dailyData.formatted, time_period)
          console.log('✅ Calculated SMA client-side from daily data')
          return {
            formatted: smaData,
            metadata: { symbol, indicator: 'SMA (calculated)', source: 'client-side' },
            raw: dailyData
          }
        }
      } catch (calcError) {
        console.warn('Could not calculate SMA from daily data:', calcError.message)
      }
      
      // Final fallback to mock data
      return this.getMockData('SMA', symbol)
    }
  }

  // Exponential Moving Average (EMA)
  async getEMA(symbol, interval = 'daily', time_period = 20, series_type = 'close') {
    const cacheKey = `ema_${symbol}_${interval}_${time_period}_${series_type}`
    const params = {
      function: 'EMA',
      symbol,
      interval,
      time_period,
      series_type
    }

    const data = await this.makeRequest(params, cacheKey)
    return this.formatIndicatorData(data, 'Technical Analysis: EMA')
  }

  // Relative Strength Index (RSI)
  async getRSI(symbol, interval = 'daily', time_period = 14, series_type = 'close') {
    // Try backend API first
    const backendData = await this.tryBackendAPI(`/indicators/rsi/${symbol}`, { interval, time_period })
    if (backendData && backendData.data && backendData.data.length > 0) {
      console.log('✅ Using backend API for RSI')
      return {
        formatted: backendData.data.map(item => ({
          timestamp: item.timestamp,
          time: new Date(item.timestamp).getTime() / 1000,
          RSI: item.RSI || 0
        })),
        metadata: { symbol, indicator: 'RSI' },
        raw: backendData
      }
    }

    // Fallback to direct API
    try {
      const cacheKey = `rsi_${symbol}_${interval}_${time_period}_${series_type}`
      const params = {
        function: 'RSI',
        symbol,
        interval,
        time_period,
        series_type
      }

      const data = await this.makeRequest(params, cacheKey)
      return this.formatIndicatorData(data, 'Technical Analysis: RSI')
    } catch (error) {
      console.warn('⚠️ RSI API failed, calculating from daily data:', error.message)
      
      // Try to get daily data and calculate RSI client-side
      try {
        const dailyData = await this.getDailyData(symbol, 'compact')
        if (dailyData && dailyData.formatted && dailyData.formatted.length > 0) {
          const rsiData = calculateRSI(dailyData.formatted, time_period)
          console.log('✅ Calculated RSI client-side from daily data')
          return {
            formatted: rsiData,
            metadata: { symbol, indicator: 'RSI (calculated)', source: 'client-side' },
            raw: dailyData
          }
        }
      } catch (calcError) {
        console.warn('Could not calculate RSI from daily data:', calcError.message)
      }
      
      // Final fallback to mock data
      return this.getMockData('RSI', symbol)
    }
  }

  // MACD (Moving Average Convergence Divergence)
  async getMACD(symbol, interval = 'daily', series_type = 'close', fastperiod = 12, slowperiod = 26, signalperiod = 9) {
    // Try backend API first
    const backendData = await this.tryBackendAPI(`/indicators/macd/${symbol}`, { interval })
    if (backendData && backendData.data && backendData.data.length > 0) {
      console.log('✅ Using backend API for MACD')
      return {
        formatted: backendData.data.map(item => ({
          timestamp: item.timestamp,
          time: new Date(item.timestamp).getTime() / 1000,
          MACD: item.MACD || 0,
          MACD_Signal: item.MACD_Signal || 0,
          MACD_Hist: item.MACD_Hist || 0
        })),
        metadata: { symbol, indicator: 'MACD' },
        raw: backendData
      }
    }

    // Fallback to direct API (might fail on free tier)
    try {
      const cacheKey = `macd_${symbol}_${interval}_${series_type}_${fastperiod}_${slowperiod}_${signalperiod}`
      const params = {
        function: 'MACD',
        symbol,
        interval,
        series_type,
        fastperiod,
        slowperiod,
        signalperiod
      }

      const data = await this.makeRequest(params, cacheKey)
      return this.formatIndicatorData(data, 'Technical Analysis: MACD')
    } catch (error) {
      console.warn('⚠️ MACD API failed, calculating from daily data:', error.message)
      
      // Try to get daily data and calculate MACD client-side
      try {
        const dailyData = await this.getDailyData(symbol, 'compact')
        if (dailyData && dailyData.formatted && dailyData.formatted.length > 0) {
          const macdData = calculateMACD(dailyData.formatted, fastperiod, slowperiod, signalperiod)
          console.log('✅ Calculated MACD client-side from daily data')
          return {
            formatted: macdData,
            metadata: { symbol, indicator: 'MACD (calculated)', source: 'client-side' },
            raw: dailyData
          }
        }
      } catch (calcError) {
        console.warn('Could not calculate MACD from daily data:', calcError.message)
      }
      
      // Final fallback to mock data
      return this.getMockData('MACD', symbol)
    }
  }

  // Bollinger Bands (BBANDS)
  async getBollingerBands(symbol, interval = 'daily', time_period = 20, series_type = 'close', nbdevup = 2, nbdevdn = 2) {
    const cacheKey = `bbands_${symbol}_${interval}_${time_period}_${series_type}_${nbdevup}_${nbdevdn}`
    const params = {
      function: 'BBANDS',
      symbol,
      interval,
      time_period,
      series_type,
      nbdevup,
      nbdevdn
    }

    const data = await this.makeRequest(params, cacheKey)
    return this.formatIndicatorData(data, 'Technical Analysis: BBANDS')
  }

  // Stochastic Oscillator (STOCH)
  async getStochastic(symbol, interval = 'daily', fastkperiod = 14, slowdperiod = 3) {
    // Try direct API first (might be premium)
    try {
      const cacheKey = `stoch_${symbol}_${interval}_${fastkperiod}_${slowdperiod}`
      const params = {
        function: 'STOCH',
        symbol,
        interval,
        fastkperiod,
        slowkperiod: 3,
        slowdperiod,
        slowkmatype: 0,
        slowdmatype: 0
      }

      const data = await this.makeRequest(params, cacheKey)
      return this.formatIndicatorData(data, 'Technical Analysis: STOCH')
    } catch (error) {
      console.warn('⚠️ Stochastic API failed, calculating from daily data:', error.message)
      
      // Calculate Stochastic client-side from daily data
      try {
        const dailyData = await this.getDailyData(symbol, 'compact')
        if (dailyData && dailyData.formatted && dailyData.formatted.length > 0) {
          const stochData = calculateStochastic(dailyData.formatted, fastkperiod, slowdperiod)
          console.log('✅ Calculated Stochastic client-side from daily data')
          return {
            formatted: stochData,
            metadata: { symbol, indicator: 'Stochastic (calculated)', source: 'client-side' },
            raw: dailyData
          }
        }
      } catch (calcError) {
        console.warn('Could not calculate Stochastic from daily data:', calcError.message)
      }
      
      // Final fallback to mock data
      return this.getMockData('STOCH', symbol)
    }
  }

  // Average Directional Index (ADX)
  async getADX(symbol, interval = 'daily', time_period = 14) {
    // Try direct API first (might be premium)
    try {
      const cacheKey = `adx_${symbol}_${interval}_${time_period}`
      const params = {
        function: 'ADX',
        symbol,
        interval,
        time_period
      }

      const data = await this.makeRequest(params, cacheKey)
      return this.formatIndicatorData(data, 'Technical Analysis: ADX')
    } catch (error) {
      console.warn('⚠️ ADX API failed, calculating from daily data:', error.message)
      
      // Calculate ADX client-side from daily data
      try {
        const dailyData = await this.getDailyData(symbol, 'compact')
        if (dailyData && dailyData.formatted && dailyData.formatted.length > 0) {
          const adxData = calculateADX(dailyData.formatted, time_period)
          console.log('✅ Calculated ADX client-side from daily data')
          return {
            formatted: adxData,
            metadata: { symbol, indicator: 'ADX (calculated)', source: 'client-side' },
            raw: dailyData
          }
        }
      } catch (calcError) {
        console.warn('Could not calculate ADX from daily data:', calcError.message)
      }
      
      // Final fallback to mock data
      return this.getMockData('ADX', symbol)
    }
  }

  // ==============================================================================
  // CRYPTOCURRENCY DATA
  // ==============================================================================

  // Get cryptocurrency data
  async getCryptoIntraday(symbol, market = 'USD', interval = '5min') {
    const cacheKey = `crypto_intraday_${symbol}_${market}_${interval}`
    const params = {
      function: 'CRYPTO_INTRADAY',
      symbol,
      market,
      interval
    }

    const data = await this.makeRequest(params, cacheKey, 60000) // 1 min cache
    return this.formatTimeSeriesData(data, `Time Series (Digital Currency Intraday)`)
  }

  // Get daily cryptocurrency data
  async getCryptoDaily(symbol, market = 'USD') {
    const cacheKey = `crypto_daily_${symbol}_${market}`
    const params = {
      function: 'DIGITAL_CURRENCY_DAILY',
      symbol,
      market
    }

    const data = await this.makeRequest(params, cacheKey, 300000) // 5 min cache
    return this.formatCryptoData(data, 'Time Series (Digital Currency Daily)')
  }

  // ==============================================================================
  // FUNDAMENTAL DATA
  // ==============================================================================

  // Get company overview
  async getCompanyOverview(symbol) {
    const cacheKey = `overview_${symbol}`
    const params = {
      function: 'OVERVIEW',
      symbol
    }

    const data = await this.makeRequest(params, cacheKey, 3600000) // 1 hour cache
    return data
  }

  // Get earnings data
  async getEarnings(symbol) {
    const cacheKey = `earnings_${symbol}`
    const params = {
      function: 'EARNINGS',
      symbol
    }

    const data = await this.makeRequest(params, cacheKey, 3600000) // 1 hour cache
    return data
  }

  // ==============================================================================
  // NEWS & SENTIMENT
  // ==============================================================================

  // Get news sentiment
  async getNewsSentiment(tickers = null, topics = null, time_from = null, time_to = null, sort = 'LATEST', limit = 50) {
    const cacheKey = `news_${tickers}_${topics}_${time_from}_${time_to}_${sort}_${limit}`
    const params = {
      function: 'NEWS_SENTIMENT',
      tickers,
      topics,
      time_from,
      time_to,
      sort,
      limit
    }

    const data = await this.makeRequest(params, cacheKey, 300000) // 5 min cache
    return data
  }

  // ==============================================================================
  // HELPER METHODS
  // ==============================================================================

  // Format time series data for chart consumption
  formatTimeSeriesData(data, timeSeriesKey) {
    if (!data || !data[timeSeriesKey]) {
      return { formatted: [], metadata: data['Meta Data'] || {} }
    }

    const timeSeries = data[timeSeriesKey]
    const formatted = Object.entries(timeSeries).map(([timestamp, values]) => {
      const open = parseFloat(values['1. open'])
      const high = parseFloat(values['2. high'])
      const low = parseFloat(values['3. low'])
      const close = parseFloat(values['4. close'])
      const volume = parseInt(values['5. volume'] || values['6. volume'] || 0)
      
      // Validate OHLC data before adding to formatted array
      if (!isFinite(open) || !isFinite(high) || !isFinite(low) || !isFinite(close)) {
        console.warn('⚠️ Skipping invalid OHLC data for timestamp:', timestamp, { open, high, low, close })
        return null
      }
      
      // Basic sanity check: high should be >= low
      if (high < low) {
        console.warn('⚠️ Fixing invalid high/low relationship for timestamp:', timestamp, 'high:', high, 'low:', low)
        // Swap them if they're backwards
        return {
          timestamp,
          time: new Date(timestamp).getTime() / 1000, // For lightweight-charts
          open,
          high: Math.max(high, low),
          low: Math.min(high, low),
          close,
          volume
        }
      }
      
      return {
        timestamp,
        time: new Date(timestamp).getTime() / 1000, // For lightweight-charts
        open,
        high,
        low,
        close,
        volume
      }
    })
    .filter(item => item !== null) // Remove invalid entries
    .sort((a, b) => a.time - b.time)

    console.log(`🔍 Formatted ${formatted.length} valid data points from ${Object.keys(timeSeries).length} raw entries`)
    
    if (formatted.length > 0) {
      const sample = formatted[0]
      const ohlcRange = sample.high - sample.low
      const priceLevel = sample.close
      const rangePercent = (ohlcRange / priceLevel * 100).toFixed(4)
      console.log(`🔍 Sample formatted data:`, {
        timestamp: sample.timestamp,
        open: sample.open,
        high: sample.high,
        low: sample.low,
        close: sample.close,
        range: ohlcRange.toFixed(4),
        rangePercent: `${rangePercent}%`
      })
    }

    return {
      formatted,
      metadata: data['Meta Data'] || {},
      raw: timeSeries
    }
  }

  // Format crypto data
  formatCryptoData(data, timeSeriesKey) {
    if (!data || !data[timeSeriesKey]) {
      return { formatted: [], metadata: data['Meta Data'] || {} }
    }

    const timeSeries = data[timeSeriesKey]
    const formatted = Object.entries(timeSeries).map(([timestamp, values]) => ({
      timestamp,
      time: new Date(timestamp).getTime() / 1000,
      open: parseFloat(values['1a. open (USD)'] || values['1. open']),
      high: parseFloat(values['2a. high (USD)'] || values['2. high']),
      low: parseFloat(values['3a. low (USD)'] || values['3. low']),
      close: parseFloat(values['4a. close (USD)'] || values['4. close']),
      volume: parseFloat(values['5. volume'])
    })).sort((a, b) => a.time - b.time)

    return {
      formatted,
      metadata: data['Meta Data'] || {},
      raw: timeSeries
    }
  }

  // Format technical indicator data
  formatIndicatorData(data, indicatorKey) {
    if (!data || !data[indicatorKey]) {
      return { formatted: [], metadata: data['Meta Data'] || {} }
    }

    const indicatorSeries = data[indicatorKey]
    const formatted = Object.entries(indicatorSeries).map(([timestamp, values]) => {
      const result = {
        timestamp,
        time: new Date(timestamp).getTime() / 1000
      }
      
      // Add all indicator values
      Object.keys(values).forEach(key => {
        const cleanKey = key.replace(/^\d+\.\s*/, '') // Remove "1. " prefix
        result[cleanKey] = parseFloat(values[key])
      })
      
      return result
    }).sort((a, b) => a.time - b.time)

    return {
      formatted,
      metadata: data['Meta Data'] || {},
      raw: indicatorSeries
    }
  }

  // ==============================================================================
  // BATCH OPERATIONS
  // ==============================================================================

  // Get comprehensive data for a symbol (price + key indicators)
  async getComprehensiveAnalysis(symbol, interval = 'daily') {
    if (!symbol || typeof symbol !== 'string') {
      throw new Error('Valid symbol is required for comprehensive analysis')
    }
    
    try {
      console.log(`📊 Starting comprehensive analysis for ${symbol}`)
      // For demo purposes, we'll get basic data + a few key indicators
      const [priceData, rsi, sma20, sma50] = await Promise.allSettled([
        this.getDailyData(symbol),
        this.getRSI(symbol, interval),
        this.getSMA(symbol, interval, 20),
        this.getSMA(symbol, interval, 50)
      ])

      const result = {
        symbol: symbol.toUpperCase(),
        interval,
        timestamp: Date.now(),
        price: priceData.status === 'fulfilled' ? priceData.value : null,
        indicators: {}
      }

      // Only include successful indicator calculations
      if (rsi.status === 'fulfilled' && rsi.value) {
        result.indicators.rsi = rsi.value
      }
      if (sma20.status === 'fulfilled' && sma20.value) {
        result.indicators.sma20 = sma20.value
      }
      if (sma50.status === 'fulfilled' && sma50.value) {
        result.indicators.sma50 = sma50.value
      }

      // Log any failures for debugging
      if (rsi.status === 'rejected') console.warn(`RSI calculation failed for ${symbol}:`, rsi.reason)
      if (sma20.status === 'rejected') console.warn(`SMA20 calculation failed for ${symbol}:`, sma20.reason)
      if (sma50.status === 'rejected') console.warn(`SMA50 calculation failed for ${symbol}:`, sma50.reason)

      return result
    } catch (error) {
      console.error(`Comprehensive analysis failed for ${symbol}:`, error)
      throw error
    }
  }

  // Search for symbols
  async symbolSearch(keywords) {
    const cacheKey = `search_${keywords}`
    const params = {
      function: 'SYMBOL_SEARCH',
      keywords
    }

    const data = await this.makeRequest(params, cacheKey, 3600000) // 1 hour cache
    return data
  }

  // Get market status
  async getMarketStatus() {
    const cacheKey = 'market_status'
    const params = {
      function: 'MARKET_STATUS'
    }

    const data = await this.makeRequest(params, cacheKey, 300000) // 5 min cache
    return data
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.cache.clear()
  }

  // Enable demo mode manually
  enableDemoMode() {
    this.demoMode = true
    console.log('🎭 Demo mode enabled - using mock data for all requests')
  }

  // Disable demo mode (but keep rate limit tracking)
  disableDemoMode() {
    this.demoMode = false
    console.log('📡 Demo mode disabled - will attempt real API calls')
  }

  // Real-time data subscription for minute-by-minute updates
  subscribeToRealTimeUpdates(symbol, interval = '1min', onUpdate) {
    const subscriptionKey = `${symbol}_${interval}`
    
    if (this.activeSubscriptions.has(subscriptionKey)) {
      console.log(`📊 Already subscribed to ${symbol} ${interval} updates`)
      return () => this.unsubscribeFromRealTimeUpdates(subscriptionKey)
    }

    console.log(`📊 Starting real-time subscription for ${symbol} (${interval} updates)`)
    
    const updateFunction = async () => {
      try {
        // Get latest data point
        const data = await this.getLast7HoursData(symbol, interval)
        if (data.formatted && data.formatted.length > 0) {
          const latestCandle = data.formatted[data.formatted.length - 1]
          onUpdate(latestCandle)
          console.log(`📊 Real-time update: ${symbol} @ ${new Date(latestCandle.time * 1000).toLocaleTimeString()} - $${latestCandle.close.toFixed(2)}`)
        }
      } catch (error) {
        console.error(`❌ Real-time update failed for ${symbol}:`, error)
      }
    }

    // Initial update
    updateFunction()
    
    // Set up interval updates
    const intervalId = setInterval(updateFunction, this.realTimeInterval)
    
    this.activeSubscriptions.set(subscriptionKey, {
      symbol,
      interval,
      intervalId,
      onUpdate,
      lastUpdate: Date.now()
    })

    // Return unsubscribe function
    return () => this.unsubscribeFromRealTimeUpdates(subscriptionKey)
  }

  // Unsubscribe from real-time updates
  unsubscribeFromRealTimeUpdates(subscriptionKey) {
    const subscription = this.activeSubscriptions.get(subscriptionKey)
    if (subscription) {
      clearInterval(subscription.intervalId)
      this.activeSubscriptions.delete(subscriptionKey)
      console.log(`📊 Unsubscribed from real-time updates: ${subscriptionKey}`)
    }
  }

  // Unsubscribe all real-time updates
  unsubscribeAll() {
    this.activeSubscriptions.forEach((subscription, key) => {
      clearInterval(subscription.intervalId)
    })
    this.activeSubscriptions.clear()
    console.log('📊 All real-time subscriptions cleared')
  }

  // Check if we're in demo mode
  isDemoMode() {
    return this.demoMode || this.rateLimitExceeded
  }

  // Get current status
  getStatus() {
    return {
      demoMode: this.demoMode,
      rateLimitExceeded: this.rateLimitExceeded,
      apiKey: this.apiKey === 'demo' ? 'demo' : `${this.apiKey.substring(0, 8)}...`,
      cacheSize: this.cache.size
    }
  }

  // Get mock data based on function and symbol
  getMockData(functionName, symbol = 'AAPL') {
    console.log(`🎭 Using mock data for ${functionName} (${symbol})`)
    
    switch (functionName) {
      case 'TIME_SERIES_DAILY':
        return mockDailyData[symbol] || mockDailyData['AAPL']
      case 'RSI':
        return mockRSI[symbol] || mockRSI['AAPL']
      case 'MACD':
        return mockMACD[symbol] || mockMACD['AAPL']
      case 'SMA':
        return mockSMA[symbol] || mockSMA['AAPL']
      case 'EMA':
        return mockSMA[symbol] || mockSMA['AAPL'] // Use SMA mock for EMA
      case 'OVERVIEW':
        return mockCompanyOverview[symbol] || mockCompanyOverview['AAPL']
      case 'NEWS_SENTIMENT':
        return {
          feed: mockNews[symbol] || mockNews['AAPL'],
          sentiment_score_definition: "x <= -0.35: Bearish; -0.35 < x <= -0.15: Somewhat-Bearish; -0.15 < x < 0.15: Neutral; 0.15 <= x < 0.35: Somewhat_Bullish; x >= 0.35: Bullish"
        }
      case 'SYMBOL_SEARCH':
        return mockSymbolSearch
      case 'BBANDS':
        return {
          "Meta Data": {
            "1: Symbol": symbol,
            "2: Indicator": "Bollinger Bands (BBANDS)",
            "3: Last Refreshed": new Date().toISOString().split('T')[0],
            "4: Interval": "daily",
            "5: Time Period": 20
          },
          "Technical Analysis: BBANDS": {
            [new Date().toISOString().split('T')[0]]: {
              "Real Upper Band": "195.45",
              "Real Middle Band": "185.92",
              "Real Lower Band": "176.39"
            }
          }
        }
      case 'STOCH':
        return {
          "Meta Data": {
            "1: Symbol": symbol,
            "2: Indicator": "Stochastic (STOCH)"
          },
          "Technical Analysis: STOCH": {
            [new Date().toISOString().split('T')[0]]: {
              "SlowK": "65.32",
              "SlowD": "68.45"
            }
          }
        }
      case 'ADX':
        return {
          "Meta Data": {
            "1: Symbol": symbol,
            "2: Indicator": "Average Directional Movement Index (ADX)"
          },
          "Technical Analysis: ADX": {
            [new Date().toISOString().split('T')[0]]: {
              "ADX": "34.52"
            }
          }
        }
      default:
        // Generate dynamic mock data for unknown functions
        const mockData = generateMockData(symbol)
        return {
          "Meta Data": { "1: Symbol": symbol },
          [`Technical Analysis: ${functionName}`]: {
            [new Date().toISOString().split('T')[0]]: {
              "value": mockData.indicators.rsi.value.toFixed(2)
            }
          }
        }
    }
  }
}

// Export singleton instance
export default new AlphaVantageService()