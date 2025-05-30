// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

const router = express.Router();

const rawBody = () =>
    express.raw({
      inflate: true,
      limit: '5mb',
      type: (req) => {
        // See if we can parse this content type. If we can, `req.body` will be
        // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
        // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
        const { type } = contentType.parse(req);
        logger.debug('Type after parse: ' + type);
        return Fragment.isSupportedType(type);
      },
    });


// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));

router.get('/fragments/:id', require('./getId'));

router.get('/fragments/:id/info', require('./getInfo'));

// Other routes (POST, DELETE, etc.) will go here later on...
router.post('/fragments', rawBody(), require('./post'));

router.delete('/fragments/:id', require('./delete'));

router.put('/fragments/:id', rawBody(), require('./put'));
module.exports = router;