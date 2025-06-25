// ============================================================================
// CACHE MANAGER - In-Memory Caching with TTL
// ============================================================================

import { exit } from "process";

interface CacheItem<T> {
  value: T;
  expiry: number;
  hits: number;
  createdAt: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 300000; // 5 minutes in milliseconds
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Clean up expired items every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public set<T>(key: string, value: T, ttlMs?: number): void {
    const expiry = Date.now() + (ttlMs || this.defaultTTL);
    this.cache.set(key, {
      value,
      expiry,
      hits: 0,
      createdAt: Date.now()
    });
  }

  public get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    item.hits++;
    return item.value as T;
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  } 

  public getStats(): {
    size: number;
    totalHits: number;
    averageAge: number;
    memoryUsage: string;
  } {
    let totalHits = 0;
    let totalAge = 0;
    const now = Date.now();
    
    for (const item of this.cache.values()) {
      totalHits += item.hits;
      totalAge += (now - item.createdAt);
    }
    
    const averageAge = this.cache.size > 0 ? totalAge / this.cache.size : 0;
    const memoryUsage = `${(JSON.stringify([...this.cache.entries()]).length / 1024).toFixed(2)} KB`;
    
    return {
      size: this.cache.size,
      totalHits,
      averageAge: Math.round(averageAge / 1000), // in seconds
      memoryUsage
    };
  }

  public getTopKeys(limit: number = 10): Array<{ key: string; hits: number }> {
    return [...this.cache.entries()]
      .map(([key, item]) => ({ key, hits: item.hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }

  // For testing purposes only
  public static resetInstance(): void {
    if (CacheManager.instance) {
      CacheManager.instance.destroy();
    }
    CacheManager.instance = null as any;
  }
}

// Usage Example
function demonstrateCache(): void {
  console.log('=== CACHE MANAGER DEMO ===');
  
  const cache = CacheManager.getInstance();
  
  // Cache different types of data
  cache.set('user:123', { name: 'John Doe', email: 'john@example.com' }, 60000);
  cache.set('api:weather', { temp: 25, humidity: 60 }, 30000);
  cache.set('config:theme', 'dark', 120000);
  
  // Retrieve cached data
  console.log('User data:', cache.get('user:123'));
  console.log('Weather data:', cache.get('api:weather'));
  console.log('Theme exists?', cache.has('config:theme'));
  
  // Access multiple times to increase hit count
  cache.get('user:123');
  cache.get('user:123');
  cache.get('api:weather');
  
  console.log('Cache stats:', cache.getStats());
  console.log('Top keys:', cache.getTopKeys(3));
  
  // Verify same instance
  const anotherCache = CacheManager.getInstance();
  console.log('Same cache instance?', cache === anotherCache);
  console.log();
}

// Testing Example
function testCache(): void {
  console.log('=== CACHE MANAGER TESTS ===');
  
  // Test 1: TTL expiration
  CacheManager.resetInstance();
  const cache1 = CacheManager.getInstance();
  cache1.set('shortLived', 'value', 100); // 100ms TTL
  console.log('Test 1 - Immediate get:', cache1.get('shortLived'));
  
  setTimeout(() => {
    console.log('Test 1 - After TTL expiry:', cache1.get('shortLived') || 'undefined');
  }, 150);
  
  // Test 2: Hit counting
  cache1.set('popular', 'data');
  cache1.get('popular');
  cache1.get('popular');
  cache1.get('popular');
  const stats = cache1.getStats();
  console.log('Test 2 - Total hits after 3 gets:', stats.totalHits >= 3);
  
  // Test 3: Memory usage calculation
  cache1.set('large', { data: new Array(100).fill('test') });
  const statsAfter = cache1.getStats();
  console.log('Test 3 - Memory usage tracked:', statsAfter.memoryUsage.includes('KB'));
  console.log();
}

// Run demonstrations
demonstrateCache();
testCache();

export { CacheManager, CacheItem };
exit(0); 