const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug(`owner id and id: ${req.user}, ${req.params.id}`);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Theres no fragment with this id'));
    }
    res.status(200).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (e) {
    res.status(404).json(createErrorResponse(404, e.message));
  }
};