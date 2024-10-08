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
      // Attempt to convert the fragment to the requested type
      const { recvdata, convertedType } = await fragment.convertType(data, extension);

      if (!recvdata) {
        return res.status(415).json(
          createErrorResponse(415, 'Fragment couldn\'t be converted to this type or extension is invalid')
        );
      }
      
      // Set the response content type and send the converted data
      res.set('Content-Type', convertedType);
      return res.status(200).send(recvdata);
    } else {
      // If no conversion is needed, send the original fragment data
      logger.debug(`Sending original fragment data for fragment ID: ${fragmentId}, type: ${fragment.type}`);
      res.set('Content-Type', fragment.type);
      return res.status(200).send(data);
    }
  } catch (e) {
    logger.warn(`Error occurred while retrieving fragment by ID: ${req.params.id}. Error message: ${e.message}`);
    return res.status(404).json(createErrorResponse(404, 'No fragment with this ID'));
  }
};
