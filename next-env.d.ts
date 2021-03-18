/// <reference types="next" />
/// <reference types="next/types/global" />

import { Store } from 'cache-manager'

declare module 'cache-manager-redis-store' {
  declare const redisStore: Store

  export = redisStore
}
