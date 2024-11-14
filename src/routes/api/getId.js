// src/routes/api/getId.js
const path = require('path');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  logger.debug(`owner id and id: ${req.user}, ${req.params.id}`);
  try {
    // Retrieve the fragment using the user ID and fragment ID
    const fragmentId = req.params.id.split('.')[0];
    const fragment = await Fragment.byId(req.user, fragmentId);
    const data = await fragment.getData();
    logger.debug('data: ' + data);
    
    // Extract the file extension from the fragment ID
    const extension = path.extname(req.params.id);
    logger.debug('extension: ' + extension);

    if (extension) {
      // Handle conversion case
      const { recvdata, convertedType } = await fragment.convertType(data, extension);
      if (!recvdata) {
        return res.status(415).json(
          createErrorResponse(415, 'Fragment couldn\'t be converted to this type or extension is invalid')
        );
      }
      
      res.set('Content-Type', convertedType);
      return res.status(200).send(recvdata);
    } else {
      // Check if the fragment type is JSON
      const isJsonType = fragment.type.includes('application/json');
      const isTextType = fragment.type.startsWith('text/');

      if (isJsonType) {
        // For JSON fragments, return wrapped response
        logger.debug(`Sending JSON fragment data for fragment ID: ${fragmentId}`);
        res.set('Content-Type', 'application/json; charset=utf-8');
        
        const responseObject = {
          status: 'ok',
          fragment: {
            id: fragment.id,
            ownerId: fragment.ownerId,
            created: fragment.created,
            updated: fragment.updated,
            type: fragment.type,
            size: fragment.size,
            data: JSON.parse(data.toString())
          }
        };

        return res.status(200).json(responseObject);
      } else if (isTextType) {
        // For text fragments, return raw content with original content type
        logger.debug(`Sending text fragment data for fragment ID: ${fragmentId}`);
        res.set('Content-Type', fragment.type);
        const textContent = data.toString();
        res.set('Content-Length', Buffer.byteLength(textContent));
        return res.status(200).send(textContent);
      } else {
        // For other types, return raw content with original content type
        logger.debug(`Sending raw fragment data for fragment ID: ${fragmentId}`);
        res.set('Content-Type', fragment.type);
        return res.status(200).send(data);
      }
    }
  } catch (e) {
    logger.warn(`Error occurred while retrieving fragment by ID: ${req.params.id}. Error message: ${e.message}`);
    return res.status(404).json(createErrorResponse(404, 'No fragment with this ID'));
  }
};