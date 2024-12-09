// src/routes/api/put.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  logger.debug('Test PUT: ' + req.body);
  
  // Ensure request body is a buffer
  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  const id = req.params.id.split('.')[0];
  const newContentType = req.get('Content-Type');

  try {
    const fragId = await Fragment.byId(req.user, id);
    if (!fragId) {
      return res
        .status(404)
        .json(createErrorResponse(404, 'No fragment exists with this id'));
    }

    // List of compatible text types that can be converted
    const textTypes = [
      'text/plain', 
      'text/markdown', 
      'text/html', 
      'text/csv', 
      'application/json'
    ];

    // Check if both original and new types are text types
    const isTextConversion = 
      textTypes.includes(fragId.type) && 
      textTypes.includes(newContentType);

    // If not a text conversion, require exact type match
    if (!isTextConversion && fragId.type !== newContentType) {
      return res
        .status(400)
        .json(
          createErrorResponse(400, "No match between the fragment's type and the request's type")
        );
    }

    const fragment = new Fragment({
      ownerId: req.user,
      id: id,
      created: fragId.created,
      type: newContentType, // Allow type change for text types
    });

    await fragment.save();
    await fragment.setData(req.body);

    logger.debug('Fragment updated: ' + JSON.stringify(fragment));
    res.set('Content-Type', fragment.type);
    res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(200).json( 
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (err) {
    res.status(500).json(createErrorResponse(500, err.message));
  }
};