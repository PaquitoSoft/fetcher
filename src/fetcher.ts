// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
  // import "core-js/fn/array.find"
  // ...

import getData from "./get-data";
import InMemoryCache from "./in-memory-cache";
import { sendData } from "./send-data";
import { CacheManager } from "./shared-types";

let cache: CacheManager = InMemoryCache;

export function setCacheManager(manager: CacheManager): void {
  cache = manager;
}

type RequestOptions = {
  ttl?: number; // seconds
  fetchOptions?: RequestInit;
};

export function get(url: string, options?: RequestOptions) {
  return getData(url, {
    ttl: options?.ttl,
    fetchOptions: options?.fetchOptions,
    cache
  });
}

export function post(url: string, body: object | string, options?: RequestOptions) {
  return sendData(url, { method: 'POST', body, fetchOptions: options?.fetchOptions });
}

export function put(url: string, body: object | string, options?: RequestOptions) {
  return sendData(url, { method: 'PUT', body, fetchOptions: options?.fetchOptions });
}
export function del(url: string, options?: RequestOptions & { body?: object | string }) {
  return sendData(url, {
    method: 'DELETE',
    body: options?.body,
    fetchOptions: options?.fetchOptions
  });
}
