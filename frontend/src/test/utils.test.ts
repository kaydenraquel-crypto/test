import { describe, it, expect } from 'vitest'

// Test utility functions that might be used throughout the app
describe('Utility Functions', () => {
  describe('Price Formatting', () => {
    const formatPrice = (price: number, decimals = 2): string => {
      return price.toFixed(decimals)
    }

    it('should format prices correctly', () => {
      expect(formatPrice(123.456)).toBe('123.46')
      expect(formatPrice(123.456, 3)).toBe('123.456')
      expect(formatPrice(0.001, 4)).toBe('0.0010')
    })

    it('should handle edge cases', () => {
      expect(formatPrice(0)).toBe('0.00')
      expect(formatPrice(-123.45)).toBe('-123.45')
      expect(formatPrice(Infinity)).toBe('Infinity')
    })
  })

  describe('Percentage Calculations', () => {
    const calculatePercentageChange = (oldValue: number, newValue: number): number => {
      if (oldValue === 0) return 0
      return ((newValue - oldValue) / oldValue) * 100
    }

    it('should calculate percentage change correctly', () => {
      expect(calculatePercentageChange(100, 110)).toBeCloseTo(10, 2)
      expect(calculatePercentageChange(100, 90)).toBeCloseTo(-10, 2)
      expect(calculatePercentageChange(50, 75)).toBeCloseTo(50, 2)
    })

    it('should handle edge cases', () => {
      expect(calculatePercentageChange(0, 100)).toBe(0)
      expect(calculatePercentageChange(100, 100)).toBe(0)
      expect(calculatePercentageChange(-100, -50)).toBeCloseTo(-50, 2)
    })
  })

  describe('Data Validation', () => {
    const isValidPrice = (price: any): boolean => {
      return typeof price === 'number' && !isNaN(price) && price >= 0
    }

    const isValidQuantity = (quantity: any): boolean => {
      return typeof quantity === 'number' && !isNaN(quantity) && quantity > 0
    }

    it('should validate prices correctly', () => {
      expect(isValidPrice(123.45)).toBe(true)
      expect(isValidPrice(0)).toBe(true)
      expect(isValidPrice(-1)).toBe(false)
      expect(isValidPrice('123')).toBe(false)
      expect(isValidPrice(NaN)).toBe(false)
      expect(isValidPrice(null)).toBe(false)
      expect(isValidPrice(undefined)).toBe(false)
    })

    it('should validate quantities correctly', () => {
      expect(isValidQuantity(10)).toBe(true)
      expect(isValidQuantity(0.5)).toBe(true)
      expect(isValidQuantity(0)).toBe(false)
      expect(isValidQuantity(-1)).toBe(false)
      expect(isValidQuantity('10')).toBe(false)
      expect(isValidQuantity(NaN)).toBe(false)
    })
  })

  describe('Array Utilities', () => {
    const getLastN = <T>(array: T[], n: number): T[] => {
      return array.slice(-n)
    }

    const removeDuplicates = <T>(array: T[]): T[] => {
      return [...new Set(array)]
    }

    it('should get last N elements', () => {
      const arr = [1, 2, 3, 4, 5]
      expect(getLastN(arr, 3)).toEqual([3, 4, 5])
      expect(getLastN(arr, 0)).toEqual([])
      expect(getLastN(arr, 10)).toEqual([1, 2, 3, 4, 5])
      expect(getLastN([], 5)).toEqual([])
    })

    it('should remove duplicates', () => {
      expect(removeDuplicates([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
      expect(removeDuplicates(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
      expect(removeDuplicates([])).toEqual([])
      expect(removeDuplicates([1])).toEqual([1])
    })
  })

  describe('Date Utilities', () => {
    const formatDate = (timestamp: number): string => {
      return new Date(timestamp).toLocaleDateString()
    }

    const isToday = (timestamp: number): boolean => {
      const today = new Date()
      const date = new Date(timestamp)
      return today.toDateString() === date.toDateString()
    }

    it('should format dates correctly', () => {
      const timestamp = new Date('2023-01-15').getTime()
      expect(formatDate(timestamp)).toMatch(/1\/15\/2023|15\/1\/2023|2023\/1\/15/)
    })

    it('should check if date is today', () => {
      const now = Date.now()
      const yesterday = now - 24 * 60 * 60 * 1000
      
      expect(isToday(now)).toBe(true)
      expect(isToday(yesterday)).toBe(false)
    })
  })

  describe('URL Utilities', () => {
    const buildApiUrl = (base: string, endpoint: string, params?: Record<string, any>): string => {
      const url = new URL(endpoint, base)
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value))
          }
        })
      }
      return url.toString()
    }

    it('should build API URLs correctly', () => {
      const base = 'http://localhost:8000'
      expect(buildApiUrl(base, '/api/test')).toBe('http://localhost:8000/api/test')
      
      const withParams = buildApiUrl(base, '/api/test', { symbol: 'AAPL', interval: 5 })
      expect(withParams).toBe('http://localhost:8000/api/test?symbol=AAPL&interval=5')
    })

    it('should handle undefined and null params', () => {
      const base = 'http://localhost:8000'
      const url = buildApiUrl(base, '/api/test', { 
        symbol: 'AAPL', 
        interval: undefined, 
        provider: null 
      })
      expect(url).toBe('http://localhost:8000/api/test?symbol=AAPL')
    })
  })

  describe('Number Utilities', () => {
    const clamp = (value: number, min: number, max: number): number => {
      return Math.min(Math.max(value, min), max)
    }

    const roundToDecimal = (value: number, decimals: number): number => {
      return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
    }

    it('should clamp values correctly', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('should round to decimal places correctly', () => {
      expect(roundToDecimal(3.14159, 2)).toBe(3.14)
      expect(roundToDecimal(3.14159, 4)).toBe(3.1416)
      expect(roundToDecimal(10, 2)).toBe(10)
    })
  })

  describe('Color Utilities', () => {
    const hexToRgb = (hex: string): { r: number, g: number, b: number } | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    const getContrastColor = (bgColor: string): string => {
      const rgb = hexToRgb(bgColor)
      if (!rgb) return '#000000'
      
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
      return brightness > 128 ? '#000000' : '#ffffff'
    }

    it('should convert hex to RGB correctly', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000ff')).toEqual({ r: 0, g: 0, b: 255 })
      expect(hexToRgb('invalid')).toBeNull()
    })

    it('should determine contrast color correctly', () => {
      expect(getContrastColor('#ffffff')).toBe('#000000') // White background -> black text
      expect(getContrastColor('#000000')).toBe('#ffffff') // Black background -> white text
      expect(getContrastColor('#ff0000')).toBe('#ffffff') // Red background -> white text
    })
  })
})