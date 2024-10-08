// src/model/data/index.js
const logger = require('../../logger');

// Re-export the memory module
logger.info('Memory database module is being used');
module.exports = require('./memory');
