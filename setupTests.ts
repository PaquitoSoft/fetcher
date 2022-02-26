import fetch, { Headers } from 'node-fetch';
import { DOMParser } from 'xmldom';
import { server } from './test/mocks/server';

// @ts-ignore
global.fetch = fetch;
// @ts-ignore
global.Headers = Headers;
// @ts-ignore
global.DOMParser = DOMParser;

beforeAll(() => {
  // Enable the mocking in tests.
  server.listen()
});

afterEach(() => {
  // Reset any runtime handlers tests may use.
  server.resetHandlers()
});

afterAll(() => {
  // Clean up once the tests are done.
  server.close()
});
