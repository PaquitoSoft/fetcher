# Fetcher

A simple and [small](https://bundlephobia.com/package/@paquitosoft/fetcher) (_typed_) library on top of [**fetch**](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) that is more user friendly.

[![NPM version](https://img.shields.io/npm/v/@paquitosoft/fetcher?logo=npm)](https://www.npmjs.com/package/@paquitosoft/fetcher)
![Gzip size](https://img.shields.io/bundlephobia/minzip/@paquitosoft/fetcher)
![CircleCI status](https://circleci.com/gh/PaquitoSoft/fetcher.svg?style=shield)
[![GitHub license](https://img.shields.io/github/license/paquitosoft/fetcher)](https://github.com/PaquitoSoft/fetcher/blob/main/LICENSE)
<br/>

Sections:
* [Installation](#installation)
* [How to use it](#how-to-use-it)
* Extra features:
  * [Caching](#caching)
  * [Middlewares](#middlewares)

Please head to the [API Docs](https://paquitosoft.github.io/fetcher/modules.html) for detailed information.

## Installation

```
npm install @paquitosoft/fetcher
```

## How to use it

The module exports four API functions tailored for the main [HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) (GET, POST, PUT, DELETE) and also another one to tailor your request (and use other HTTP methods).

### Sending a GET request 
```js
import { get } from '@paquitosoft/fetcher';

async function loadProducts() {
  const products = await get('https://fakestoreapi.com/products');
  console.log({ products });
}

// Loading and cache products for 10 minutes
async function loadAndCacheProducts() {
  const products = await get('https://fakestoreapi.com/products', {
    ttl: 10 * 60 // value is seconds
  });
  console.log({ products });
}
```

### Sending a POST request 
```js
import { post } from '@paquitosoft/fetcher';

async function saveProduct() {
  const newProduct = {
    title: 'test product',
    price: 13.5,
    description: 'lorem ipsum set',
    image: 'https://i.pravatar.cc',
    category: 'electronic'
  };
  const persistedProduct = await post('https://fakestoreapi.com/products', newProduct);
  console.log({ persistedProduct });
}
```

## Caching

By default `fetcher` uses an in-memory cache so you can avoid hitting the server for long-lived resources.
This is controlled by the `ttl` (_seconds_) parameter for GET requests.

You can also provide your own custom cache manager to store values in other locations such `local-storage` or `IndexedDB`.
For such situations, you would create
a class/object which implements the [CacheManager](https://paquitosoft.github.io/fetcher/interfaces/CacheManager.html) interface.

```js
import { setCacheManager, get } from '@paquitosoft/fetcher';

// Define a custom cache manager
const localStorageCacheManager = {
  set(key, value, options = { ttl: 0 }) {
    const cacheEntry = {
      expires: Date.now() + ((options?.ttl || 0) * 1000),
      value
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  },

  get(key) {
    const cacheEntryRaw = localStorage.getItem(key);

    if (!cacheEntry) return undefined;

    const now = Date.now();
    const cacheEntry = JSON.parse(cacheEntryRaw);
    if (cacheEntry && now < cacheEntry.expires) {
      return cacheEntry.value;
    } else {
      localStorage.removeItem(key);
      return undefined;
    }
  }
};

// Tell Fetcher to use this custom manager
setCacheManager(localStorageCacheManager);

// Now fetched data will be persisted in browser's local storage
async function loadAndCacheProducts() {
  const products = await get('https://fakestoreapi.com/products', {
    ttl: 10 * 60
  });
  console.log({ products });
}
```

## Middlewares

There might be scenarios where you would like to apply some logic before or after every request. You can achieve this by using `middlewares`.
You would create middleware functions and register them in the `fetcher` module by calling the `addMiddleware` function.

### Before request middlewares

These are just functions that receive the request meta-data and must return that meta-data with your needed modifications.

Here is an example of a middleware to add some sort of auth token to every request.

```js
import { addMiddleware, removeMiddleware, get } from '@paquitosoft/fetcher';

// Define your middleware
function authMiddleware({ method, url, fetchOptions, ttl, body, cache }) {
  const authToken = localStorage.getItem('auth-token');
  const headers = {
    ...fetchOptions.headers,
    'Authorization': `Bearer ${authToken}`
  };
  return {
    fetchOptions: {
      ...fetchOptions,
      headers
    }
  };
}

// Tell fetcher you want to use it
addMiddleware('before', authMiddleware);

// This request would send the auth header
const shopCart = await get('https://fakestoreapi.com/carts/5');

// If you ever need to remove the middleware, you can do it like this
removeMiddleware(authMiddleware);
```

### After request middlewares

In you ever need to modify the response from the server before it gets to your consumer, you can use an _after_ middleware which receives the data fetched from the server (processed) and can return whatever it wants.

Here is an example where we modify the response if user is in a certain A/B experiment:

```js
import { addMiddleware, get } from '@paquitosoft/fetcher';

// Define your middleware
function updateProductsMetaData(serverData: products) {
  const isProductsListingUrl = /\/products$/.test(url);

  if (isProductsListingUrl) {
    const isUserInExperiment = (localStorage.getItem('user-ab-engaged-experiments') || '')
      .split(',').includes('exp_001');

    if (isUserInExperiment) {
      return products.map(product => ({
        ...product,
        labels: ['NEW']
      }));
    }
  }
}

// Tell fetcher you want to use it
addMiddleware('before', authMiddleware);

// Products will include the 'labels' attribute if user is in the experiment
const products = await get('https://fakestoreapi.com/products');
```
