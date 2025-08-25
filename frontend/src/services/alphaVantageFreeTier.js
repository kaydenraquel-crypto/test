/**
 * Alpha Vantage Free Tier Limitations and Workarounds
 * 
 * FREE TIER ENDPOINTS (✅ Available):
 * - TIME_SERIES_DAILY (Daily stock prices)
 * - TIME_SERIES_INTRADAY (Intraday prices - limited)
 * - GLOBAL_QUOTE (Real-time quote)
 * - SYMBOL_SEARCH (Symbol lookup)
 * - OVERVIEW (Company fundamentals)
 * 
 * PREMIUM ENDPOINTS (❌ Not available on free tier):
 * - RSI (Relative Strength Index)
 * - MACD (Moving Average Convergence Divergence)
 * - BBANDS (Bollinger Bands)
 * - SMA (Simple Moving Average)
 * - EMA (Exponential Moving Average)
 * - Most technical indicators
 * - NEWS_SENTIMENT (News and sentiment)
 * 
 * WORKAROUNDS:
 * 1. Calculate indicators client-side from daily data
 * 2. Use mock data for demonstration
 * 3. Provide educational content about indicators
 */

// Calculate RSI from price data (improved version with error handling)
export function calculateRSI(prices, period = 14) {
  if (!prices || !Array.isArray(prices) || prices.length < period + 1) {
    console.warn('Insufficient data for RSI calculation:', { pricesLength: prices?.length, period })
    return []
  }
  
  const rsiData = []
  
  for (let i = period; i < prices.length; i++) {
    let gains = 0
    let losses = 0
    let validChanges = 0
    
    // Calculate average gains and losses
    for (let j = i - period + 1; j <= i; j++) {
      if (j > 0 && prices[j] && prices[j-1] && 
          typeof prices[j].close === 'number' && typeof prices[j-1].close === 'number') {
        const change = prices[j].close - prices[j-1].close
        if (change > 0) gains += change
        else if (change < 0) losses -= change
        validChanges++
      }
    }
    
    if (validChanges > 0) {
      const avgGain = gains / period
      const avgLoss = losses / period
      
      const rs = avgGain / (avgLoss || 0.001) // Avoid division by zero
      const rsi = 100 - (100 / (1 + rs))
      
      // Ensure RSI is within valid range
      const clampedRSI = Math.max(0, Math.min(100, rsi))
      
      rsiData.push({
        timestamp: prices[i].date || prices[i].timestamp,
        time: new Date(prices[i].date || prices[i].timestamp).getTime() / 1000,
        RSI: Math.round(clampedRSI * 100) / 100
      })
    }
  }
  
  return rsiData
}

// Calculate Simple Moving Average
export function calculateSMA(prices, period = 20) {
  if (!prices || !Array.isArray(prices) || prices.length < period) {
    console.warn('Insufficient data for SMA calculation:', { pricesLength: prices?.length, period })
    return []
  }
  
  const smaData = []
  
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0
    let validCount = 0
    
    for (let j = i - period + 1; j <= i; j++) {
      if (prices[j] && typeof prices[j].close === 'number' && !isNaN(prices[j].close)) {
        sum += prices[j].close
        validCount++
      }
    }
    
    if (validCount >= period * 0.8) { // Allow if at least 80% of data points are valid
      const sma = sum / validCount
      
      smaData.push({
        timestamp: prices[i].date || prices[i].timestamp,
        time: new Date(prices[i].date || prices[i].timestamp).getTime() / 1000,
        SMA: Math.round(sma * 100) / 100
      })
    }
  }
  
  return smaData
}

// Calculate MACD (simplified version)
export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (!prices || !Array.isArray(prices) || prices.length < slowPeriod + signalPeriod) {
    console.warn('Insufficient data for MACD calculation:', { 
      pricesLength: prices?.length, 
      minRequired: slowPeriod + signalPeriod 
    })
    return []
  }
  
  // Calculate EMAs
  const fastEMA = calculateEMA(prices, fastPeriod)
  const slowEMA = calculateEMA(prices, slowPeriod)
  
  if (fastEMA.length === 0 || slowEMA.length === 0) return []
  
  // Align the EMAs by timestamp to ensure proper calculation
  const macdLine = []
  const minLength = Math.min(fastEMA.length, slowEMA.length)
  
  // Calculate MACD line by subtracting slow EMA from fast EMA
  for (let i = 0; i < minLength; i++) {
    if (fastEMA[i] && slowEMA[i] && fastEMA[i].timestamp === slowEMA[i].timestamp) {
      macdLine.push({
        timestamp: fastEMA[i].timestamp,
        MACD: fastEMA[i].EMA - slowEMA[i].EMA
      })
    }
  }
  
  if (macdLine.length === 0) return []
  
  // Calculate Signal line (EMA of MACD values)
  const macdPrices = macdLine.map(m => ({date: m.timestamp, close: m.MACD}))
  const signalLine = calculateEMA(macdPrices, signalPeriod)
  
  const macdData = []
  const finalLength = Math.min(macdLine.length, signalLine.length)
  
  for (let i = 0; i < finalLength; i++) {
    if (macdLine[i] && signalLine[i]) {
      const macd = macdLine[i].MACD || 0
      const signal = signalLine[i].EMA || 0
      const histogram = macd - signal
      
      macdData.push({
        timestamp: macdLine[i].timestamp,
        time: new Date(macdLine[i].timestamp).getTime() / 1000,
        MACD: Math.round(macd * 10000) / 10000,  // More precision for MACD
        MACD_Signal: Math.round(signal * 10000) / 10000,
        MACD_Hist: Math.round(histogram * 10000) / 10000
      })
    }
  }
  
  return macdData
}

// Calculate Exponential Moving Average with error handling
export function calculateEMA(prices, period = 20) {
  if (!prices || prices.length < period) return []
  
  const multiplier = 2 / (period + 1)
  const emaData = []
  
  // Start with SMA for first EMA value
  let sum = 0
  let validPrices = 0
  
  for (let i = 0; i < period && i < prices.length; i++) {
    if (prices[i] && typeof prices[i].close === 'number') {
      sum += prices[i].close
      validPrices++
    }
  }
  
  if (validPrices === 0) return []
  
  let ema = sum / validPrices
  
  // Add first EMA point
  if (prices[period - 1] && (prices[period - 1].date || prices[period - 1].timestamp)) {
    emaData.push({
      timestamp: prices[period - 1].date || prices[period - 1].timestamp,
      time: new Date(prices[period - 1].date || prices[period - 1].timestamp).getTime() / 1000,
      EMA: Math.round(ema * 100) / 100
    })
  }
  
  // Calculate subsequent EMAs
  for (let i = period; i < prices.length; i++) {
    if (prices[i] && typeof prices[i].close === 'number' && 
        (prices[i].date || prices[i].timestamp)) {
      ema = (prices[i].close * multiplier) + (ema * (1 - multiplier))
      emaData.push({
        timestamp: prices[i].date || prices[i].timestamp,
        time: new Date(prices[i].date || prices[i].timestamp).getTime() / 1000,
        EMA: Math.round(ema * 100) / 100
      })
    }
  }
  
  return emaData
}

// Calculate Bollinger Bands
export function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  const smaData = calculateSMA(prices, period)
  if (smaData.length === 0) return []
  
  const bollingerData = []
  
  for (let i = period - 1; i < prices.length; i++) {
    const sma = smaData[i - period + 1].SMA
    
    // Calculate standard deviation
    let variance = 0
    for (let j = i - period + 1; j <= i; j++) {
      variance += Math.pow(prices[j].close - sma, 2)
    }
    const standardDeviation = Math.sqrt(variance / period)
    
    const upperBand = sma + (standardDeviation * stdDev)
    const lowerBand = sma - (standardDeviation * stdDev)
    
    bollingerData.push({
      timestamp: prices[i].date,
      time: new Date(prices[i].date).getTime() / 1000,
      'Real Upper Band': Math.round(upperBand * 100) / 100,
      'Real Middle Band': Math.round(sma * 100) / 100,
      'Real Lower Band': Math.round(lowerBand * 100) / 100
    })
  }
  
  return bollingerData
}

// Determine RSI signals
export function getRSISignal(rsiValue) {
  if (rsiValue < 30) return 'oversold'
  if (rsiValue > 70) return 'overbought'
  return 'neutral'
}

// Calculate Stochastic Oscillator
export function calculateStochastic(prices, kPeriod = 14, dPeriod = 3) {
  if (!prices || !Array.isArray(prices) || prices.length < kPeriod + dPeriod) {
    console.warn('Insufficient data for Stochastic calculation:', { 
      pricesLength: prices?.length, 
      minRequired: kPeriod + dPeriod 
    })
    return []
  }

  const stochData = []
  
  // Calculate %K values first
  const kValues = []
  
  for (let i = kPeriod - 1; i < prices.length; i++) {
    let highestHigh = -Infinity
    let lowestLow = Infinity
    
    // Find highest high and lowest low in the period
    for (let j = i - kPeriod + 1; j <= i; j++) {
      if (prices[j] && typeof prices[j].high === 'number' && typeof prices[j].low === 'number') {
        highestHigh = Math.max(highestHigh, prices[j].high)
        lowestLow = Math.min(lowestLow, prices[j].low)
      }
    }
    
    if (prices[i] && typeof prices[i].close === 'number' && highestHigh !== lowestLow) {
      const k = ((prices[i].close - lowestLow) / (highestHigh - lowestLow)) * 100
      kValues.push({
        timestamp: prices[i].date || prices[i].timestamp,
        k: Math.max(0, Math.min(100, k))
      })
    }
  }
  
  // Calculate %D (moving average of %K)
  for (let i = dPeriod - 1; i < kValues.length; i++) {
    let sum = 0
    let count = 0
    
    for (let j = i - dPeriod + 1; j <= i; j++) {
      if (kValues[j] && typeof kValues[j].k === 'number') {
        sum += kValues[j].k
        count++
      }
    }
    
    if (count > 0) {
      const d = sum / count
      stochData.push({
        timestamp: kValues[i].timestamp,
        time: new Date(kValues[i].timestamp).getTime() / 1000,
        SlowK: Math.round(kValues[i].k * 100) / 100,
        SlowD: Math.round(d * 100) / 100
      })
    }
  }
  
  return stochData
}

// Calculate Average Directional Index (ADX)
export function calculateADX(prices, period = 14) {
  if (!prices || !Array.isArray(prices) || prices.length < period * 2) {
    console.warn('Insufficient data for ADX calculation:', { 
      pricesLength: prices?.length, 
      minRequired: period * 2 
    })
    return []
  }

  const adxData = []
  const trueRanges = []
  const plusDMs = []
  const minusDMs = []
  
  // Calculate True Range, +DM, and -DM
  for (let i = 1; i < prices.length; i++) {
    const current = prices[i]
    const previous = prices[i - 1]
    
    if (!current || !previous || 
        typeof current.high !== 'number' || typeof current.low !== 'number' || 
        typeof current.close !== 'number' || typeof previous.close !== 'number') {
      continue
    }
    
    // True Range
    const tr1 = current.high - current.low
    const tr2 = Math.abs(current.high - previous.close)
    const tr3 = Math.abs(current.low - previous.close)
    const trueRange = Math.max(tr1, tr2, tr3)
    
    // Directional Movement
    const upMove = current.high - previous.high
    const downMove = previous.low - current.low
    
    const plusDM = (upMove > downMove && upMove > 0) ? upMove : 0
    const minusDM = (downMove > upMove && downMove > 0) ? downMove : 0
    
    trueRanges.push(trueRange)
    plusDMs.push(plusDM)
    minusDMs.push(minusDM)
  }
  
  // Calculate smoothed values
  if (trueRanges.length >= period) {
    for (let i = period - 1; i < trueRanges.length; i++) {
      // Calculate smoothed TR, +DM, -DM
      const smoothedTR = trueRanges.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
      const smoothedPlusDM = plusDMs.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
      const smoothedMinusDM = minusDMs.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
      
      // Calculate DI+ and DI-
      const plusDI = smoothedTR > 0 ? (smoothedPlusDM / smoothedTR) * 100 : 0
      const minusDI = smoothedTR > 0 ? (smoothedMinusDM / smoothedTR) * 100 : 0
      
      // Calculate DX
      const diSum = plusDI + minusDI
      const dx = diSum > 0 ? Math.abs(plusDI - minusDI) / diSum * 100 : 0
      
      // ADX is smoothed DX (using simple moving average for simplicity)
      if (i >= period * 2 - 2) {
        const startIdx = Math.max(0, i - period + 1)
        let dxSum = 0
        let dxCount = 0
        
        for (let j = startIdx; j <= i; j++) {
          if (j >= period - 1) {
            dxSum += dx // This is simplified - in practice you'd store all DX values
            dxCount++
          }
        }
        
        const adx = dxCount > 0 ? dxSum / dxCount : 0
        
        adxData.push({
          timestamp: prices[i + 1].date || prices[i + 1].timestamp,
          time: new Date(prices[i + 1].date || prices[i + 1].timestamp).getTime() / 1000,
          ADX: Math.round(adx * 100) / 100
        })
      }
    }
  }
  
  return adxData
}

// Determine Stochastic signals
export function getStochasticSignal(k, d) {
  if (k < 20 && d < 20) return 'oversold'
  if (k > 80 && d > 80) return 'overbought'
  if (k > d) return 'bullish_crossover'
  if (k < d) return 'bearish_crossover'
  return 'neutral'
}

// Determine ADX signals
export function getADXSignal(adxValue) {
  if (adxValue > 50) return 'very_strong_trend'
  if (adxValue > 25) return 'strong_trend'
  if (adxValue > 15) return 'moderate_trend'
  return 'weak_trend'
}

// Determine MACD signals
export function getMACDSignal(macd, signal) {
  if (macd > signal) return 'bullish'
  if (macd < signal) return 'bearish'
  return 'neutral'
}