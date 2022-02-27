/**
 * In-memory cache manager.
 * Cached values will be lost after the page is reloaded.
 * @module
 */
import { CacheManager } from "./shared-types";

type CacheEntry = {
  value: unknown;
  expires: number; // expiration timestamp
}

const _cache = new Map<string, CacheEntry>();

const InMemoryCache: CacheManager = {
  /**
   * Returns the cached value for the given key if it exists.
   * In case the value were cached with a ttl and the ttl has expired,
   * the value will be removed from the cache and `undefined` will be returned.
   * @param key
   * @returns
   */
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

  /**
   * Stores the given value in the cache.
   * If a ttl is given, the value is expected to be the **seconds** to live.
   * @param key
   * @param value
   * @param options
   */
  set(key: string, value: unknown, options?: { ttl?: number }): void {
    _cache.set(key, {
      value,
      expires: Date.now() + ((options?.ttl || 0) * 1000)
    });
  }
};

export default InMemoryCache;
