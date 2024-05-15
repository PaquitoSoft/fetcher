import { get, post, addMiddleware, removeMiddleware } from '../src/fetcher';
import { AfterMiddleware, BeforeMiddleware, resetMiddlewares } from '../src/middleware-manager';
import { TTestUser } from './mocks/test-types';

const BASE_URL = 'https://localhost';

describe('Fetcher', () => {
  describe('Middlewares', () => {
    afterEach(() => {
      resetMiddlewares();
    });

    describe('GET requests', () => {
      it('Should add "before" middlewares', async () => {
        const initialId = '15';
        const updatedId = '23';
        const mockChangeUrlMiddleware = jest.fn() as jest.MockedFunction<BeforeMiddleware>;
        mockChangeUrlMiddleware.mockImplementation(options => ({
          url: options.url.replace(initialId, updatedId)
        }));
        const mockAddHeaderMiddleware = jest.fn() as jest.MockedFunction<BeforeMiddleware>;
        mockAddHeaderMiddleware.mockImplementation(options => ({
          fetchOptions: {
            ...options.fetchOptions,
            headers: {
              ...options.fetchOptions.headers,
              'X-Custom-Header': 'custom-value'
            }
          }
        }));
        addMiddleware('before', mockChangeUrlMiddleware);
        addMiddleware('before', mockAddHeaderMiddleware);

        const user = await get(`${BASE_URL}/api/user/${initialId}`);

        const [middlewareOptions1] = mockChangeUrlMiddleware.mock.calls[0];
        const [middlewareOptions2] = mockAddHeaderMiddleware.mock.calls[0];
        expect(middlewareOptions1.url).toContain(initialId);
        expect(middlewareOptions2.url).toContain(updatedId);

        expect(user).toHaveProperty('id', Number(updatedId));
        expect(user).toHaveProperty('meta', 'custom-value');
      });

      it('Should add "after" middlewares', async () => {
        const avgPoints = 50;
        const avgRebounds = 10;
        const mockAddMetaAvgPointsMiddleware = jest.fn() as jest.MockedFunction<
          AfterMiddleware<TTestUser>
        >;
        mockAddMetaAvgPointsMiddleware.mockImplementation(serverData => ({
          ...serverData,
          meta: { avgPoints }
        }));
        const mockAddMetaAvgReboundsMiddleware = jest.fn() as jest.MockedFunction<
          AfterMiddleware<TTestUser>
        >;
        mockAddMetaAvgReboundsMiddleware.mockImplementation(serverData => ({
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
        mockChangeUrlMiddleware.mockImplementation(options => ({
          url: options.url.replace(initialId, updatedId)
        }));
        const mockAddMetaAvgPointsMiddleware = jest.fn() as jest.MockedFunction<
          AfterMiddleware<TTestUser>
        >;
        mockAddMetaAvgPointsMiddleware.mockImplementation(serverData => ({
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
        const mockAfterMiddleware = jest.fn(serverData => serverData);

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

    describe('POST requests', () => {
      it('Should run both "before" and "after" middlewares', async () => {
        const newUser = {
          name: 'Karl',
          email: 'Malone'
        };
        const customValue = '42';
        const avgRebounds = 21;
        const mockBeforeMiddleware = jest.fn() as jest.MockedFunction<BeforeMiddleware>;
        mockBeforeMiddleware.mockImplementation(options => ({
          fetchOptions: {
            ...options.fetchOptions,
            headers: {
              ...options.fetchOptions.headers,
              'X-Custom-Header': customValue
            }
          }
        }));
        const mockAfterMiddleware = jest.fn() as jest.MockedFunction<AfterMiddleware<TTestUser>>;
        mockAfterMiddleware.mockImplementation(serverData => ({
          ...serverData,
          meta: { ...serverData.meta, avgRebounds }
        }));

        addMiddleware('before', mockBeforeMiddleware);
        addMiddleware('after', mockAfterMiddleware);

        const user = await post(`${BASE_URL}/api/user`, newUser);

        expect(user).toHaveProperty('id', 23);
        expect(user).toHaveProperty('name', 'Karl');
        expect(user).toHaveProperty('email', 'Malone');
        expect(user).toHaveProperty('meta.custom', customValue);
        expect(user).toHaveProperty('meta.avgRebounds', avgRebounds);
      });
    });
  });
});
