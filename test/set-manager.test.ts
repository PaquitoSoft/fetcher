import { get, setCacheManager } from '../src/fetcher';

const BASE_URL = 'https://localhost';

describe("Fetcher", () => {

  describe('setCacheManager', ()=> {
    const getMockedCacheManager = () => ({
      get: jest.fn(),
      set: jest.fn()
    });

    it('Should use provided custom cache manager', async () => {
      const cacheManager = getMockedCacheManager();
      setCacheManager(cacheManager);

      await get(`${BASE_URL}/api/user/15`, { ttl: 10 });
      expect(cacheManager.get).toHaveBeenCalledTimes(1);
      expect(cacheManager.set).toHaveBeenCalledTimes(1);

      await get(`${BASE_URL}/api/user/15`);
      expect(cacheManager.get).toHaveBeenCalledTimes(2);
      expect(cacheManager.set).toHaveBeenCalledTimes(1);
    });

    it('Should not store response in cache manager if no ttl is provided', async () => {
      const cacheManager = getMockedCacheManager();
      setCacheManager(cacheManager);

      await get(`${BASE_URL}/api/user/15`);
      expect(cacheManager.get).toHaveBeenCalledTimes(1);
      expect(cacheManager.set).toHaveBeenCalledTimes(0);
    });

  });
});

