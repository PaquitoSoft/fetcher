import { get, post, addMiddleware, removeMiddleware } from '../src/fetcher';
import { AfterMiddleware, BeforeMiddleware, BeforeMiddlewareResult } from '../src/middleware-manager';

const BASE_URL = 'https://localhost';

describe("Fetcher", () => {

  describe('Middlewares', ()=> {

    it('Should add "before" middlewares', async () => {
      const initialId = '15';
      const updatedId = '23';
      const mockChangeUrlMiddleware = jest.fn() as jest.MockedFunction<BeforeMiddleware>;
      mockChangeUrlMiddleware.mockImplementation((url, _requestOptions) => ({
        url: url.replace(initialId, updatedId)
      }));
      const mockAddHeaderMiddleware = jest.fn() as jest.MockedFunction<BeforeMiddleware>;
      mockAddHeaderMiddleware.mockImplementation((_url, requestOptions) => ({
        fetchOptions: {
          ...requestOptions.fetchOptions,
          headers: {
            ...requestOptions.fetchOptions.headers,
            'X-Custom-Header': 'custom-value'
          }
        }
      }));
      addMiddleware('before', mockChangeUrlMiddleware);
      addMiddleware('before', mockAddHeaderMiddleware);

      const user = await get(`${BASE_URL}/api/user/${initialId}`);

      const [url1] = mockChangeUrlMiddleware.mock.calls[0];
      const [url2] = mockAddHeaderMiddleware.mock.calls[0];
      expect(url1).toContain(initialId);
      expect(url2).toContain(updatedId);

      expect(user).toHaveProperty('id', Number(updatedId));
      expect(user).toHaveProperty('meta', 'custom-value');
    });

    it('Should add "after" middlewares', async () => {
      const avgPoints = 50;
      const avgRebounds = 10;
      const mockAddMetaAvgPointsMiddleware = jest.fn() as jest.MockedFunction<AfterMiddleware>;
      mockAddMetaAvgPointsMiddleware.mockImplementation((serverData: any) => ({
        ...serverData,
        meta: { avgPoints }
      }));
      const mockAddMetaAvgReboundsMiddleware = jest.fn() as jest.MockedFunction<AfterMiddleware>;
      mockAddMetaAvgReboundsMiddleware.mockImplementation((serverData: any) => ({
        ...serverData,
        meta: {
          ...serverData.meta,
          avgRebounds
        }
      }));

      addMiddleware('after', mockAddMetaAvgPointsMiddleware);
      addMiddleware('after', mockAddMetaAvgReboundsMiddleware);

      const user = await get(`${BASE_URL}/api/user/15`);

      expect(user).toHaveProperty('meta.avgPoints', avgPoints);
      expect(user).toHaveProperty('meta.avgRebounds', avgRebounds);
    });

    it('Should add both "before" and "after" middlewares', async () => {
      const initialId = '15';
      const updatedId = '23';
      const avgPoints = 50;
      const mockChangeUrlMiddleware = jest.fn() as jest.MockedFunction<BeforeMiddleware>;
      mockChangeUrlMiddleware.mockImplementation((url, _requestOptions) => ({
        url: url.replace(initialId, updatedId)
      }));
      const mockAddMetaAvgPointsMiddleware = jest.fn() as jest.MockedFunction<AfterMiddleware>;
      mockAddMetaAvgPointsMiddleware.mockImplementation((serverData: any) => ({
        ...serverData,
        meta: { avgPoints }
      }));

      addMiddleware('before', mockChangeUrlMiddleware);
      addMiddleware('after', mockAddMetaAvgPointsMiddleware);

      const user = await get(`${BASE_URL}/api/user/${initialId}`);

      expect(user).toHaveProperty('id', Number(updatedId));
      expect(user).toHaveProperty('meta.avgPoints', avgPoints);
    });

    it('Should remove middlewares', async () => {
      const mockBeforeMiddleware = jest.fn();
      const mockAfterMiddleware = jest.fn((serverData) => serverData);

      addMiddleware('before', mockBeforeMiddleware);
      addMiddleware('after', mockAfterMiddleware);

      await get(`${BASE_URL}/api/user/15`);
      expect(mockBeforeMiddleware).toHaveBeenCalled();
      expect(mockAfterMiddleware).toHaveBeenCalled();

      removeMiddleware(mockBeforeMiddleware);
      await get(`${BASE_URL}/api/user/15`);
      expect(mockBeforeMiddleware).toHaveBeenCalledTimes(1);
      expect(mockAfterMiddleware).toHaveBeenCalledTimes(2);

      removeMiddleware(mockAfterMiddleware);
      await get(`${BASE_URL}/api/user/15`);
      expect(mockBeforeMiddleware).toHaveBeenCalledTimes(1);
      expect(mockAfterMiddleware).toHaveBeenCalledTimes(2);
    });

  });
});

