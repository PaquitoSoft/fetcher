import parseResponse from "./response-parser";
import { CacheManager } from "./shared-types";

interface HttpError extends Error {
  statusCode?: number;
  response?: Response;
}

type GetDataRequestOptions = {
  fetchOptions?: RequestInit;
  ttl?: number; // seconds
  cache: CacheManager;
};

async function getData<T>(
  url: string, {
    fetchOptions,
    ttl,
    cache
  }: GetDataRequestOptions
): Promise<T> {
  const result = cache.get(url) as T;

  if (result) {
    return Promise.resolve(result);
  }

  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers: fetchOptions?.headers || {}
  };
  const response: Response = await fetch(url, requestOptions);

  if (!response.ok) {
    const error: HttpError = new Error(response.statusText);
    error.statusCode = response.status;
    error.response = response;
    throw error;
  }

  const data = await parseResponse<T>(response);

  if (ttl) {
    cache.set(url, data, { ttl });
  }

  return data;
}

export default getData;
