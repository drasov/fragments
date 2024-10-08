const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragment,
  listFragments,
} = require('../../src/model/data/memory');

const MemoryDB = require('../../src/model/data/memory/memory-db');
const logger = require('../../src/logger');

// Mock the MemoryDB used in the actual implementation
jest.mock('../../src/model/data/memory/memory-db', () => {
  return jest.fn().mockImplementation(() => {
    const db = {};
    return {
      put: (ownerId, id, value) => {
        db[`${ownerId}:${id}`] = value;
        return Promise.resolve();
      },
      get: (ownerId, id) => {
        return Promise.resolve(db[`${ownerId}:${id}`] || null);
      },
      del: (ownerId, id) => {
        delete db[`${ownerId}:${id}`];
        return Promise.resolve();
      },
      query: (ownerId) => {
        return Promise.resolve(Object.values(db).filter(item => item.ownerId === ownerId));
      },
      clear: () => {
        Object.keys(db).forEach(key => delete db[key]);
        return Promise.resolve();
      },
    };
  });
});

// Create an in-memory database for testing
const data = new MemoryDB();

describe('In-Memory Fragment Database', () => {
  const fragment1 = {
    id: 'fragment1',
    ownerId: 'owner123',
    type: 'text/plain',
  };

  const fragment2 = {
    id: 'fragment2',
    ownerId: 'owner123',
    type: 'text/plain',
  };

  const buffer = Buffer.from('Some fragment data');

  beforeEach(async () => {
    // Clear the in-memory database before each test
    await data.clear();
    logger.info('Cleared in-memory database before each test');
  });

  // Test writing a fragment and verifying it can be read back
  test('should write a fragment and read it back', async () => {
    logger.info('Testing writing a fragment and reading it back');
    await writeFragment(fragment1);
    const result = await readFragment(fragment1.ownerId, fragment1.id);
    expect(result).toEqual(fragment1);
    logger.info('Successfully wrote and read back the fragment:', result);
  });

  // Test writing fragment data and verifying it can be read back
  test('should write fragment data and read it back', async () => {
    logger.info('Testing writing fragment data and reading it back');
    await writeFragmentData(fragment1.ownerId, fragment1.id, buffer);
    const result = await readFragmentData(fragment1.ownerId, fragment1.id);
    expect(result).toEqual(buffer);
    logger.info('Successfully wrote and read back fragment data:', result);
  });

  // Test deleting an existing fragment
  test('should delete an existing fragment', async () => {
    logger.info('Testing deleting an existing fragment');
    await writeFragment(fragment1);
    await deleteFragment(fragment1.ownerId, fragment1.id);
    const result = await readFragment(fragment1.ownerId, fragment1.id);
    expect(result).toBeNull(); 
    logger.info('Successfully deleted the fragment and confirmed it is no longer present:', result);
  });

  // Test deleting a non-existing fragment
  test('should not throw an error when deleting a non-existing fragment', async () => {
    logger.info('Testing deleting a non-existing fragment');
    await expect(deleteFragment(fragment1.ownerId, fragment1.id)).resolves.not.toThrow();
    logger.info('Successfully handled deletion of a non-existing fragment without error');
  });

  // Test listing fragments for a specific owner
  test('should list fragments for a specific owner', async () => {
    logger.info('Testing listing fragments for a specific owner');
    await writeFragment(fragment1);
    await writeFragment(fragment2);
    const result = await listFragments(fragment1.ownerId);
    expect(result).toEqual([fragment1.id, fragment2.id]);
    logger.info('Successfully listed fragments for the owner:', result);
  });

  // Test listing fragments with expand flag
  test('should list expanded fragments when expand flag is true', async () => {
    logger.info('Testing listing expanded fragments with expand flag');
    await writeFragment(fragment1);
    await writeFragment(fragment2);
    const result = await listFragments(fragment1.ownerId, true);
    expect(result).toEqual([fragment1, fragment2]); 
    logger.info('Successfully listed expanded fragments for the owner:', result);
  });

  // Test listing fragments when there are none
  test('should return an empty array when no fragments exist for the owner', async () => {
    logger.info('Testing listing fragments when none exist for the owner');
    const result = await listFragments('nonExistingOwner');
    expect(result).toEqual([]);
    logger.info('Successfully confirmed no fragments exist for the specified owner:', result);
  });
});
