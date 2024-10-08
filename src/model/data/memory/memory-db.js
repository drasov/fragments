const logger = require('../../../../src/logger'); 

const validateKey = (key) => typeof key === 'string';

class MemoryDB {
  constructor() {
    /** @type {Record<string, any>} */
    this.db = {};
  }

  /**
   * Gets a value for the given primaryKey and secondaryKey
   * @param {string} primaryKey
   * @param {string} secondaryKey
   * @returns {Promise<any>}
   */
  get(primaryKey, secondaryKey) {
    if (!(validateKey(primaryKey) && validateKey(secondaryKey))) {
      const errorMsg = `primaryKey and secondaryKey strings are required, got primaryKey=${primaryKey}, secondaryKey=${secondaryKey}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const value = this.db[primaryKey]?.[secondaryKey];
    logger.info(`Getting value for primaryKey=${primaryKey}, secondaryKey=${secondaryKey}`);
    
    return Promise.resolve(value);
  }

  /**
   * Puts a value into the given primaryKey and secondaryKey
   * @param {string} primaryKey
   * @param {string} secondaryKey
   * @returns {Promise<void>}
   */
  put(primaryKey, secondaryKey, value) {
    if (!(validateKey(primaryKey) && validateKey(secondaryKey))) {
      const errorMsg = `primaryKey and secondaryKey strings are required, got primaryKey=${primaryKey}, secondaryKey=${secondaryKey}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Make sure the `primaryKey` exists, or create
    this.db[primaryKey] = this.db[primaryKey] || {};
    this.db[primaryKey][secondaryKey] = value;
    logger.info(`Putting value for primaryKey=${primaryKey}, secondaryKey=${secondaryKey}`);

    return Promise.resolve();
  }

  /**
   * Queries the list of values (i.e., secondaryKeys) for the given primaryKey.
   * Always returns an Array, even if no items are found.
   * @param {string} primaryKey
   * @returns {Promise<any[]>}
   */
  query(primaryKey) {
    if (!validateKey(primaryKey)) {
      const errorMsg = `primaryKey string is required, got primaryKey=${primaryKey}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const values = this.db[primaryKey] ? Object.values(this.db[primaryKey]) : [];
    logger.info(`Querying values for primaryKey=${primaryKey}, found ${values.length} items`);

    return Promise.resolve(values);
  }

  /**
   * Deletes the value with the given primaryKey and secondaryKey
   * @param {string} primaryKey
   * @param {string} secondaryKey
   * @returns {Promise<void>}
   */
  async del(primaryKey, secondaryKey) {
    if (!(validateKey(primaryKey) && validateKey(secondaryKey))) {
      const errorMsg = `primaryKey and secondaryKey strings are required, got primaryKey=${primaryKey}, secondaryKey=${secondaryKey}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Throw if trying to delete a key that doesn't exist
    if (!(await this.get(primaryKey, secondaryKey))) {
      const errorMsg = `missing entry for primaryKey=${primaryKey} and secondaryKey=${secondaryKey}`;
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    delete this.db[primaryKey][secondaryKey];
    logger.info(`Deleted value for primaryKey=${primaryKey}, secondaryKey=${secondaryKey}`);

    return Promise.resolve();
  }
}

module.exports = MemoryDB;
