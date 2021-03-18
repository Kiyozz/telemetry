import cacheManager, { Cache } from 'cache-manager'
import redisStore from 'cache-manager-redis-store'

let cache: Cache

function createCache(): Cache {
  return cacheManager.caching({
    store: redisStore,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    ttl: 3,
  })
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
