import { CacheManager } from "./shared-types";

type RequestMiddlewareOptions = {
  fetchOptions: RequestInit;
  ttl?: number; // seconds
  cache: CacheManager;
};

type BeforeMiddlewaresResult = {
  url: string,
  fetchOptions: RequestInit,
  ttl?: number
};

export type BeforeMiddlewareResult = {
  url?: string;
  ttl?: number;
  fetchOptions?: RequestInit;
};

export type BeforeMiddleware = (url: string, requestOptions: RequestMiddlewareOptions) =>
  BeforeMiddlewareResult | undefined | null;

export type AfterMiddleware = <T>(serverData: T) => T;

export type Middleware = BeforeMiddleware | AfterMiddleware;

const middlewares = {
  before: [] as BeforeMiddleware[],
  after: [] as AfterMiddleware[]
};

export function addMiddleware(type: "before" | "after", middleware: Middleware): void {
  if (type === 'before') {
    middlewares.before.push(middleware as BeforeMiddleware);
  }

  if (type === 'after') {
    middlewares.after.push(middleware as AfterMiddleware);
  }
}

export function removeMiddleware(middleware: Middleware): Middleware | undefined {
  let index = middlewares.before.indexOf(middleware as BeforeMiddleware);
  if (index !== -1) {
    return middlewares.before.splice(index, 1)[0];
  }

  index = middlewares.after.indexOf(middleware as AfterMiddleware);
  if (index !== -1) {
    return middlewares.after.splice(index, 1)[0];
  }
}

export function runBeforeMiddlewares(
  url: string,
  { fetchOptions, ttl, cache }: RequestMiddlewareOptions
): BeforeMiddlewaresResult {
  return middlewares.before.reduce<BeforeMiddlewaresResult>((params, middleware) => {
    const result = middleware(
      params.url, {
        fetchOptions: params.fetchOptions,
        ttl: params.ttl,
        cache
      }
    );

    return {
      url: result?.url ?? params.url,
      fetchOptions: result?.fetchOptions ?? params.fetchOptions,
      ttl: result?.ttl ?? params.ttl
    } as BeforeMiddlewaresResult;
  }, { url, fetchOptions, ttl });
}

export function runAfterMiddlewares<T>(serverData: T): T {
  return middlewares.after.reduce((data, middleware) => middleware(data), serverData);
}
