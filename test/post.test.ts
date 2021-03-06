import { post } from '../src/fetcher';
import { HttpError } from '../src/shared-types';

const BASE_URL = 'https://localhost';

describe('Fetcher', () => {
  describe('post', () => {
    const MichaelJordan = {
      name: 'Michael',
      email: 'm.jordan@email.com'
    };

    it('Should return posted data', async () => {
      const user = await post(`${BASE_URL}/api/user`, MichaelJordan);

      expect(user).toEqual({
        ...MichaelJordan,
        id: 23
      });
    });

    it('Should process request when body is a string', async () => {
      const user = await post(`${BASE_URL}/api/user`, JSON.stringify(MichaelJordan));

      expect(user).toEqual({
        ...MichaelJordan,
        id: 23
      });
    });

    it('Should send custom headers', async () => {
      try {
        await post(
          `${BASE_URL}/api/user`,
          MichaelJordan,
          {
            fetchOptions: {
              headers: { 'X-Custom-Header': 'raise-error' }
            }
          }
        );
        expect(false).toBe(true);
      } catch (e) {
        const error = e as HttpError;
        expect(error.statusCode).toBe(500);
        expect(error.message).toEqual('Internal Server Error');
        expect(error.body).toEqual({ error: 'Something went really wrong' });
        expect(error.response).not.toBeUndefined();
      }
    });

    it('Should raise an error when server fails', async () => {
      try {
        await post(`${BASE_URL}/api/user?status=error`, MichaelJordan);
        expect(false).toBe(true);
      } catch (e) {
        const error = e as HttpError;
        expect(error.statusCode).toBe(500);
        expect(error.message).toEqual('Internal Server Error');
        expect(error.body).toEqual({ error: 'Something went really wrong' });
        expect(error.response).not.toBeUndefined();
      }
    });
  });
});
