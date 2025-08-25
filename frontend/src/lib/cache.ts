// Enhanced caching system for NovaSignal

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
  key: string
  size?: number
}

export interface CacheOptions {
  defaultTTL?: number // Time to live in milliseconds
  maxSize?: number    // Maximum number of entries
  maxMemory?: number  // Maximum memory usage in bytes (estimated)
}

export class IntelligentCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private accessTimes = new Map<string, number>()
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.options = {
      defaultTTL: options.defaultTTL ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize ?? 100,
      maxMemory: options.maxMemory ?? 50 * 1024 * 1024 // 50MB
    }
  }

  private estimateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      return 1000 // Fallback estimate
    }
  }

  private cleanup() {
    const now = Date.now()
    
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key)
        this.accessTimes.delete(key)
      }
    }

    // If still over size limit, remove least recently used entries
    if (this.cache.size > this.options.maxSize) {
      const sortedByAccess = Array.from(this.accessTimes.entries())
        .sort(([,a], [,b]) => a - b)
        .slice(0, this.cache.size - this.options.maxSize)

      for (const [key] of sortedByAccess) {
        this.cache.delete(key)
        this.accessTimes.delete(key)
      }
    }
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiry = now + (ttl ?? this.options.defaultTTL)
    const size = this.estimateSize(data)

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiry,
      key,
      size
    }

    this.cache.set(key, entry)
    this.accessTimes.set(key, now)

    this.cleanup()
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    const now = Date.now()

    if (!entry) {
      return undefined
    }

    if (now > entry.expiry) {
      this.cache.delete(key)
      this.accessTimes.delete(key)
      return undefined
    }

    // Update access time for LRU
    this.accessTimes.set(key, now)
    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      this.accessTimes.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    this.accessTimes.delete(key)
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.accessTimes.clear()
  }

  size(): number {
    this.cleanup() // Remove expired entries first
    return this.cache.size
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let totalSize = 0
    let expiredCount = 0

    for (const entry of this.cache.values()) {
      totalSize += entry.size || 0
      if (now > entry.expiry) {
        expiredCount++
      }
    }

    return {
      size: this.cache.size,
      totalSize,
      expiredCount,
      hitRate: 0, // TODO: Track hit rate
      memoryUsage: totalSize,
      maxMemory: this.options.maxMemory,
      maxSize: this.options.maxSize
    }
  }

  // Get entries that will expire soon
  getExpiringEntries(withinMs: number = 60000): string[] {
    const now = Date.now()
    const threshold = now + withinMs

    return Array.from(this.cache.entries())
      .filter(([, entry]) => entry.expiry <= threshold && entry.expiry > now)
      .map(([key]) => key)
  }
}

// Specialized cache for different data types
export class TradingDataCache {
  private historyCache = new IntelligentCache<any[]>({
    defaultTTL: 10 * 1000, // 10 seconds for OHLC data (debug mode)
    maxSize: 50
  })

  private indicatorsCache = new IntelligentCache<any>({
    defaultTTL: 1 * 60 * 1000, // 1 minute for indicators
    maxSize: 30
  })

  private newsCache = new IntelligentCache<any[]>({
    defaultTTL: 10 * 60 * 1000, // 10 minutes for news
    maxSize: 20
  })

  private predictionsCache = new IntelligentCache<any>({
    defaultTTL: 5 * 60 * 1000, // 5 minutes for predictions
    maxSize: 20
  })

  // Generate cache keys
  private getHistoryKey(symbol: string, market: string, interval: number, days: number): string {
    return `history:${market}:${symbol}:${interval}m:${days}d`
  }

  private getIndicatorsKey(symbol: string, market: string, interval: number, limit: number): string {
    return `indicators:${market}:${symbol}:${interval}m:${limit}`
  }

  private getNewsKey(symbol: string, market: string): string {
    return `news:${market}:${symbol}`
  }

  private getPredictionsKey(symbol: string, market: string, interval: number): string {
    return `predictions:${market}:${symbol}:${interval}m`
  }

  // History methods
  getHistory(symbol: string, market: string, interval: number, days: number): any[] | undefined {
    const key = this.getHistoryKey(symbol, market, interval, days)
    return this.historyCache.get(key)
  }

  setHistory(symbol: string, market: string, interval: number, days: number, data: any[]): void {
    const key = this.getHistoryKey(symbol, market, interval, days)
    this.historyCache.set(key, data)
  }

  // Indicators methods
  getIndicators(symbol: string, market: string, interval: number, limit: number): any | undefined {
    const key = this.getIndicatorsKey(symbol, market, interval, limit)
    return this.indicatorsCache.get(key)
  }

  setIndicators(symbol: string, market: string, interval: number, limit: number, data: any): void {
    const key = this.getIndicatorsKey(symbol, market, interval, limit)
    this.indicatorsCache.set(key, data)
  }

  // News methods
  getNews(symbol: string, market: string): any[] | undefined {
    const key = this.getNewsKey(symbol, market)
    return this.newsCache.get(key)
  }

  setNews(symbol: string, market: string, data: any[]): void {
    const key = this.getNewsKey(symbol, market)
    this.newsCache.set(key, data)
  }

  // Predictions methods
  getPredictions(symbol: string, market: string, interval: number): any | undefined {
    const key = this.getPredictionsKey(symbol, market, interval)
    return this.predictionsCache.get(key)
  }

  setPredictions(symbol: string, market: string, interval: number, data: any): void {
    const key = this.getPredictionsKey(symbol, market, interval)
    this.predictionsCache.set(key, data)
  }

  // Bulk operations
  clearSymbolData(symbol: string, market: string): void {
    const historyPattern = `history:${market}:${symbol}:`
    const indicatorsPattern = `indicators:${market}:${symbol}:`
    const newsKey = `news:${market}:${symbol}`
    const predictionsPattern = `predictions:${market}:${symbol}:`

    // Note: This is a simplified implementation
    // In a real implementation, you'd want to iterate through keys
    this.newsCache.delete(newsKey)
  }

  // Get overall statistics
  getStats() {
    return {
      history: this.historyCache.getStats(),
      indicators: this.indicatorsCache.getStats(),
      news: this.newsCache.getStats(),
      predictions: this.predictionsCache.getStats(),
      totalEntries: 
        this.historyCache.getStats().size +
        this.indicatorsCache.getStats().size +
        this.newsCache.getStats().size +
        this.predictionsCache.getStats().size
    }
  }
}

// Global cache instance
export const tradingCache = new TradingDataCache()

// React hook for cache statistics
import { useState, useEffect } from 'react'

export function useCacheStats() {
  const [stats, setStats] = useState(tradingCache.getStats())

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(tradingCache.getStats())
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return stats
}