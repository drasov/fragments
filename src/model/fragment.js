// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const logger = require('../logger');
// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({
    id = randomUUID(),
    ownerId = '',
    created = new Date().toISOString(),
    updated = new Date().toISOString(),
    type = '',
    size = 0,
  }) {
    if (!ownerId || !type) {
      throw new Error('ownerId and type are required');
    }

    if (!Fragment.isSupportedType(type)) {
      throw new Error('Invalid fragment type');
    }

    this.id = id;
    this.ownerId = ownerId;
    this.created = created;
    this.updated = updated;
    this.type = type;
    this.size = size;

    if (typeof this.size !== 'number' || this.size < 0) {
      throw new Error('size must be a non-negative number');
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    try {
      const fragments = await listFragments(ownerId, expand);
      if (expand) {
        return fragments.map((fragment) => new Fragment(fragment));
      }
      return fragments;
    } catch (err) {
      logger.error('Error retrieving fragments by user:', err);
      return [];
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    try {
      return new Fragment(await readFragment(ownerId, id));
    } catch (error) {
      logger.error('Cannot find any fragment by that id:', error);
      throw new Error('Cannot find any fragment by that id');
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise<void>
   */
  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);
  }
  

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    try {
      return readFragmentData(this.ownerId, this.id)
        .then((data) => Buffer.from(data))
        .catch(() => {
          throw new Error('unable to get data');
        });
    } catch (err) {
      logger.error('Error retrieving fragment data:', err);
      throw new Error('unable to get data');
    }
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!data) {
      throw new Error();
    } else {
      this.updated = new Date().toISOString();
      this.size = Buffer.byteLength(data);
      await writeFragment(this);
      return await writeFragmentData(this.ownerId, this.id, data);
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    const { type } = contentType.parse(this.type);
    return type.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    // Retrieves formats for the fragment
      return ['text/plain'];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    const validTypes = ['text/plain', 'text/plain; charset=utf-8'];
    const { type } = contentType.parse(value);
    return validTypes.includes(type);
  }
}

module.exports.Fragment = Fragment;