export interface HttpError extends Error {
  statusCode?: number;
  response?: Response;
}

type CacheManagerSetterOptions = {
  ttl?: number; // seconds
};

export interface CacheManager {
  get(key: string): unknown;
  set(key: string, value: unknown, options?: CacheManagerSetterOptions): void;
}
