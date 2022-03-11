export interface HttpError extends Error {
  statusCode?: number;
  response?: Response;
  body?: unknown;
}

export type CacheManagerSetterOptions = {
  ttl?: number; // seconds
};

export interface CacheManager {
  get(key: string): unknown;
  set(key: string, value: unknown, options?: CacheManagerSetterOptions): void;
}

export type HTTPMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS'
  | 'CONNECT'
  | 'TRACE';
