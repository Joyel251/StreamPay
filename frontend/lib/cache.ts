/**
 * Simple in-memory cache for blockchain data
 * Can be upgraded to Redis/Vercel KV later
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()

  set<T>(key: string, data: T, ttl: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

// Singleton instance
export const cache = new MemoryCache()

// Auto cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000)
}

// Helper functions for common cache patterns
export const cacheHelpers = {
  // Cache employee data
  getEmployeeData: (address: string) => 
    cache.get<Record<string, unknown>>(`employee:${address}`),
  
  setEmployeeData: (address: string, data: Record<string, unknown>, ttl = 30000) => 
    cache.set(`employee:${address}`, data, ttl),
  
  // Cache contract balance
  getContractBalance: () => 
    cache.get<string>('contract:balance'),
  
  setContractBalance: (balance: string, ttl = 15000) => 
    cache.set('contract:balance', balance, ttl),
  
  // Cache price feeds (shorter TTL since they update frequently)
  getPriceData: (pair: string) => 
    cache.get<Record<string, unknown>>(`price:${pair}`),
  
  setPriceData: (pair: string, data: Record<string, unknown>, ttl = 5000) => 
    cache.set(`price:${pair}`, data, ttl),
}
