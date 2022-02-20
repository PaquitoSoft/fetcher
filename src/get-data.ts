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

async function getData(
  url: string, {
    fetchOptions,
    ttl,
    cache
  }: GetDataRequestOptions
): Promise<unknown> {
  const result = cache.get(url);

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

  const data = await parseResponse(response);

  if (ttl) {
    cache.set(url, data, { ttl });
  }

  return data;
}

export default getData;
