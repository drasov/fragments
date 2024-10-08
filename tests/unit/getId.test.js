const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

// Mock Fragment model
jest.mock('../../src/model/fragment');

describe('GET /v1/fragments/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/randomid').expect(401));

  test('authenticated users get fragment data without conversion', async () => {
    const mockFragment = {
      id: 'fragment-id',
      type: 'text/plain',
      getData: jest.fn().mockResolvedValue('This is fragment'),
    };
    Fragment.byId.mockResolvedValue(mockFragment);

    const getRes = await request(app)
      .get(`/v1/fragments/fragment-id`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toEqual('This is fragment');
    expect(getRes.header['content-type']).toBe('text/plain; charset=utf-8');
  });

  test('returns converted data for a valid extension', async () => {
    const mockFragment = {
      id: 'fragment-id',
      type: 'text/plain',
      getData: jest.fn().mockResolvedValue('This is fragment'),
      convertType: jest.fn().mockResolvedValue({ 
        recvdata: JSON.stringify({message : 'Converted data'}) , 
        convertedType: 'application/json' }),
    };
    Fragment.byId.mockResolvedValue(mockFragment);

    const getRes = await request(app)
      .get(`/v1/fragments/fragment-id.json`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toEqual('{"message":"Converted data"}');
    expect(getRes.header['content-type']).toBe('application/json; charset=utf-8');
  });

  test('returns 415 if fragment cannot be converted', async () => {
    const mockFragment = {
      id: 'fragment-id',
      type: 'text/plain',
      getData: jest.fn().mockResolvedValue('This is fragment'),
      convertType: jest.fn().mockResolvedValue({ recvdata: null }), // Simulate conversion failure
    };
    Fragment.byId.mockResolvedValue(mockFragment);

    const getRes = await request(app)
      .get(`/v1/fragments/fragment-id.json`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(415);
    expect(getRes.body.error).toHaveProperty('message');
    expect(getRes.body.error.message).toEqual('Fragment couldn\'t be converted to this type or extension is invalid');
  });

  test('returns 404 if no fragment with the given id', async () => {
    Fragment.byId.mockResolvedValue(null); // Simulate no fragment found

    const getRes = await request(app)
      .get('/v1/fragments/invalid-id')
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(404);
    expect(getRes.body).toHaveProperty('error');
    expect(getRes.body.error.message).toEqual('No fragment with this ID');
  });
});
