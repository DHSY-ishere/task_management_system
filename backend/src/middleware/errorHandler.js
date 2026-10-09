const ApiError = require('../utils/ApiError');
const { nodeEnv } = require('../config/env');

const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

// Express recognises error handlers by their 4-argument signature
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  if (statusCode >= 500) {
    console.error(err);
    if (nodeEnv === 'production') message = 'Internal server error';
  }

  const body = { success: false, message };
  if (err.details) body.errors = err.details;
  res.status(statusCode).json(body);
};

module.exports = { notFoundHandler, errorHandler };
