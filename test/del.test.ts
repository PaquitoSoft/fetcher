import { del } from '../src/fetcher';

const BASE_URL = 'https://localhost';

describe("Fetcher", () => {
  const VinceCarter = {
    id: 15,
    name: 'Vince',
    email: 'v.carter@email.com'
  };

  describe('del', ()=> {
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
        expect(e.statusCode).toBe(404);
        expect(e.message).toEqual('Not Found');
        expect(e.response).not.toBeUndefined();
      }
    });
  });
});

