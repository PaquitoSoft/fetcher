import { runAfterMiddlewares, runBeforeMiddlewares } from './middleware-manager';
import parseResponse from './response-parser';
import { HttpError } from './shared-types';

type SendDataRequestOptions = {
  method?: string;
  body?: object | string;
  fetchOptions?: RequestInit;
};

export async function sendData<T>(
  url: string,
  { body, method = 'POST', fetchOptions }: SendDataRequestOptions
): Promise<T> {
  const headers = new Headers(fetchOptions?.headers || {});
  if (headers.get('Content-Type') === null) {
    headers.set('Content-Type', typeof body === 'string' ? 'text/plain' : 'application/json');
  }

  const requestOptions: RequestInit = {
    ...fetchOptions,
    method: method,
    headers
  };

  const requestParams = runBeforeMiddlewares({ url, fetchOptions: requestOptions, body });

  if (requestParams.body) {
    requestParams.fetchOptions.body =
      typeof requestParams.body === 'string'
        ? requestParams.body
        : JSON.stringify(requestParams.body);
  }

  const response: Response = await fetch(requestParams.url, requestParams.fetchOptions);

  if (!response.ok) {
    const error: HttpError = new Error(response.statusText);
    error.statusCode = response.status;
    error.response = response;
    throw error;
  }

  const data = await parseResponse<T>(response);

  const output = runAfterMiddlewares<T>(data);

  return output;
}
