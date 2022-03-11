import { send } from '../src/fetcher';

describe('Fetcher', () => {
  describe('send', () => {
    const BASE_URL = 'https://localhost';

    it('should send a GET request', async () => {
      const user = await send(`${BASE_URL}/api/user/15`, 'GET');
      expect(user).toHaveProperty('id', 15);
      expect(user).toHaveProperty('name', 'Vince');
      expect(user).toHaveProperty('email', 'v.carter@email.com');
    });

    it('should send a POST request', async () => {
      const MichaelJordan = {
        name: 'Michael',
        email: 'm.jordan@email.com'
      };

      const newUser = await send(`${BASE_URL}/api/user`, 'POST', { body: MichaelJordan });

      expect(newUser).toHaveProperty('id', 23);
      expect(newUser).toHaveProperty('name', MichaelJordan.name);
      expect(newUser).toHaveProperty('email', MichaelJordan.email);
    });

    it('should handle custom headers from Headers type', async () => {
      const headers = new Headers();
      headers.set('X-Custom-Header', 'Vince');
      headers.set('Content-Type', 'application/json');

      const user = await send(`${BASE_URL}/api/user/15`, 'GET', {
        fetchOptions: { headers }
      });

      expect(user).toHaveProperty('id', 15);
    });

    it('should handle custom headers from array', async () => {
      const headers: string[][] = [];
      headers.push(['X-Custom-Header', 'Vince']);
      headers.push(['Content-Type', 'application/json']);

      const user = await send(`${BASE_URL}/api/user/15`, 'GET', {
        fetchOptions: { headers }
      });

      expect(user).toHaveProperty('id', 15);
    });
  });
});
