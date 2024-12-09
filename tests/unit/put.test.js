const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments', () => {
  test('request refused due to lack of validation', () =>
    request(app).put('/v1/fragments/random').expect(401));

  test('Due to invalid login credentials, the client request denied', () =>
    request(app)
      .put('/v1/fragments/random')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('User authenticated can update the fragment', async () => {
    // Create a fragment first
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');
    expect(postRes.statusCode).toBe(201);

    const id = JSON.parse(postRes.text).fragment.id;

    // Update the fragment
    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is updated fragment');

    const body = JSON.parse(putRes.text);

    // Assert successful update
    expect(putRes.statusCode).toBe(200); // Updated resource
    expect(body.status).toBe('ok');
    expect(body.fragment.type).toBe('text/plain');
    expect(body.fragment.size).toEqual(24);

    // Verify the fragment's info
    const getRes = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user2@email.com', 'password2');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.status).toBe('ok');
    expect(getRes.body.fragment).toEqual(body.fragment);
  });

  test('User authenticated and attempts valid text type conversion', async () => {
    // Create a fragment first
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');
    expect(postRes.statusCode).toBe(201);
  
    const id = JSON.parse(postRes.text).fragment.id;
  
    // Attempt to update with a compatible text type
    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/markdown') // Compatible type
      .send('This is updated fragment');
  
    // Assert successful conversion
    expect(putRes.statusCode).toBe(200);
    const body = JSON.parse(putRes.text);
    expect(body.status).toBe('ok');
    expect(body.fragment.type).toBe('text/markdown');
  });

  test('returns 415 for unsupported media type on PUT request', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');
    const id = JSON.parse(postRes.text).fragment.id;
  
    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'application/xml') // Unsupported type
      .send('<fragment>Invalid</fragment>');
  
    expect(putRes.statusCode).toBe(415); // Unsupported media type
  });
  
  
});
