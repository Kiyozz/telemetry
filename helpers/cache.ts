import cacheManager, { Cache, CacheOptions, StoreConfig } from 'cache-manager'
import redisStore from 'cache-manager-redis-store'

let cache: Cache

function createCache(): Cache {
  const options: StoreConfig & CacheOptions = {
    store: redisStore,
    url: process.env.REDIS_URL,
    ttl: 3,
  }

  return cacheManager.caching(options)
}

if (process.env.NODE_ENV === 'production') {
  cache = createCache()
} else {
  if (!((global as unknown) as { cacheManagerRedis: Cache }).cacheManagerRedis) {
    ;((global as unknown) as { cacheManagerRedis: Cache }).cacheManagerRedis = createCache()
  }
  cache = ((global as unknown) as { cacheManagerRedis: Cache }).cacheManagerRedis
}

export enum CacheKey {
  AppOne = 'app-one',
  Apps = 'apps',
}

export default cache
