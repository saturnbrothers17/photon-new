// Performance cache system for faster navigation
class PerformanceCache {
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  // Cache data with TTL
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  // Get cached data if not expired
  get(key: string): any | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  // Check if data exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export const performanceCache = new PerformanceCache();

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    performanceCache.cleanup();
  }, 5 * 60 * 1000);
}