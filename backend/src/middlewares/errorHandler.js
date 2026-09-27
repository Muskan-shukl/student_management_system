const mongoose = require('mongoose');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// Normalise Mongoose / unknown errors into ApiError so every response has the same shape.
const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return ApiError.badRequest('Validation failed', errors);
  }

  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for "${err.path}"`);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`${field} "${err.keyValue?.[field]}" is already in use`, [
      { field, message: 'Already in use' },
    ]);
  }

  if (err.type === 'entity.parse.failed') {
    return ApiError.badRequest('Malformed JSON body');
  }

  return new ApiError(err.statusCode || 500, err.message || 'Internal server error');
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);
  const isServerError = error.statusCode >= 500;

  if (isServerError) console.error(err);

  const body = {
    success: false,
    message: isServerError && env.isProduction ? 'Internal server error' : error.message,
  };
  if (error.errors?.length) body.errors = error.errors;
  if (isServerError && !env.isProduction) body.stack = err.stack;

  res.status(error.statusCode).json(body);
};

module.exports = errorHandler;
