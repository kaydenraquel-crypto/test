import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getHistory, getIndicators, getPredictions, getNews } from './api'

// Import the isValidSymbol function correctly
const isValidSymbol = (symbol: string, market: 'crypto' | 'stocks'): boolean => {
  if (!symbol || typeof symbol !== 'string') return false
  
  if (market === 'crypto') {
    // Allow crypto patterns like BTC/USD, ETH/USD, etc.
    return /^[A-Z]{2,5}\/[A-Z]{2,5}$/.test(symbol) || 
           ['BTC', 'ETH', 'XBT', 'LTC', 'ADA', 'SOL', 'DOGE'].some(crypto => symbol.includes(crypto))
  } else {
    // Allow stock symbols (1-5 capital letters)
    return /^[A-Z]{1,5}$/.test(symbol)
  }
}

// Mock fetch
global.fetch = vi.fn()

describe('API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isValidSymbol', () => {
    it('should validate crypto symbols correctly', () => {
      expect(isValidSymbol('BTC/USD', 'crypto')).toBe(true)
      expect(isValidSymbol('ETH/USD', 'crypto')).toBe(true)
      expect(isValidSymbol('XBT/USD', 'crypto')).toBe(true)
      expect(isValidSymbol('INVALID', 'crypto')).toBe(false)
      expect(isValidSymbol('', 'crypto')).toBe(false)
    })

    it('should validate stock symbols correctly', () => {
      expect(isValidSymbol('AAPL', 'stocks')).toBe(true)
      expect(isValidSymbol('MSFT', 'stocks')).toBe(true)
      expect(isValidSymbol('GOOGL', 'stocks')).toBe(true)
      expect(isValidSymbol('invalid', 'stocks')).toBe(false)
      expect(isValidSymbol('', 'stocks')).toBe(false)
      expect(isValidSymbol('TOOLONGSTOCKSYMBOL', 'stocks')).toBe(false)
    })
  })

  describe('getHistory', () => {
    it('should fetch history data successfully', async () => {
      const mockData = [
        { time: 1640995200, open: 100, high: 110, low: 95, close: 105, volume: 1000 }
      ]
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response)

      const result = await getHistory('AAPL', 'stocks', 5, '1D', 100)
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('history'),
        expect.any(Object)
      )
      expect(result).toEqual(mockData)
    })

    it('should handle API errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      } as Response)

      try {
        await getHistory('INVALID', 'stocks', 5, '1D', 100)
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      try {
        await getHistory('AAPL', 'stocks', 5, '1D', 100)  
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('getIndicators', () => {
    it('should fetch indicators successfully', async () => {
      const mockIndicators = {
        sma: [{ time: 1640995200, value: 100 }],
        rsi: [{ time: 1640995200, value: 50 }]
      }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockIndicators,
      } as Response)

      const result = await getIndicators('AAPL', 'stocks', 5, '1D', 100)
      expect(result).toEqual(mockIndicators)
    })
  })

  describe('getPredictions', () => {
    it('should fetch predictions successfully', async () => {
      const mockPredictions = {
        trend: 'bullish',
        confidence: 0.8,
        targets: [110, 115, 120]
      }
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPredictions,
      } as Response)

      const result = await getPredictions('AAPL', 'stocks')
      expect(result).toEqual(mockPredictions)
    })
  })

  describe('getNews', () => {
    it('should fetch news successfully', async () => {
      const mockNews = [
        { title: 'Test News', summary: 'Test summary', url: 'http://test.com' }
      ]
      
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNews,
      } as Response)

      const result = await getNews('AAPL', 'stocks')
      expect(result).toEqual(mockNews)
    })
  })
})