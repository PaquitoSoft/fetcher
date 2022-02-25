import { del } from '../src/fetcher';
import { HttpError } from '../src/shared-types';

const BASE_URL = 'https://localhost';

describe('Fetcher', () => {
  const VinceCarter = {
    id: 15,
    name: 'Vince',
    email: 'v.carter@email.com'
  };

  describe('del', () => {
    it('Should process delete request', async () => {
      const data = await del(`${BASE_URL}/api/user/10`);
      expect(data).toEqual({ deleted: true });
    });

    it('Should process delete request with a body', async () => {
      const data = await del(`${BASE_URL}/api/user/15`, {
        body: VinceCarter
      });

      expect(data).toEqual({ deleted: true, user: VinceCarter });
    });

    it('Should raise an error when server fails', async () => {
      try {
        await del(`${BASE_URL}/api/user/57`);
        expect(false).toBe(true);
      } catch (e) {
        const error = e as HttpError;
        expect(error.statusCode).toBe(404);
        expect(error.message).toEqual('Not Found');
        expect(error.response).not.toBeUndefined();
      }
    });
  });
});
