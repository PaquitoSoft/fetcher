import { CacheManager } from "./shared-types";

type CacheEntry = {
  value: unknown;
  expires: number; // expiration timestamp
}

const _cache = new Map<string, CacheEntry>();

const InMemoryCache: CacheManager = {
  get(key: string): unknown {
    const cacheEntry = _cache.get(key);
    const now = Date.now();

    if (cacheEntry && now < cacheEntry.expires) {
      return cacheEntry.value;
    } else {
      _cache.delete(key);
      return undefined;
    }
  },

  set(key: string, value: unknown, options?: { ttl?: number }): void {
    _cache.set(key, {
      value,
      expires: Date.now() + ((options?.ttl || 0) * 1000)
    });
  }
};

export default InMemoryCache;
