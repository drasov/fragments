// src/app.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('App Middleware and Routes', () => {
  // Test 404 Not Found Handler
  test('should return HTTP 404 for non-existent routes', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        message: 'not found',
        code: 404,
      },
    });
  });

  // Test Root Route
  test('should return a successful response for root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
  });

  // Test custom 500 error
  test('should return HTTP 500 for internal server errors', async () => {
    const res = await request(app).get('/error'); // Test the /error route
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        message: 'Internal server error', 
        code: 500,
      },
    });
  });

  // Test custom 499 error
  test('should return HTTP 499 for custom errors', async () => {
    const res = await request(app).get('/custom-error'); // Test the /custom-error route
    expect(res.statusCode).toBe(499);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        message: 'Custom 499 error', 
        code: 499,
      },
    });
  });
  
});
