// Test Alpha Vantage Service
import { describe, it, expect, beforeEach } from 'vitest'
import AlphaVantageService from './alphaVantageService'

describe('AlphaVantageService', () => {
  beforeEach(() => {
    // Clear cache before each test
    AlphaVantageService.clearCache()
  })

  it('should initialize with demo API key', () => {
    expect(AlphaVantageService.apiKey).toBe('demo')
  })

  it('should return mock data for daily prices when using demo key', async () => {
    const data = await AlphaVantageService.getDailyData('AAPL')
    
    expect(data).toBeDefined()
    expect(data.formatted).toBeDefined()
    expect(Array.isArray(data.formatted)).toBe(true)
    expect(data.formatted.length).toBeGreaterThan(0)
    
    // Check data structure
    const firstCandle = data.formatted[0]
    expect(firstCandle).toHaveProperty('open')
    expect(firstCandle).toHaveProperty('high')
    expect(firstCandle).toHaveProperty('low')
    expect(firstCandle).toHaveProperty('close')
    expect(firstCandle).toHaveProperty('volume')
    expect(firstCandle).toHaveProperty('time')
  })

  it('should return mock RSI data when using demo key', async () => {
    const data = await AlphaVantageService.getRSI('AAPL')
    
    expect(data).toBeDefined()
    expect(data.formatted).toBeDefined()
    expect(Array.isArray(data.formatted)).toBe(true)
    expect(data.formatted.length).toBeGreaterThan(0)
    
    // Check RSI data structure
    const firstRSI = data.formatted[0]
    expect(firstRSI).toHaveProperty('RSI')
    expect(firstRSI).toHaveProperty('time')
    expect(typeof firstRSI.RSI).toBe('number')
  })

  it('should return mock company overview when using demo key', async () => {
    const data = await AlphaVantageService.getCompanyOverview('AAPL')
    
    expect(data).toBeDefined()
    expect(data.Symbol).toBe('AAPL')
    expect(data.Name).toBeDefined()
    expect(data.Sector).toBeDefined()
    expect(data.MarketCapitalization).toBeDefined()
  })

  it('should return mock news sentiment when using demo key', async () => {
    const data = await AlphaVantageService.getNewsSentiment('AAPL')
    
    expect(data).toBeDefined()
    expect(data.feed).toBeDefined()
    expect(Array.isArray(data.feed)).toBe(true)
    expect(data.feed.length).toBeGreaterThan(0)
    
    // Check news structure
    const firstNews = data.feed[0]
    expect(firstNews).toHaveProperty('title')
    expect(firstNews).toHaveProperty('summary')
    expect(firstNews).toHaveProperty('source')
    expect(firstNews).toHaveProperty('overall_sentiment_label')
  })

  it('should cache data properly', async () => {
    // First call should fetch data
    const data1 = await AlphaVantageService.getDailyData('AAPL')
    
    // Second call should return cached data (same reference)
    const data2 = await AlphaVantageService.getDailyData('AAPL')
    
    expect(data1).toBe(data2) // Same object reference indicates caching
  })

  it('should handle symbol search', async () => {
    const data = await AlphaVantageService.symbolSearch('AAPL')
    
    expect(data).toBeDefined()
    expect(data.bestMatches).toBeDefined()
    expect(Array.isArray(data.bestMatches)).toBe(true)
    expect(data.bestMatches.length).toBeGreaterThan(0)
    
    // Check search result structure
    const firstResult = data.bestMatches[0]
    expect(firstResult).toHaveProperty('1. symbol')
    expect(firstResult).toHaveProperty('2. name')
    expect(firstResult).toHaveProperty('3. type')
  })

  it('should generate comprehensive analysis', async () => {
    const data = await AlphaVantageService.getComprehensiveAnalysis('AAPL')
    
    expect(data).toBeDefined()
    expect(data.symbol).toBe('AAPL')
    expect(data.price).toBeDefined()
    expect(data.indicators).toBeDefined()
    expect(data.indicators.rsi).toBeDefined()
    expect(data.indicators.sma20).toBeDefined()
    expect(data.indicators.sma50).toBeDefined()
    expect(data.timestamp).toBeDefined()
  })

  it('should clear cache', () => {
    // Add some data to cache first
    AlphaVantageService.cache.set('test', { data: 'test', timestamp: Date.now() })
    expect(AlphaVantageService.cache.size).toBe(1)
    
    // Clear cache
    AlphaVantageService.clearCache()
    expect(AlphaVantageService.cache.size).toBe(0)
  })
})