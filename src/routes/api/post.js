const responseHandler = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

const { createSuccessResponse, createErrorResponse } = responseHandler;

const postFragment = async (req, res) => {
  logger.debug('Received POST request with body: ', req.body);

  const isBuffer = Buffer.isBuffer(req.body);
  if (!isBuffer) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  try {
    const fragmentData = {
      ownerId: req.user,
      type: req.get('Content-Type'),
    };
    const fragment = new Fragment(fragmentData);
    await fragment.save();
    await fragment.setData(req.body);

    logger.debug('Fragment created successfully: ', JSON.stringify(fragment));

    res.set('Content-Type', fragment.type);
    res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    return res.status(201).json(createSuccessResponse({ fragment }));
  } catch (error) {
    logger.error('Error creating fragment: ', error);
    return res.status(500).json(createErrorResponse(500, error.message));
  }
};

module.exports = postFragment;
