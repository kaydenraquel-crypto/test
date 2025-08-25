import { describe, it, expect, beforeEach } from 'vitest'
import { IntelligentCache } from './cache'

describe('IntelligentCache', () => {
  let cache: IntelligentCache<any>

  beforeEach(() => {
    cache = new IntelligentCache({ defaultTTL: 60000, maxSize: 3 })
  })

  describe('Basic Operations', () => {
    it('should store and retrieve data', () => {
      const testData = { value: 'test' }
      cache.set('test-key', testData)
      
      expect(cache.get('test-key')).toEqual(testData)
    })

    it('should return undefined for non-existent keys', () => {
      expect(cache.get('non-existent')).toBeUndefined()
    })

    it('should check if key exists', () => {
      cache.set('test-key', { data: 'test' })
      
      expect(cache.has('test-key')).toBe(true)
      expect(cache.has('non-existent')).toBe(false)
    })

    it('should delete entries', () => {
      cache.set('test-key', { data: 'test' })
      expect(cache.has('test-key')).toBe(true)
      
      cache.delete('test-key')
      expect(cache.has('test-key')).toBe(false)
    })

    it('should clear all entries', () => {
      cache.set('key1', { data: 'test1' })
      cache.set('key2', { data: 'test2' })
      
      expect(cache.size()).toBe(2)
      
      cache.clear()
      expect(cache.size()).toBe(0)
    })
  })

  describe('TTL (Time To Live)', () => {
    it('should expire entries after TTL', () => {
      const cache = new IntelligentCache({ defaultTTL: -1000, maxSize: 3 }) // Past expiry
      cache.set('test-key', { data: 'test' })
      
      // Entry should be expired immediately since TTL is in the past
      expect(cache.get('test-key')).toBeUndefined()
    })

    it('should not expire entries before TTL', () => {
      cache.set('test-key', { data: 'test' }, 10000) // 10 second TTL
      
      // Should still be available immediately
      expect(cache.get('test-key')).toEqual({ data: 'test' })
    })

    it('should use custom TTL when provided', () => {
      cache.set('test-key', { data: 'test' }, 10000) // Custom 10 second TTL
      
      // Should be available with custom TTL
      expect(cache.get('test-key')).toEqual({ data: 'test' })
    })
  })

  describe('LRU Eviction', () => {
    it('should evict least recently used entries when max size is reached', () => {
      cache.set('key1', { data: 'test1' })
      cache.set('key2', { data: 'test2' })
      cache.set('key3', { data: 'test3' })
      
      expect(cache.size()).toBe(3)
      
      // Add one more to trigger eviction
      cache.set('key4', { data: 'test4' })
      
      expect(cache.size()).toBe(3)
      expect(cache.has('key1')).toBe(false) // Should be evicted (least recently used)
      expect(cache.has('key2')).toBe(true)
      expect(cache.has('key3')).toBe(true)
      expect(cache.has('key4')).toBe(true)
    })

    it('should update access order when getting entries', () => {
      cache.set('key1', { data: 'test1' })
      cache.set('key2', { data: 'test2' })
      cache.set('key3', { data: 'test3' })
      
      // Access key1 to make it recently used
      cache.get('key1')
      
      // Add new entry to trigger eviction
      cache.set('key4', { data: 'test4' })
      
      expect(cache.has('key1')).toBe(true) // Should not be evicted (recently accessed)
      expect(cache.has('key2')).toBe(false) // Should be evicted (least recently used)
    })
  })

  describe('Cache Statistics', () => {
    it('should track cache statistics', () => {
      cache.set('key1', { data: 'test1' })
      cache.set('key2', { data: 'test2' })
      
      expect(cache.size()).toBe(2)
      
      const stats = cache.getStats()
      expect(stats.size).toBe(2)
      expect(stats.totalSize).toBeGreaterThan(0)
      expect(stats.expiredCount).toBe(0)
    })
  })
})