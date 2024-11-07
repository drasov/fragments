// /src/routes/api/post.js
const responseHandler = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

const { createSuccessResponse, createErrorResponse } = responseHandler;

const postFragment = async (req, res) => {
  logger.debug('Received POST request with body: ', req.body);
  
  const contentType = req.get('Content-Type');

  // Handle JSON content type (application/json)
  if (contentType === 'application/json') {
    // Assuming the body is already parsed as JSON
    const fragmentData = {
      ownerId: req.user,
      type: contentType,
    };

    try {
      const fragment = new Fragment(fragmentData);
      await fragment.save();
      await fragment.setData(JSON.stringify(req.body)); // Save JSON as string or buffer
      logger.debug('Fragment created successfully: ', JSON.stringify(fragment));

      res.set('Content-Type', fragment.type);
      res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
      return res.status(201).json(createSuccessResponse({ fragment }));
    } catch (error) {
      logger.error('Error creating fragment: ', error);
      return res.status(500).json(createErrorResponse(500, error.message));
    }
  }

  // Handle text/plain and other types, ensuring Buffer is used
  if (Buffer.isBuffer(req.body)) {
    const fragmentData = {
      ownerId: req.user,
      type: contentType,
    };

    try {
      const fragment = new Fragment(fragmentData);
      await fragment.save();
      await fragment.setData(req.body);
      logger.debug('Fragment created successfully: ', JSON.stringify(fragment));

      const locationUrl = `${process.env.API_URL}/v1/fragments/${fragment.id}`;
      logger.debug(`Location: ${locationUrl}`)

      res.set('Content-Type', fragment.type);
      res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
      return res.status(201).json(createSuccessResponse({ fragment }));
    } catch (error) {
      logger.error('Error creating fragment: ', error);
      return res.status(500).json(createErrorResponse(500, error.message));
    }
  }

  // If the content type is unsupported
  return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
};


module.exports = postFragment;




