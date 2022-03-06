import { CacheManager, HTTPMethod } from './shared-types';

type RequestMiddlewareOptions = {
  method: HTTPMethod;
  url: string;
  fetchOptions: RequestInit;
  ttl?: number; // seconds
  cache?: CacheManager;
  body?: any;
};

type BeforeMiddlewaresResult = {
  url: string;
  fetchOptions: RequestInit;
  ttl?: number;
  body?: any;
};

export type BeforeMiddlewareResult = {
  url?: string;
  ttl?: number;
  fetchOptions?: RequestInit;
  body?: any;
};

export type BeforeMiddleware = (
  options: RequestMiddlewareOptions
) => BeforeMiddlewareResult | undefined | null;

export type AfterMiddleware = <T>(serverData: T) => T;

export type Middleware = BeforeMiddleware | AfterMiddleware;

const middlewares = {
  before: [] as BeforeMiddleware[],
  after: [] as AfterMiddleware[]
};

export function addMiddleware(type: 'before' | 'after', middleware: Middleware): void {
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

export function runBeforeMiddlewares({
  method,
  url,
  fetchOptions,
  ttl,
  body,
  cache
}: RequestMiddlewareOptions): BeforeMiddlewaresResult {
  return middlewares.before.reduce<BeforeMiddlewaresResult>(
    (params, middleware) => {
      const result = middleware({
        method,
        url: params.url,
        fetchOptions: params.fetchOptions,
        ttl: params.ttl,
        body: params.body,
        cache
      });

      return {
        url: result?.url ?? params.url,
        fetchOptions: result?.fetchOptions ?? params.fetchOptions,
        ttl: result?.ttl ?? params.ttl,
        body: result?.body ?? params.body
      } as BeforeMiddlewaresResult;
    },
    { url, fetchOptions, body, ttl }
  );
}

export function runAfterMiddlewares<T>(serverData: T): T {
  return middlewares.after.reduce((data, middleware) => middleware(data), serverData);
}
