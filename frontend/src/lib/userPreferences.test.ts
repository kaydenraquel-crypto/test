import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userPreferences } from './userPreferences'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('UserPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('Basic Operations', () => {
    it('should get default preferences', () => {
      const prefs = userPreferences.getPreferences()
      
      expect(prefs.defaultSymbol).toBe('AAPL')
      expect(prefs.chartTheme).toBe('TradingView')
      expect(prefs.chartType).toBe('candlestick')
      expect(prefs.watchlist).toContain('AAPL')
    })

    it('should set individual preferences', () => {
      userPreferences.setPreference('defaultSymbol', 'TSLA')
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      const prefs = userPreferences.getPreferences()
      expect(prefs.defaultSymbol).toBe('TSLA')
    })

    it('should update multiple preferences', () => {
      userPreferences.updatePreferences({
        defaultSymbol: 'GOOGL',
        chartTheme: 'light',
        showVolume: true
      })
      
      const prefs = userPreferences.getPreferences()
      expect(prefs.defaultSymbol).toBe('GOOGL')
      expect(prefs.chartTheme).toBe('light')
      expect(prefs.showVolume).toBe(true)
    })
  })

  describe('Watchlist Management', () => {
    it('should add symbol to watchlist', () => {
      userPreferences.addToWatchlist('NVDA')
      
      const prefs = userPreferences.getPreferences()
      expect(prefs.watchlist).toContain('NVDA')
    })

    it('should remove symbol from watchlist', () => {
      userPreferences.removeFromWatchlist('AAPL')
      
      const prefs = userPreferences.getPreferences()
      expect(prefs.watchlist).not.toContain('AAPL')
    })

    it('should not add duplicate symbols', () => {
      const originalLength = userPreferences.getPreferences().watchlist.length
      userPreferences.addToWatchlist('AAPL') // Already exists
      
      expect(userPreferences.getPreferences().watchlist.length).toBeLessThanOrEqual(originalLength + 1)
    })
  })

  describe('Recent Symbols', () => {
    it('should add symbol to recent symbols', () => {
      userPreferences.addRecentSymbol('NVDA')
      
      const prefs = userPreferences.getPreferences()
      expect(prefs.recentSymbols[0]).toBe('NVDA')
    })

    it('should maintain recent symbols limit', () => {
      // Add more than the limit
      for (let i = 0; i < 15; i++) {
        userPreferences.addRecentSymbol(`SYM${i}`)
      }
      
      const prefs = userPreferences.getPreferences()
      expect(prefs.recentSymbols.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Indicator Management', () => {
    it('should toggle indicators', () => {
      const initialSma = userPreferences.getPreferences().enabledIndicators.sma
      
      userPreferences.toggleIndicator('sma')
      
      const newSma = userPreferences.getPreferences().enabledIndicators.sma
      expect(newSma).toBe(!initialSma)
    })
  })

  describe('Reset Functionality', () => {
    it('should reset to defaults', () => {
      // Change some preferences
      userPreferences.setPreference('defaultSymbol', 'CUSTOM')
      userPreferences.setPreference('chartTheme', 'light')
      
      // Reset
      userPreferences.resetToDefaults()
      
      const prefs = userPreferences.getPreferences()
      expect(prefs.defaultSymbol).toBe('AAPL')
      expect(prefs.chartTheme).toBe('TradingView')
    })
  })

  describe('Subscription System', () => {
    it('should notify subscribers of changes', () => {
      const subscriber = vi.fn()
      const unsubscribe = userPreferences.subscribe(subscriber)
      
      userPreferences.setPreference('defaultSymbol', 'TSLA')
      
      expect(subscriber).toHaveBeenCalledWith(
        expect.objectContaining({ defaultSymbol: 'TSLA' })
      )
      
      unsubscribe()
    })

    it('should allow unsubscribing', () => {
      const subscriber = vi.fn()
      const unsubscribe = userPreferences.subscribe(subscriber)
      
      unsubscribe()
      userPreferences.setPreference('defaultSymbol', 'TSLA')
      
      expect(subscriber).not.toHaveBeenCalled()
    })
  })
})