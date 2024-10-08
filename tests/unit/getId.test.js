const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should return a 401
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/randomid').expect(401));

  // Fetches the fragment and returns its content if no extension is provided
  test('authenticated users get fragment data without conversion', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');
    const id = JSON.parse(postRes.text).fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toEqual('This is fragment');
  });

  // Verifies 404 error when no fragment is found for a given ID
  test('returns 404 if no fragment with the given id', async () => {
    const getRes = await request(app)
      .get('/v1/fragments/invalid-id')
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(404);
  });
});
