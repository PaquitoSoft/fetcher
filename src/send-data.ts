import parseResponse from "./response-parser";
import { HttpError } from "./shared-types";

type SendDataRequestOptions = {
  method?: string;
  body?: object | string;
  fetchOptions?: RequestInit;
}

export async function sendData(
  url: string, {
    body,
    method = 'POST',
    fetchOptions
  }: SendDataRequestOptions
): Promise<unknown> {

  // const requestOptions: RequestInit = {
  //   method,
  //   headers: {
  //     ...headers,
  //     'Content-Type': 'application/json'
  //   }
  // };

  const requestOptions: RequestInit = {
    ...fetchOptions,
    method: method,
    headers: fetchOptions?.headers || {}
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

  const data = await parseResponse(response);

  return data;
}
