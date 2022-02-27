# Fetcher

A simple (_typed_) library on top of fetch that is more user friendly.

Please head to the [API Docs](https://paquitosoft.github.io/fetcher/) for detailed information.

## Installation

```
npm install @paquitosoft/fetcher
```

## How to use it

The module exports four API functions tailored for the main [HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) (GET, POST, PUT, DELETE).

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

### Using a custom cache manager

In case you want to use another persisting layer, you can just create
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
