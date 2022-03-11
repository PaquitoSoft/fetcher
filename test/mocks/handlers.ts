import { rest } from 'msw';

const BASE_URL = 'https://localhost';

export const handlers = [
  rest.get(`${BASE_URL}/api/user/:userId`, (req, res, ctx) => {
    if (req.params.userId === '0') {
      return res(ctx.status(200), ctx.set('Content-Type', 'application/json'));
    }

    if (req.params.userId === '3') {
      return res(
        ctx.status(200),
        ctx.xml('<user><id>3</id><name>Allen</name><email>a.iverson@email.com</email></user>')
      );
    }

    if (req.params.userId === '12') {
      return res(ctx.status(200), ctx.text('id=12,name=John,email=j.stockton@email.com'));
    }

    if (req.params.userId === '15') {
      const customHeader = req.headers.get('X-Custom-Header');
      if (customHeader && customHeader !== 'Vince') {
        return res(ctx.status(500));
      }

      return res(
        ctx.status(200),
        ctx.json({
          id: 15,
          name: 'Vince',
          email: 'v.carter@email.com'
        })
      );
    }

    if (req.params.userId === '20') {
      return res(ctx.status(200), ctx.body('id=20,name=Gary,email=g.payton@email.com'));
    }

    if (req.params.userId === '21') {
      return res(
        ctx.status(200),
        ctx.set('Content-Type', 'text/html'),
        ctx.body(`
          <html>
            <head>
              <title>Tim Duncan</title>
            </head>
            <body>
              <p>ID: <span id="user-id">21</span></p>
              <p>Name: <span id="user-name">Tim</span></p>
              <p>Email: <span id="user-email">t.duncan@email.com</span></p>
            </body>
          </html>
        `)
      );
    }

    if (req.params.userId === '23') {
      const customHeader = req.headers.get('X-Custom-Header');
      return res(
        ctx.status(200),
        ctx.json({
          id: 23,
          name: 'Michael',
          email: 'm.jordan@email.com',
          meta: customHeader
        })
      );
    }

    if (req.params.userId === '25') {
      return res(ctx.status(307), ctx.set('Location', 'https://localhost/api/user/15'));
    }

    return res(ctx.status(404), ctx.json({ error: 'User does not exist' }));
  }),

  rest.post(`${BASE_URL}/api/user`, (req, res, ctx) => {
    if (
      req.url.searchParams.get('status') === 'error' ||
      req.headers.get('X-Custom-Header') === 'raise-error'
    ) {
      return res(ctx.status(500), ctx.json({ error: 'Something went really wrong' }));
    }

    const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (requestBody.name === 'Karl' && req.headers.get('Content-Type') !== 'application/json') {
      return res(ctx.status(500), ctx.json({ error: 'Invalid Content-Type header' }));
    }

    return res(
      ctx.status(201),
      ctx.json({
        id: 23,
        name: requestBody.name,
        email: requestBody.email,
        ...(req.headers.get('X-Custom-Header')
          ? {
              meta: { custom: req.headers.get('X-Custom-Header') }
            }
          : {})
      })
    );
  }),

  rest.put(`${BASE_URL}/api/user/:userId`, (req, res, ctx) => {
    if (req.params.userId === '23') {
      const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      return res(
        ctx.status(200),
        ctx.json({
          id: requestBody.id,
          name: requestBody.name,
          email: requestBody.email
        })
      );
    }

    return res(ctx.status(404), ctx.json({ error: 'User does not exist' }));
  }),

  rest.delete(`${BASE_URL}/api/user/:userId`, (req, res, ctx) => {
    if (req.params.userId === '10') {
      return res(
        ctx.status(200),
        ctx.json({
          deleted: true
        })
      );
    }

    if (req.params.userId === '15') {
      const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      return res(
        ctx.status(200),
        ctx.json({
          deleted: true,
          user: {
            id: requestBody.id,
            name: requestBody.name,
            email: requestBody.email
          }
        })
      );
    }

    return res(ctx.status(404), ctx.json({ error: 'User does not exist' }));
  })
];
