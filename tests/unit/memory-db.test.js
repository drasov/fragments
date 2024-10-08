// Fix this path to point to your project's `memory-db.js` source file
const MemoryDB = require('../../src/model/data/memory/memory-db');
const logger = require('../../src/logger');

describe('memory-db', () => {
  let db;

  // Each test will get its own, empty database instance
  beforeEach(() => {
    db = new MemoryDB();
  });

  test('put() returns nothing', async () => {
    logger.info('Testing put() returns nothing');
    const result = await db.put('a', 'b', {});
    expect(result).toBe(undefined);
  });

  test('get() returns what we put() into the db', async () => {
    logger.info('Testing get() returns what we put() into the db');
    const data = { value: 123 };
    await db.put('a', 'b', data);
    const result = await db.get('a', 'b');
    expect(result).toEqual(data);
  });

  test('put() and get() work with Buffers', async () => {
    logger.info('Testing put() and get() work with Buffers');
    const data = Buffer.from([1, 2, 3]);
    await db.put('a', 'b', data);
    const result = await db.get('a', 'b');
    expect(result).toEqual(data);
  });

  test('get() with incorrect secondaryKey returns nothing', async () => {
    logger.info('Testing get() with incorrect secondaryKey returns nothing');
    await db.put('a', 'b', 123);
    const result = await db.get('a', 'c');
    expect(result).toBe(undefined);
  });

  test('query() returns all secondaryKey values', async () => {
    logger.info('Testing query() returns all secondaryKey values');
    await db.put('a', 'a', { value: 1 });
    await db.put('a', 'b', { value: 2 });
    await db.put('a', 'c', { value: 3 });

    const results = await db.query('a');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });
  
  test('query() returns empty array', async () => {
    logger.info('Testing query() returns empty array');
    await db.put('b', 'a', { value: 1 });
    await db.put('b', 'b', { value: 2 });
    await db.put('b', 'c', { value: 3 });

    const results = await db.query('a');
    expect(Array.isArray(results)).toBe(true);
    expect(results).toEqual([]);
  });

  test('del() removes value put() into db', async () => {
    logger.info('Testing del() removes value put() into db');
    await db.put('a', 'a', { value: 1 });
    expect(await db.get('a', 'a')).toEqual({ value: 1 });
    await db.del('a', 'a');
    expect(await db.get('a', 'a')).toBe(undefined);
  });

  test('del() throws if primaryKey and secondaryKey not in db', () => {
    logger.info('Testing del() throws if primaryKey and secondaryKey not in db');
    expect(() => db.del('a', 'a')).rejects.toThrow();
  });

  test('get() expects string keys', () => {
    logger.info('Testing get() expects string keys'); 
    expect(async () => await db.get()).rejects.toThrow();
    expect(async () => await db.get(1)).rejects.toThrow();
    expect(async () => await db.get(1, 1)).rejects.toThrow();
  });

  test('put() expects string keys', () => {
    logger.info('Testing put() expects string keys');
    expect(async () => await db.put()).rejects.toThrow();
    expect(async () => await db.put(1)).rejects.toThrow();
    expect(async () => await db.put(1, 1)).rejects.toThrow();
  });

  test('query() expects string key', () => {
    logger.info('Testing query() expects string key');
    expect(async () => await db.query()).rejects.toThrow();
    expect(async () => await db.query(1)).rejects.toThrow();
  });

  test('del() expects string keys', () => {
    logger.info('Testing del() expects string keys');
    expect(async () => await db.del()).rejects.toThrow();
    expect(async () => await db.del(1)).rejects.toThrow();
    expect(async () => await db.del(1, 1)).rejects.toThrow();
  });
});