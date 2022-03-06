import { runAfterMiddlewares, runBeforeMiddlewares } from './middleware-manager';
import parseResponse from './response-parser';
import { CacheManager } from './shared-types';

interface HttpError extends Error {
  statusCode?: number;
  response?: Response;
}

export type GetDataRequestOptions = {
  fetchOptions?: RequestInit;
  ttl?: number; // seconds
  cache: CacheManager;
};

async function getData<T>(
  url: string,
  { fetchOptions, ttl, cache }: GetDataRequestOptions
): Promise<T> {
  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers: fetchOptions?.headers || {}
  };

  const requestParams = runBeforeMiddlewares({ url, fetchOptions: requestOptions, ttl, cache });

  const result = cache.get(requestParams.url) as T;

  if (result) {
    return Promise.resolve(result);
  }

  const response: Response = await fetch(requestParams.url, requestParams.fetchOptions);

  if (!response.ok) {
    const error: HttpError = new Error(response.statusText);
    error.statusCode = response.status;
    error.response = response;
    throw error;
  }

  const data = await parseResponse<T>(response);

  if (requestParams.ttl) {
    cache.set(requestParams.url, data, { ttl: requestParams.ttl });
  }

  const output = runAfterMiddlewares<T>(data);

  return output;
}

export default getData;
