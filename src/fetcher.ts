/**
 * Fetcher is a small library on top of native [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/fetch) to make it easier
 * working with network requests.
 * @module
 */
import getData from "./get-data";
import InMemoryCache from "./in-memory-cache";
import * as MiddlewareManager from "./middleware-manager";
import { sendData } from "./send-data";
import type { CacheManager, CacheManagerSetterOptions, HttpError } from "./shared-types";

export type {
  CacheManager,
  CacheManagerSetterOptions,
  HttpError
};

let cache: CacheManager = InMemoryCache;

/**
 * Sets the [[CacheManager]] to use when using ttl in [[get]] requests.
 * By default **Fetcher** will use an in-memory cache.
 * @param manager Cache manager to use
 */
export function setCacheManager(manager: CacheManager): void {
  cache = manager;
}

/**
 * Represents the options you may use when using the different request types.
 * @param ttl Time to live in seconds
 * @param fetchOptions The [options](https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.requestinit.html) to pass to the native [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters)
 */
export type RequestOptions = {
  ttl?: number; // seconds
  fetchOptions?: RequestInit;
};

/**
 * Send a GET request to the given URL.
 * @param url
 * @param options
 * @typeParam T Type of the data to return
 * @returns The fetched data (response body)
 */
export function get<T>(url: string, options?: RequestOptions) {
  return getData<T>(url, {
    ttl: options?.ttl,
    fetchOptions: options?.fetchOptions,
    cache
  });
}

/**
 * Send a POST request to the given URL.
 * @param url
 * @param body
 * @param options
 * @typeParam T Type of the data to return
 * @returns The fetched data (response body)
 */
export function post<T>(url: string, body: object | string, options?: RequestOptions) {
  return sendData<T>(url, { method: 'POST', body, fetchOptions: options?.fetchOptions });
}

/**
 * Send a PUT request to the given URL.
 * @param url
 * @param body
 * @param options
 * @typeParam T Type of the data to return
 * @returns The fetched data (response body)
 */
export function put<T>(url: string, body: object | string, options?: RequestOptions) {
  return sendData<T>(url, { method: 'PUT', body, fetchOptions: options?.fetchOptions });
}

/**
 * Send a DELETE request to the given URL.
 * @param url
 * @param options
 * @typeParam T Type of the data to return
 * @returns The fetched data (response body)
 */
export function del<T>(url: string, options?: RequestOptions & { body?: object | string }) {
  return sendData<T>(url, {
    method: 'DELETE',
    body: options?.body,
    fetchOptions: options?.fetchOptions
  });
}

export function addMiddleware(type: 'before' | 'after', middleware: MiddlewareManager.Middleware ): void {
  MiddlewareManager.addMiddleware(type, middleware);
}

export function removeMiddleware(middleware: MiddlewareManager.Middleware ) {
  return MiddlewareManager.removeMiddleware(middleware);
}
