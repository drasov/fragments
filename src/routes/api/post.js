// /src/routes/api/post.js
const responseHandler = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createSuccessResponse, createErrorResponse } = responseHandler;

const postFragment = async (req, res) => {
  logger.debug('Received POST request with body: ', req.body);
 
  const contentType = req.get('Content-Type');

  // Function to create and save fragment
  const createAndSaveFragment = async (type, data) => {
    const fragmentData = {
      ownerId: req.user,
      type: type,
    };

    const fragment = new Fragment(fragmentData);
    await fragment.save();
    await fragment.setData(data);
    
    logger.debug('Fragment created successfully: ', JSON.stringify(fragment));
    
    // Set response headers
    res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    
    // Return success response with fragment metadata
    return res.status(201).json(createSuccessResponse({ fragment }));
  };

  try {
    // Handle JSON content type
    if (contentType === 'application/json') {
      return await createAndSaveFragment(
        'application/json',
        JSON.stringify(req.body)
      );
    }
    
    // Handle text/plain with charset
    if (contentType.startsWith('text/plain')) {
      // Preserve the full content type including charset if present
      return await createAndSaveFragment(
        contentType,
        Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body)
      );
    }
    
    // Handle other supported types
    if (Buffer.isBuffer(req.body)) {
      return await createAndSaveFragment(
        contentType,
        req.body
      );
    }

    // If we get here, the content type is unsupported
    return res.status(415).json(
      createErrorResponse(415, 'Unsupported Media Type')
    );
    
  } catch (error) {
    logger.error('Error creating fragment: ', error);
    return res.status(500).json(
      createErrorResponse(500, error.message)
    );
  }
};

module.exports = postFragment;