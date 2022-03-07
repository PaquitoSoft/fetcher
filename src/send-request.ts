import { runAfterMiddlewares, runBeforeMiddlewares } from './middleware-manager';
import parseResponse from './response-parser';
import { CacheManager, HttpError, HTTPMethod } from './shared-types';

export type RequestOptions = {
  method?: HTTPMethod; // default GET
  fetchOptions?: RequestInit;
  body?: object | string;
  ttl?: number; // seconds
  cache?: CacheManager;
};

const NON_CACHEABLE_HTTP_METHODS = ['POST', 'PUT', 'DELETE'];

function headersToObject(headers: HeadersInit): Record<string, string> {
  if (headers instanceof Headers) {
    return Array.from(headers.entries()).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  } else if (Array.isArray(headers)) {
    return headers.reduce<Record<string, string>>((acc, [key, values]) => {
      acc[key] = Array.isArray(values) ? values.join(',') : values;
      return acc;
    }, {});
  } else {
    return headers;
  }
}

export default async function sendRequest<T>(
  url: string,
  { method = 'GET', fetchOptions, body, ttl, cache }: RequestOptions
): Promise<T> {
  const headers = headersToObject(fetchOptions?.headers || {});
  if (!headers['Content-Type']) {
    headers['Content-Type'] = typeof body === 'string' ? 'text/plain' : 'application/json';
  }

  const requestParams = runBeforeMiddlewares({
    method,
    url,
    fetchOptions: {
      ...fetchOptions,
      method,
      headers
    },
    body,
    ttl,
    cache
  });

  if (requestParams.body) {
    requestParams.fetchOptions.body =
      typeof requestParams.body === 'string'
        ? requestParams.body
        : JSON.stringify(requestParams.body);
  }

  const cachedData = cache?.get(requestParams.url) as T;

  if (cachedData) {
    return Promise.resolve(runAfterMiddlewares<T>(cachedData));
  }

  const response: Response = await fetch(requestParams.url, requestParams.fetchOptions);

  if (!response.ok) {
    const error: HttpError = new Error(response.statusText);
    error.statusCode = response.status;
    error.response = response;
    throw error;
  }

  const data = await parseResponse<T>(response);

  if (requestParams.ttl && cache && !NON_CACHEABLE_HTTP_METHODS.includes(method)) {
    cache.set(requestParams.url, data, { ttl: requestParams.ttl });
  }

  return runAfterMiddlewares<T>(data);
}
