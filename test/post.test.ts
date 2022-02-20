import { get, post, put, del, setCacheManager } from '../src/fetcher';

const BASE_URL = 'https://localhost';

describe("Fetcher", () => {

  describe('post', ()=> {
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

    it('Should process request then body is a string', async () => {
      const user = await post(`${BASE_URL}/api/user`, JSON.stringify(MichaelJordan));

      expect(user).toEqual({
        ...MichaelJordan,
        id: 23
      });
    });

    it('Should raise an error when server fails', async () => {
      try {
        await post(`${BASE_URL}/api/user?status=error`, MichaelJordan);
        expect(false).toBe(true);
      } catch (e) {
        expect(e.statusCode).toBe(500);
        expect(e.message).toEqual('Internal Server Error');
        expect(e.response).not.toBeUndefined();
      }
    });

  });
});

