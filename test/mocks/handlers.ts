import { http, HttpResponse } from 'msw';
import { TTestUser } from './test-types';

const BASE_URL = 'https://localhost';

export const handlers = [
  http.get(`${BASE_URL}/api/user/:userId`, ({ params, request }) => {
    if (params.userId === '0') {
      return HttpResponse.json({});
    }

    if (params.userId === '3') {
      return HttpResponse.xml(
        '<user><id>3</id><name>Allen</name><email>a.iverson@email.com</email></user>'
      );
    }

    if (params.userId === '12') {
      return HttpResponse.text('id=12,name=John,email=j.stockton@email.com');
    }

    if (params.userId === '15') {
      const customHeader = request.headers.get('X-Custom-Header');
      if (customHeader && customHeader !== 'Vince') {
        return HttpResponse.text('', { status: 500 });
      }

      return HttpResponse.json({
        id: 15,
        name: 'Vince',
        email: 'v.carter@email.com'
      });
    }

    if (params.userId === '20') {
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
    }

    if (params.userId === '23') {
      const customHeader = request.headers.get('X-Custom-Header');
      return HttpResponse.json({
        id: 23,
        name: 'Michael',
        email: 'm.jordan@email.com',
        meta: customHeader
      });
    }

    return HttpResponse.json({ error: 'User does not exist' }, { status: 404 });
  }),

  http.post(`${BASE_URL}/api/user`, async ({ request }) => {
    const url = new URL(request.url);
    if (
      url.searchParams.get('status') === 'error' ||
      request.headers.get('X-Custom-Header') === 'raise-error'
    ) {
      return HttpResponse.json({ error: 'Something went really wrong' }, { status: 500 });
    }

    const requestBody = (await request.json()) as TTestUser;

    if (requestBody.name === 'Karl' && request.headers.get('Content-Type') !== 'application/json') {
      return HttpResponse.json({ error: 'Invalid Content-Type header' }, { status: 500 });
    }

    return HttpResponse.json(
      {
        id: 23,
        name: requestBody.name,
        email: requestBody.email,
        ...(request.headers.get('X-Custom-Header')
          ? {
              meta: { custom: request.headers.get('X-Custom-Header') }
            }
          : {})
      },
      { status: 201 }
    );
  }),

  http.put(`${BASE_URL}/api/user/:userId`, async ({ params, request }) => {
    if (params.userId === '23') {
      const requestBody = (await request.json()) as TTestUser;
      return HttpResponse.json({
        id: requestBody!.id,
        name: requestBody!.name,
        email: requestBody!.email
      });
    }

    return HttpResponse.json({ error: 'User does not exist' }, { status: 404 });
  }),

  http.delete(`${BASE_URL}/api/user/:userId`, async ({ params, request }) => {
    if (params.userId === '10') {
      return HttpResponse.json({ deleted: true });
    }

    if (params.userId === '15') {
      const requestBody = (await request.json()) as TTestUser;

      return HttpResponse.json({
        deleted: true,
        user: {
          id: requestBody!.id,
          name: requestBody!.name,
          email: requestBody!.email
        }
      });
    }

    return HttpResponse.json({ error: 'User does not exist' }, { status: 404 });
  })
];
