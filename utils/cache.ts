type CacheItem<T> = {
    data: T
    timestamp: number
  }
  
  const cache: { [key: string]: CacheItem<any> } = {}
  
  export function setCache<T>(key: string, data: T, expirationInSeconds: number): void {
    cache[key] = {
      data,
      timestamp: Date.now() + expirationInSeconds * 1000,
    }
  }
  
  export function getCache<T>(key: string): T | null {
    const item = cache[key]
    if (item && item.timestamp > Date.now()) {
      return item.data
    }
    return null
  }
  
  