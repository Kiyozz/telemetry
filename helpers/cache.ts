import cacheManagerLibrary, { Cache, CacheOptions, StoreConfig } from 'cache-manager'
import redisStore from 'cache-manager-redis-store'

let cacheRedis: Cache

function createCache(): Cache {
  const options: StoreConfig & CacheOptions = {
    store: redisStore,
    url: process.env.REDIS_URL,
    ttl: 3,
  }

  return cacheManagerLibrary.caching(options)
}

if (process.env.NODE_ENV === 'production') {
  cacheRedis = createCache()
} else {
  if (!((global as unknown) as { cacheManagerRedis: Cache }).cacheManagerRedis) {
    ;((global as unknown) as { cacheManagerRedis: Cache }).cacheManagerRedis = createCache()
  }
  cacheRedis = ((global as unknown) as { cacheManagerRedis: Cache }).cacheManagerRedis
}

class CacheManager {
  constructor(private cache: Cache) {}

  deleteAllApps(): void {
    this.cache.del(CacheKey.Apps)
  }

  deleteAppViaKey(key: string): void {
    this.cache.del(`${CacheKey.AppOne}-${key}`)
  }

  getAppViaKey<T>(key: string): Promise<T> {
    return this.cache.get<T>(`${CacheManager.getKeyAppOne(key)}`)
  }

  setAppViaKey(key: string, payload: unknown): void {
    this.cache.set(CacheManager.getKeyAppOne(key), payload, { ttl: 0 })
  }

  getApps<T>(): Promise<T> {
    return this.cache.get<T>(CacheManager.getKeyApps())
  }

  setApps(payload: unknown) {
    this.cache.set(CacheManager.getKeyApps(), payload, { ttl: 0 })
  }

  reset(): Promise<void> {
    return this.cache.reset()
  }

  private static getKeyAppOne(key: string): string {
    return `${CacheKey.AppOne}-${key}`
  }

  private static getKeyApps(): string {
    return CacheKey.Apps
  }
}

const cache = new CacheManager(cacheRedis)

export enum CacheKey {
  AppOne = 'app-one',
  Apps = 'apps',
}

export default cache
