import { get } from '../src/fetcher';
import { HttpError } from '../src/shared-types';

const BASE_URL = 'https://localhost';

describe('Fetcher', () => {
  const VinceCarter = {
    id: 15,
    name: 'Vince',
    email: 'v.carter@email.com'
  };

  describe('get', () => {
    it('Should return requested json resource', async () => {
      const user = await get(`${BASE_URL}/api/user/15`);
      expect(user).toEqual(VinceCarter);
    });

    it('Should not fail when receving an empty json response', async () => {
      const user = await get(`${BASE_URL}/api/user/0`);
      expect(user).toEqual({});
    });

    it('Should return requested xml resource', async () => {
      const doc = (await get(`${BASE_URL}/api/user/3`)) as XMLDocument;

      expect(doc.getElementsByTagName('id')[0].textContent).toEqual('3');
      expect(doc.getElementsByTagName('name')[0].textContent).toEqual('Allen');
      expect(doc.getElementsByTagName('email')[0].textContent).toEqual('a.iverson@email.com');
    });

    it('Should return requested html resource', async () => {
      const htmlDoc = (await get(`${BASE_URL}/api/user/21`)) as Document;

      expect(htmlDoc.getElementById('user-id')?.textContent).toEqual('21');
      expect(htmlDoc.getElementById('user-name')?.textContent).toEqual('Tim');
      expect(htmlDoc.getElementById('user-email')?.textContent).toEqual('t.duncan@email.com');
    });

    it('Should return requested text resource', async () => {
      const raw = (await get(`${BASE_URL}/api/user/12`)) as string;
      const user = raw.split(',').reduce<Record<string, string>>((acc, curr) => {
        const [key, value] = curr.split('=');
        acc[key] = value;
        return acc;
      }, {}) as object;

      expect(user).toEqual({
        id: '12',
        name: 'John',
        email: 'j.stockton@email.com'
      });
    });

    it('Should return data as text when server does not provide any content type', async () => {
      const raw = (await get(`${BASE_URL}/api/user/20`)) as string;
      const user = raw.split(',').reduce<Record<string, string>>((acc, curr) => {
        const [key, value] = curr.split('=');
        acc[key] = value;
        return acc;
      }, {}) as object;

      expect(user).toEqual({
        id: '20',
        name: 'Gary',
        email: 'g.payton@email.com'
      });
    });

    it('Should include custom fetch options', async () => {
      const user = await get(`${BASE_URL}/api/user/15`, {
        fetchOptions: {
          headers: {
            // Server will fail if it receives this header with a value other than 'Vince'
            'X-Custom-Header': 'Vince'
          }
        }
      });
      expect(user).toEqual(VinceCarter);
    });

    it('Should return fresh value if no ttl is used', async () => {
      const user1 = await get(`${BASE_URL}/api/user/15`);
      const user2 = await get(`${BASE_URL}/api/user/15`);
      expect(user1).toEqual(user2);
      expect(user1).not.toBe(user2);
    });

    it('Should return cached value if ttl is used', async () => {
      const user1 = await get(`${BASE_URL}/api/user/15`, { ttl: 10 });
      const user2 = await get(`${BASE_URL}/api/user/15`);
      expect(user1).toEqual(user2);
      expect(user1).toBe(user2);
    });

    it('Should raise an error when server fails', async () => {
      try {
        await get(`${BASE_URL}/api/user/44`);
        expect(false).toBe(true);
      } catch (e) {
        const error = e as HttpError;
        expect(error.statusCode).toBe(404);
        expect(error.message).toEqual('Not Found');
        expect(error.body).toEqual({ error: 'User does not exist' });
        expect(error.response).not.toBeUndefined();
      }
    });

    it('Should process a redirect', async () => {
      const user = await get(`${BASE_URL}/api/user/25`);
      expect(user).toEqual(VinceCarter);
    });
  });
});
