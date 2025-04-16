const { ApiError } = require('../utils/apiError');
const httpStatus = require('http-status');
const Joi = require('joi');

/**
 * Generic Joi validation middleware
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} [source='body'] - Request property to validate (body, query, params)
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(details => details.message)
        .join(', ');
      
      return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage, {
        validationErrors: error.details.map(d => ({
          message: d.message,
          path: d.path,
          type: d.type
        }))
      }));
    }

    // Replace with validated value
    req[source] = value;
    next();
  };
};

/**
 * MongoDB ID validation middleware
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApiError(httpStatus.BAD_REQUEST, 'Invalid ID format'));
  }
  
  next();
};

/**
 * File upload validation middleware
 */
const validateFileUpload = (fieldName, allowedTypes, maxSizeMB) => {
  return (req, res, next) => {
    const file = req.files?.[fieldName];
    
    if (!file) {
      return next(new ApiError(httpStatus.BAD_REQUEST, `File ${fieldName} is required`));
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return next(new ApiError(
        httpStatus.BAD_REQUEST, 
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      ));
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return next(new ApiError(
        httpStatus.BAD_REQUEST,
        `File too large. Max size: ${maxSizeMB}MB`
      ));
    }

    next();
  };
};

module.exports = {
  validate,
  validateId,
  validateFileUpload
};