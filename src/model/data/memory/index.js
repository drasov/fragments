const MemoryDB = require('./memory-db');
const logger = require('../../../../src/logger'); 

// Create two in-memory databases: one for fragment metadata and the other for raw data
const data = new MemoryDB();
const metadata = new MemoryDB();

// Write a fragment's metadata to memory db. Returns a Promise
function writeFragment(fragment) {
  logger.info(`Writing fragment metadata for ownerId: ${fragment.ownerId}, id: ${fragment.id}`);
  return metadata.put(fragment.ownerId, fragment.id, fragment)
    .then(() => {
      logger.info(`Successfully wrote fragment metadata for ownerId: ${fragment.ownerId}, id: ${fragment.id}`);
    })
    .catch(err => {
      logger.error(`Error writing fragment metadata for ownerId: ${fragment.ownerId}, id: ${fragment.id}: ${err.message}`);
      throw err;
    });
}

// Read a fragment's metadata from memory db. Returns a Promise
function readFragment(ownerId, id) {
  logger.info(`Reading fragment metadata for ownerId: ${ownerId}, id: ${id}`);
  return metadata.get(ownerId, id)
    .then(fragment => {
      if (fragment) {
        logger.info(`Successfully read fragment metadata for ownerId: ${ownerId}, id: ${id}`);
      } else {
        logger.warn(`Fragment metadata not found for ownerId: ${ownerId}, id: ${id}`);
      }
      return fragment;
    })
    .catch(err => {
      logger.error(`Error reading fragment metadata for ownerId: ${ownerId}, id: ${id}: ${err.message}`);
      throw err;
    });
}

// Write a fragment's data buffer to memory db. Returns a Promise
function writeFragmentData(ownerId, id, buffer) {
  logger.info(`Writing fragment data for ownerId: ${ownerId}, id: ${id}`);
  return data.put(ownerId, id, buffer)
    .then(() => {
      logger.info(`Successfully wrote fragment data for ownerId: ${ownerId}, id: ${id}`);
    })
    .catch(err => {
      logger.error(`Error writing fragment data for ownerId: ${ownerId}, id: ${id}: ${err.message}`);
      throw err;
    });
}

// Read a fragment's data from memory db. Returns a Promise
function readFragmentData(ownerId, id) {
  logger.info(`Reading fragment data for ownerId: ${ownerId}, id: ${id}`);
  return data.get(ownerId, id)
    .then(buffer => {
      if (buffer) {
        logger.info(`Successfully read fragment data for ownerId: ${ownerId}, id: ${id}`);
      } else {
        logger.warn(`Fragment data not found for ownerId: ${ownerId}, id: ${id}`);
      }
      return buffer;
    })
    .catch(err => {
      logger.error(`Error reading fragment data for ownerId: ${ownerId}, id: ${id}: ${err.message}`);
      throw err;
    });
}

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
async function listFragments(ownerId, expand = false) {
  logger.info(`Listing fragments for ownerId: ${ownerId}, expand: ${expand}`);
  const fragments = await metadata.query(ownerId);

  // If we don't get anything back, or are supposed to give expanded fragments, return
  if (expand || !fragments) {
    logger.info(`Returning expanded fragments for ownerId: ${ownerId}`);
    return fragments;
  }

  logger.info(`Returning fragment IDs for ownerId: ${ownerId}`);
  // Otherwise, map to only send back the ids
  return fragments.map((fragment) => fragment.id);
}

// Delete a fragment's metadata and data from memory db. Returns a Promise
function deleteFragment(ownerId, id) {
  logger.info(`Deleting fragment for ownerId: ${ownerId}, id: ${id}`);
  return Promise.all([
    // Delete metadata
    metadata.del(ownerId, id)
      .then(() => {
        logger.info(`Deleted metadata for ownerId: ${ownerId}, id: ${id}`);
      })
      .catch(err => {
        logger.error(`Error deleting metadata for ownerId: ${ownerId}, id: ${id}: ${err.message}`);
        throw err;
      }),
    // Delete data
    data.del(ownerId, id)
      .then(() => {
        logger.info(`Deleted data for ownerId: ${ownerId}, id: ${id}`);
      })
      .catch(err => {
        logger.error(`Error deleting data for ownerId: ${ownerId}, id: ${id}: ${err.message}`);
        throw err;
      }),
  ]);
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
