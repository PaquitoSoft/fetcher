import { put } from '../src/fetcher';
import { HttpError } from '../src/shared-types';

const BASE_URL = 'https://localhost';

describe('Fetcher', () => {
  describe('put', () => {
    const MichaelJordan = {
      id: 23,
      name: 'Michael',
      email: 'm.jordan@email.com'
    };
    it('Should return put data', async () => {
      const user = await put(`${BASE_URL}/api/user/${MichaelJordan.id}`, {
        ...MichaelJordan,
        name: 'Michelle'
      });

      expect(user).toEqual({
        ...MichaelJordan,
        name: 'Michelle'
      });
    });

    it('Should raise an error when server fails', async () => {
      try {
        await put(`${BASE_URL}/api/user/57`, MichaelJordan);
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
