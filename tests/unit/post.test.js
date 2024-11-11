const request = require('supertest');
const app = require('../../src/app');
const logger = require('../../src/logger');

describe('POST /v1/fragments', () => {
  
  // Test unauthenticated requests
  test('should deny unauthenticated requests', () => {
    logger.info('Testing unauthenticated requests to POST /v1/fragments');
    return request(app)
      .post('/v1/fragments')
      .expect(401)
      .then(() => {
        logger.info('Received 401 status for unauthenticated request');
      })
      .catch(error => {
        logger.error('Error occurred during unauthenticated request test:', error);
      });
  });

  // Test requests with incorrect credentials
  test('should deny requests with incorrect credentials', () => {
    return request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401)
      .then(() => {
        logger.info('Received 401 status for incorrect credentials');
      })
      .catch(error => {
        logger.error('Error occurred during incorrect credentials test:', error);
      })
  });

  // Test authenticated user creating a plain text fragment
  test('should allow authenticated users to create a plain text fragment and include expected properties in the response', async () => {
    logger.info('Testing authenticated user creating a plain text fragment');
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('hello professor :)');

    const responseBody = JSON.parse(response.text);

    expect(response.statusCode).toBe(201);
    expect(responseBody.status).toBe('ok');
    expect(responseBody.fragment.type).toMatch(/text\/plain/);
    expect(Object.keys(responseBody.fragment)).toEqual([
      'id',
      'ownerId',
      'created',
      'updated',
      'type',
      'size',
    ]);
    expect(responseBody.fragment.size).toEqual(18);
    expect(responseBody.fragment.id).toMatch(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    );
    logger.info('Successfully created a plain text fragment:', responseBody.fragment);
  });

  // Test Location header for created fragment
  test('should include a Location header with a URL to GET the fragment', async () => {
    logger.info('Testing Location header for created fragment');
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');
    
    expect(response.statusCode).toBe(201);
    const expectedLocation = `${process.env.API_URL}/v1/fragments/${JSON.parse(response.text).fragment.id}`;
    expect(response.headers.location).toBe(expectedLocation);
    logger.info('Received Location header for created fragment:', expectedLocation);
  });

  // Test unsupported type error
  test('should return unsupported type error when creating a fragment with an unsupported type', () => {
    return request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'audio/mp4')
      .auth('user1@email.com', 'password1')
      .send('aa')
      .expect(415)
      .then(() => {
        logger.info('Received 415 status for unsupported type error');
      })
      .catch(error => {
        logger.error('Error occurred during unsupported type test:', error);
      });
  });

  // Test creating a fragment with application/json content type
  test('should allow authenticated users to create a JSON fragment and include expected properties in the response', async () => {
    logger.info('Testing authenticated user creating a JSON fragment');
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ message: 'hello professor :)' });

    const responseBody = JSON.parse(response.text);

    expect(response.statusCode).toBe(201);
    expect(responseBody.status).toBe('ok');
    expect(responseBody.fragment.type).toBe('application/json');
    expect(Object.keys(responseBody.fragment)).toEqual([
      'id',
      'ownerId',
      'created',
      'updated',
      'type',
      'size',
    ]);
    expect(responseBody.fragment.size).toBeGreaterThan(0);
    expect(responseBody.fragment.id).toMatch(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    );
    logger.info('Successfully created a JSON fragment:', responseBody.fragment);
  });

  // Test error handling with an empty body (e.g., missing data)
  test('should return 400 for request with empty body', () => {
    return request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('')
      .expect(400)
      .then(() => {
        logger.info('Received 400 status for empty body');
      })
      .catch(error => {
        logger.error('Error occurred during empty body test:', error);
      });
  });

  // Test for invalid Content-Type headers
  test('should return 415 for unsupported Content-Type', () => {
    return request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/xml')
      .send('<xml>data</xml>')
      .expect(415)
      .then(() => {
        logger.info('Received 415 status for invalid Content-Type');
      })
      .catch(error => {
        logger.error('Error occurred during invalid Content-Type test:', error);
      });
  });
});
