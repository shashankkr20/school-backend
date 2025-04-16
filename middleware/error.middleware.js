const { ApiError } = require('../utils/apiError');
const httpStatus = require('http-status');
const logger = require('../config/logger');
const { env } = require('../config/config');

/**
 * Convert error to ApiError if needed
 */
const errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    const statusCode = 
      error.statusCode || 
      error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, {
      stack: error.stack,
      originalError: env === 'development' ? err : undefined
    });
  }
  next(error);
};

/**
 * Handle all errors and send response
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message, details } = err;
  
  if (env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    success: false,
    error: {
      code: statusCode,
      message,
      ...details
    }
  };

  if (env === 'development') {
    response.error.stack = err.stack;
    logger.error(err);
  }

  // Log error in production (without sensitive data)
  if (env === 'production') {
    logger.error(err.message, {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      ...(req.user && { userId: req.user.id })
    });
  }

  res.status(statusCode).json(response);
};

/**
 * Catch 404 and forward to error handler
 */
const notFound = (req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
};

module.exports = {
  errorConverter,
  errorHandler,
  notFound
};