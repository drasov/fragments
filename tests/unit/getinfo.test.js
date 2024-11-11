const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  
  // Test unauthenticated requests
  it('should deny unauthenticated requests', async () => {
    await request(app)
      .get('/v1/fragments/randomid/info')
      .expect(401);
  });

  // Test requests with incorrect credentials
  it('should deny requests with incorrect credentials', async () => {
    await request(app)
      .get('/v1/fragments/randomid/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401);
  });

  // Test authenticated user retrieving fragment data by ID
  it('should allow authenticated users to retrieve fragment data by ID', async () => {
    // Create a new fragment
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');

    const { fragment } = JSON.parse(postResponse.text);
    const { id } = fragment;

    // Fetch fragment info by ID
    const getResponse = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.status).toBe('ok');
    expect(getResponse.body.fragment).toEqual(fragment);
  });
});
