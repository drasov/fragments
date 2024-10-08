// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const authenticate = require('./auth');
const { createErrorResponse } = require('./response');

const logger = require('./logger');
const pino = require('pino-http')({
  // Use our default logger instance, which is already configured
  logger,
});

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Set up our passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Define our routes
app.use('/', require('./routes'));

// Error-triggering route for testing 500 error
app.get('/error', (req, res, next) => {
  next(new Error('Internal server error')); // Triggers 500
});

// Error-triggering route for testing 499 error
app.get('/custom-error', (req, res, next) => {
  const err = new Error('Custom 499 error');
  err.status = 499; // Custom status code
  next(err); // Pass the error to the error handler
});

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // use a generic `500` server error and message.
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  // If this is a server error, then log error
  if (status > 499) {
    logger.error({ err }, `Error processing request`);
  }

  res.status(status).json(createErrorResponse(status, message));
});

// Export our `app` so we can access it in server.js
module.exports = app;
