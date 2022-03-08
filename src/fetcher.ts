/**
 * Fetcher is a small library on top of native [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/fetch) to make it easier
 * working with network requests.
 * @module
 */
import InMemoryCache from "./in-memory-cache";
import {
  Middleware,
  BeforeMiddleware,
  RequestMiddlewareOptions,
  BeforeMiddlewareResult,
  AfterMiddleware,
  addMiddleware as _addMiddleware,
  removeMiddleware as _removeMiddleware
} from "./middleware-manager";
import sendRequest from "./send-request";
import { CacheManager, CacheManagerSetterOptions, HttpError, HTTPMethod } from "./shared-types";

export type {
  CacheManager,
  CacheManagerSetterOptions,
  HttpError,
  HTTPMethod,
  Middleware,
  BeforeMiddleware,
  AfterMiddleware,
  RequestMiddlewareOptions,
  BeforeMiddlewareResult
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
 * @returns Fetched data (response body)
 */
export function get<T>(url: string, options?: RequestOptions) {
  return sendRequest<T>(url, {
    method: 'GET',
    fetchOptions: options?.fetchOptions,
    ttl: options?.ttl, // seconds
    cache
  });
}

/**
 * Send a POST request to the given URL.
 * @param url
 * @param body
 * @param options
 * @typeParam T Type of the data to return
 * @returns Fetched data (response body)
 */
export function post<T>(url: string, body: object | string, options?: RequestOptions) {
  return sendRequest<T>(url, {
    method: 'POST',
    fetchOptions: options?.fetchOptions,
    body
  });
}

/**
 * Send a PUT request to the given URL.
 * @param url
 * @param body
 * @param options
 * @typeParam T Type of the data to return
 * @returns Fetched data (response body)
 */
export function put<T>(url: string, body: object | string, options?: RequestOptions) {
  return sendRequest<T>(url, {
    method: 'PUT',
    fetchOptions: options?.fetchOptions,
    body
  });
}

/**
 * Send a DELETE request to the given URL.
 * @param url
 * @param options
 * @typeParam T Type of the data to return
 * @returns Fetched data (response body)
 */
export function del<T>(url: string, options?: RequestOptions & { body?: object | string }) {
  return sendRequest<T>(url, {
    method: 'DELETE',
    fetchOptions: options?.fetchOptions,
    body: options?.body
  });
}

/**
 * Send a request to the given URL using the given HTTP method.
 * @param url
 * @param method
 * @param options
 * @typeParam T Type of the data to return
 * @returns Fetched data (response body)
 */

export function send<T>(
  url: string,
  method: HTTPMethod,
  options?: RequestOptions & { body?: object | string }
) {
  return sendRequest<T>(url, {
    method,
    fetchOptions: options?.fetchOptions,
    body: options?.body,
    ttl: options?.ttl, // seconds
    cache
  });
}

/**
 * Add a middleware to be executed before or after every request.
 * @param type 'before' or 'after'
 * @param middleware Middleware to add
 * @returns void
 */
export function addMiddleware(type: 'before' | 'after', middleware: Middleware ): void {
  _addMiddleware(type, middleware);
}

/**
 * Remove a middleware from the list of middlewares.
 * (it will look for it both in 'before' and 'after' middlewares)
 * @param middleware Middleware to remove
 * @returns removed middleware if it really existed
 */
export function removeMiddleware(middleware: Middleware ): Middleware | undefined {
  return _removeMiddleware(middleware);
}
