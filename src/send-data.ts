import parseResponse from "./response-parser";
import { HttpError } from "./shared-types";

type SendDataRequestOptions = {
  method?: string;
  body?: object | string;
  fetchOptions?: RequestInit;
}

export async function sendData<T>(
  url: string, {
    body,
    method = 'POST',
    fetchOptions
  }: SendDataRequestOptions
): Promise<T> {

  const headers = new Headers(fetchOptions?.headers || {});
  if (headers.get('Content-Type') === null) {
    headers.set('Content-Type', (typeof body === 'string') ? 'text/plain' : 'application/json');
  }

  const requestOptions: RequestInit = {
    ...fetchOptions,
    method: method,
    headers
  };

  if (body) {
    requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const response: Response = await fetch(url, requestOptions);

  if (!response.ok) {
    const error: HttpError = new Error(response.statusText);
    error.statusCode = response.status;
    error.response = response;
    throw error;
  }

  const data = await parseResponse<T>(response);

  return data;
}
