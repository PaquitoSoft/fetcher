import getData from "./get-data";
import InMemoryCache from "./in-memory-cache";
import { sendData } from "./send-data";
import { CacheManager, CacheManagerSetterOptions, HttpError } from "./shared-types";

export type {
  CacheManager,
  CacheManagerSetterOptions,
  HttpError
};

let cache: CacheManager = InMemoryCache;

export function setCacheManager(manager: CacheManager): void {
  cache = manager;
}

export type RequestOptions = {
  ttl?: number; // seconds
  fetchOptions?: RequestInit;
};

export function get<T>(url: string, options?: RequestOptions) {
  return getData<T>(url, {
    ttl: options?.ttl,
    fetchOptions: options?.fetchOptions,
    cache
  });
}

export function post<T>(url: string, body: object | string, options?: RequestOptions) {
  return sendData<T>(url, { method: 'POST', body, fetchOptions: options?.fetchOptions });
}

export function put<T>(url: string, body: object | string, options?: RequestOptions) {
  return sendData<T>(url, { method: 'PUT', body, fetchOptions: options?.fetchOptions });
}

export function del<T>(url: string, options?: RequestOptions & { body?: object | string }) {
  return sendData<T>(url, {
    method: 'DELETE',
    body: options?.body,
    fetchOptions: options?.fetchOptions
  });
}
