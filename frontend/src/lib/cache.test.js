import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntelligentCache } from './cache';
describe('IntelligentCache', () => {
    let cache;
    beforeEach(() => {
        vi.clearAllTimers();
        cache = new IntelligentCache({ defaultTTL: 60000, maxSize: 3 });
    });
    describe('Basic Operations', () => {
        it('should store and retrieve data', () => {
            const testData = { value: 'test' };
            cache.set('test-key', testData);
            expect(cache.get('test-key')).toEqual(testData);
        });
        it('should return undefined for non-existent keys', () => {
            expect(cache.get('non-existent')).toBeUndefined();
        });
        it('should check if key exists', () => {
            cache.set('test-key', { data: 'test' });
            expect(cache.has('test-key')).toBe(true);
            expect(cache.has('non-existent')).toBe(false);
        });
        it('should delete entries', () => {
            cache.set('test-key', { data: 'test' });
            expect(cache.has('test-key')).toBe(true);
            cache.delete('test-key');
            expect(cache.has('test-key')).toBe(false);
        });
        it('should clear all entries', () => {
            cache.set('key1', { data: 'test1' });
            cache.set('key2', { data: 'test2' });
            expect(cache.size()).toBe(2);
            cache.clear();
            expect(cache.size()).toBe(0);
        });
    });
    describe('TTL (Time To Live)', () => {
        it('should expire entries after TTL', () => {
            cache.set('test-key', { data: 'test' });
            expect(cache.get('test-key')).toEqual({ data: 'test' });
            // Advance time beyond TTL (60000ms)
            vi.advanceTimersByTime(61000);
            expect(cache.get('test-key')).toBeUndefined();
        });
        it('should not expire entries before TTL', () => {
            cache.set('test-key', { data: 'test' });
            // Advance time but not beyond TTL
            vi.advanceTimersByTime(30000); // 30 seconds
            expect(cache.get('test-key')).toEqual({ data: 'test' });
        });
        it('should use custom TTL when provided', () => {
            cache.set('test-key', { data: 'test' }, 10000); // 10 second TTL
            vi.advanceTimersByTime(15000); // 15 seconds
            expect(cache.get('test-key')).toBeUndefined();
        });
    });
    describe('LRU Eviction', () => {
        it('should evict least recently used entries when max size is reached', () => {
            cache.set('key1', { data: 'test1' });
            cache.set('key2', { data: 'test2' });
            cache.set('key3', { data: 'test3' });
            expect(cache.size()).toBe(3);
            // Add one more to trigger eviction
            cache.set('key4', { data: 'test4' });
            expect(cache.size()).toBe(3);
            expect(cache.has('key1')).toBe(false); // Should be evicted (least recently used)
            expect(cache.has('key2')).toBe(true);
            expect(cache.has('key3')).toBe(true);
            expect(cache.has('key4')).toBe(true);
        });
        it('should update access order when getting entries', () => {
            cache.set('key1', { data: 'test1' });
            cache.set('key2', { data: 'test2' });
            cache.set('key3', { data: 'test3' });
            // Access key1 to make it recently used
            cache.get('key1');
            // Add new entry to trigger eviction
            cache.set('key4', { data: 'test4' });
            expect(cache.has('key1')).toBe(true); // Should not be evicted (recently accessed)
            expect(cache.has('key2')).toBe(false); // Should be evicted (least recently used)
        });
    });
    describe('Cache Statistics', () => {
        it('should track cache statistics', () => {
            cache.set('key1', { data: 'test1' });
            cache.set('key2', { data: 'test2' });
            expect(cache.size()).toBe(2);
            // Test hit and miss tracking
            cache.get('key1'); // hit
            cache.get('key1'); // hit
            cache.get('non-existent'); // miss
            const stats = cache.getStats();
            expect(stats.size).toBe(2);
            expect(stats.hits).toBe(2);
            expect(stats.misses).toBe(1);
        });
    });
});
