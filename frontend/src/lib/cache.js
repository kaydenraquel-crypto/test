// Enhanced caching system for NovaSignal
export class IntelligentCache {
    constructor(options = {}) {
        this.cache = new Map();
        this.accessTimes = new Map();
        this.options = {
            defaultTTL: options.defaultTTL ?? 5 * 60 * 1000, // 5 minutes default
            maxSize: options.maxSize ?? 100,
            maxMemory: options.maxMemory ?? 50 * 1024 * 1024 // 50MB
        };
    }
    estimateSize(data) {
        try {
            return new Blob([JSON.stringify(data)]).size;
        }
        catch {
            return 1000; // Fallback estimate
        }
    }
    cleanup() {
        const now = Date.now();
        // Remove expired entries
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
                this.accessTimes.delete(key);
            }
        }
        // If still over size limit, remove least recently used entries
        if (this.cache.size > this.options.maxSize) {
            const sortedByAccess = Array.from(this.accessTimes.entries())
                .sort(([, a], [, b]) => a - b)
                .slice(0, this.cache.size - this.options.maxSize);
            for (const [key] of sortedByAccess) {
                this.cache.delete(key);
                this.accessTimes.delete(key);
            }
        }
    }
    set(key, data, ttl) {
        const now = Date.now();
        const expiry = now + (ttl ?? this.options.defaultTTL);
        const size = this.estimateSize(data);
        const entry = {
            data,
            timestamp: now,
            expiry,
            key,
            size
        };
        this.cache.set(key, entry);
        this.accessTimes.set(key, now);
        this.cleanup();
    }
    get(key) {
        const entry = this.cache.get(key);
        const now = Date.now();
        if (!entry) {
            return undefined;
        }
        if (now > entry.expiry) {
            this.cache.delete(key);
            this.accessTimes.delete(key);
            return undefined;
        }
        // Update access time for LRU
        this.accessTimes.set(key, now);
        return entry.data;
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            this.accessTimes.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        this.accessTimes.delete(key);
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
        this.accessTimes.clear();
    }
    size() {
        this.cleanup(); // Remove expired entries first
        return this.cache.size;
    }
    // Get cache statistics
    getStats() {
        const now = Date.now();
        let totalSize = 0;
        let expiredCount = 0;
        for (const entry of this.cache.values()) {
            totalSize += entry.size || 0;
            if (now > entry.expiry) {
                expiredCount++;
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
        };
    }
    // Get entries that will expire soon
    getExpiringEntries(withinMs = 60000) {
        const now = Date.now();
        const threshold = now + withinMs;
        return Array.from(this.cache.entries())
            .filter(([, entry]) => entry.expiry <= threshold && entry.expiry > now)
            .map(([key]) => key);
    }
}
// Specialized cache for different data types
export class TradingDataCache {
    constructor() {
        this.historyCache = new IntelligentCache({
            defaultTTL: 2 * 60 * 1000, // 2 minutes for OHLC data
            maxSize: 50
        });
        this.indicatorsCache = new IntelligentCache({
            defaultTTL: 1 * 60 * 1000, // 1 minute for indicators
            maxSize: 30
        });
        this.newsCache = new IntelligentCache({
            defaultTTL: 10 * 60 * 1000, // 10 minutes for news
            maxSize: 20
        });
        this.predictionsCache = new IntelligentCache({
            defaultTTL: 5 * 60 * 1000, // 5 minutes for predictions
            maxSize: 20
        });
    }
    // Generate cache keys
    getHistoryKey(symbol, market, interval, days) {
        return `history:${market}:${symbol}:${interval}m:${days}d`;
    }
    getIndicatorsKey(symbol, market, interval, limit) {
        return `indicators:${market}:${symbol}:${interval}m:${limit}`;
    }
    getNewsKey(symbol, market) {
        return `news:${market}:${symbol}`;
    }
    getPredictionsKey(symbol, market, interval) {
        return `predictions:${market}:${symbol}:${interval}m`;
    }
    // History methods
    getHistory(symbol, market, interval, days) {
        const key = this.getHistoryKey(symbol, market, interval, days);
        return this.historyCache.get(key);
    }
    setHistory(symbol, market, interval, days, data) {
        const key = this.getHistoryKey(symbol, market, interval, days);
        this.historyCache.set(key, data);
    }
    // Indicators methods
    getIndicators(symbol, market, interval, limit) {
        const key = this.getIndicatorsKey(symbol, market, interval, limit);
        return this.indicatorsCache.get(key);
    }
    setIndicators(symbol, market, interval, limit, data) {
        const key = this.getIndicatorsKey(symbol, market, interval, limit);
        this.indicatorsCache.set(key, data);
    }
    // News methods
    getNews(symbol, market) {
        const key = this.getNewsKey(symbol, market);
        return this.newsCache.get(key);
    }
    setNews(symbol, market, data) {
        const key = this.getNewsKey(symbol, market);
        this.newsCache.set(key, data);
    }
    // Predictions methods
    getPredictions(symbol, market, interval) {
        const key = this.getPredictionsKey(symbol, market, interval);
        return this.predictionsCache.get(key);
    }
    setPredictions(symbol, market, interval, data) {
        const key = this.getPredictionsKey(symbol, market, interval);
        this.predictionsCache.set(key, data);
    }
    // Bulk operations
    clearSymbolData(symbol, market) {
        const historyPattern = `history:${market}:${symbol}:`;
        const indicatorsPattern = `indicators:${market}:${symbol}:`;
        const newsKey = `news:${market}:${symbol}`;
        const predictionsPattern = `predictions:${market}:${symbol}:`;
        // Note: This is a simplified implementation
        // In a real implementation, you'd want to iterate through keys
        this.newsCache.delete(newsKey);
    }
    // Get overall statistics
    getStats() {
        return {
            history: this.historyCache.getStats(),
            indicators: this.indicatorsCache.getStats(),
            news: this.newsCache.getStats(),
            predictions: this.predictionsCache.getStats(),
            totalEntries: this.historyCache.getStats().size +
                this.indicatorsCache.getStats().size +
                this.newsCache.getStats().size +
                this.predictionsCache.getStats().size
        };
    }
}
// Global cache instance
export const tradingCache = new TradingDataCache();
// React hook for cache statistics
import { useState, useEffect } from 'react';
export function useCacheStats() {
    const [stats, setStats] = useState(tradingCache.getStats());
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(tradingCache.getStats());
        }, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);
    return stats;
}
