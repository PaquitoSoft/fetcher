import { http, HttpResponse } from 'msw';
import { TTestUser } from './test-types';

const BASE_URL = 'https://localhost';

export const handlers = [
  http.get(`${BASE_URL}/api/user/:userId`, ({ params, request }) => {
    if (params.userId === '0') {
      // return res(ctx.status(200), ctx.set('Content-Type', 'application/json'));
      return HttpResponse.json({});
    }

    if (params.userId === '3') {
      // return res(
      //   ctx.status(200),
      //   ctx.xml('<user><id>3</id><name>Allen</name><email>a.iverson@email.com</email></user>')
      // );
      return HttpResponse.xml(
        '<user><id>3</id><name>Allen</name><email>a.iverson@email.com</email></user>'
      );
    }

    if (params.userId === '12') {
      // return res(ctx.status(200), ctx.text('id=12,name=John,email=j.stockton@email.com'));
      return HttpResponse.text('id=12,name=John,email=j.stockton@email.com');
    }

    if (params.userId === '15') {
      const customHeader = request.headers.get('X-Custom-Header');
      if (customHeader && customHeader !== 'Vince') {
        // return res(ctx.status(500));
        return HttpResponse.text('', { status: 500 });
      }

      // return res(
      //   ctx.status(200),
      //   ctx.json({
      //     id: 15,
      //     name: 'Vince',
      //     email: 'v.carter@email.com'
      //   })
      // );
      return HttpResponse.json({
        id: 15,
        name: 'Vince',
        email: 'v.carter@email.com'
      });
    }

    if (params.userId === '20') {
      // return res(ctx.status(200), ctx.body('id=20,name=Gary,email=g.payton@email.com'));
      return HttpResponse.text('id=20,name=Gary,email=g.payton@email.com');
    }

    if (params.userId === '21') {
      return HttpResponse.xml(
        `
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
      `,
        {
          headers: new Headers({
            'Content-Type': 'text/html'
          })
        }
      );
      // return res(
      //   ctx.status(200),
      //   ctx.set('Content-Type', 'text/html'),
      //   ctx.body(`
      //     <html>
      //       <head>
      //         <title>Tim Duncan</title>
      //       </head>
      //       <body>
      //         <p>ID: <span id="user-id">21</span></p>
      //         <p>Name: <span id="user-name">Tim</span></p>
      //         <p>Email: <span id="user-email">t.duncan@email.com</span></p>
      //       </body>
      //     </html>
      //   `)
      // );
    }

    if (params.userId === '23') {
      const customHeader = request.headers.get('X-Custom-Header');
      // return res(
      //   ctx.status(200),
      //   ctx.json({
      //     id: 23,
      //     name: 'Michael',
      //     email: 'm.jordan@email.com',
      //     meta: customHeader
      //   })
      // );
      return HttpResponse.json({
        id: 23,
        name: 'Michael',
        email: 'm.jordan@email.com',
        meta: customHeader
      });
    }

    if (params.userId === '25') {
      // return res(ctx.status(307), ctx.set('Location', 'https://localhost/api/user/15'));
      // return new HttpResponse(null, {
      //   status: 307,
      //   headers: new Headers({
      //     Location: 'https://localhost/api/user/15'
      //   })
      // });
      return new Response(null, {
        status: 302,
        headers: {
          Location: 'https://localhost/api/user/15'
        }
      });
    }

    // return res(ctx.status(404), ctx.json({ error: 'User does not exist' }));
    return HttpResponse.json({ error: 'User does not exist' }, { status: 404 });
  }),

  http.post(`${BASE_URL}/api/user`, async ({ request }) => {
    const url = new URL(request.url);
    if (
      url.searchParams.get('status') === 'error' ||
      request.headers.get('X-Custom-Header') === 'raise-error'
    ) {
      // return res(ctx.status(500), ctx.json({ error: 'Something went really wrong' }));
      return HttpResponse.json({ error: 'Something went really wrong' }, { status: 500 });
    }

    // const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const requestBody = (await request.json()) as TTestUser;

    if (requestBody.name === 'Karl' && request.headers.get('Content-Type') !== 'application/json') {
      // return res(ctx.status(500), ctx.json({ error: 'Invalid Content-Type header' }));
      return HttpResponse.json({ error: 'Invalid Content-Type header' }, { status: 500 });
    }

    // return res(
    //   ctx.status(201),
    //   ctx.json({
    //     id: 23,
    //     name: requestBody.name,
    //     email: requestBody.email,
    //     ...(req.headers.get('X-Custom-Header')
    //       ? {
    //           meta: { custom: req.headers.get('X-Custom-Header') }
    //         }
    //       : {})
    //   })
    // );
    return HttpResponse.json({
      id: 23,
      name: requestBody.name,
      email: requestBody.email,
      ...(request.headers.get('X-Custom-Header')
        ? {
            meta: { custom: request.headers.get('X-Custom-Header') }
          }
        : {})
    });
  }),

  http.put(`${BASE_URL}/api/user/:userId`, async ({ params, request }) => {
    if (params.userId === '23') {
      // const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const requestBody = (await request.json()) as TTestUser;
      // return res(
      //   ctx.status(200),
      //   ctx.json({
      //     id: requestBody.id,
      //     name: requestBody.name,
      //     email: requestBody.email
      //   })
      // );
      return HttpResponse.json({
        id: requestBody!.id,
        name: requestBody!.name,
        email: requestBody!.email
      });
    }

    // return res(ctx.status(404), ctx.json({ error: 'User does not exist' }));
    return HttpResponse.json({ error: 'User does not exist' }, { status: 404 });
  }),

  http.delete(`${BASE_URL}/api/user/:userId`, async ({ params, request }) => {
    if (params.userId === '10') {
      // return res(
      //   ctx.status(200),
      //   ctx.json({
      //     deleted: true
      //   })
      // );
      return HttpResponse.json({ deleted: true });
    }

    if (params.userId === '15') {
      // const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const requestBody = (await request.json()) as TTestUser;

      // return res(
      //   ctx.status(200),
      //   ctx.json({
      //     deleted: true,
      //     user: {
      //       id: requestBody.id,
      //       name: requestBody.name,
      //       email: requestBody.email
      //     }
      //   })
      // );
      return HttpResponse.json({
        deleted: true,
        user: {
          id: requestBody!.id,
          name: requestBody!.name,
          email: requestBody!.email
        }
      });
    }

    // return res(ctx.status(404), ctx.json({ error: 'User does not exist' }));
    return HttpResponse.json({ error: 'User does not exist' }, { status: 404 });
  })
];
