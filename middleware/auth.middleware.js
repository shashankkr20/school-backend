const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');
const httpStatus = require('http-status');
const { User } = require('../models');
const { jwtConfig } = require('../config');

/**
 * Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const auth = async (req, res, next) => {
  try {
    // 1. Get token from header
    const token = extractToken(req);
    
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication token missing');
    }

    // 2. Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // 3. Check if user still exists
    const user = await User.findByPk(decoded.id, {
      attributes: {
        include: ['id', 'email', 'role', 'is_verified']
      }
    });

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
    }

    // 4. Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'User recently changed password. Please log in again.'
      );
    }

    // 5. Check if account is verified
    if (!user.is_verified && req.path !== '/verify-email') {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Please verify your email address'
      );
    }

    // 6. Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Token expired'));
    }
    next(error);
  }
};

// Helper to extract token from various sources
function extractToken(req) {
  return (
    req.headers.authorization?.split(' ')[1] ||
    req.cookies?.accessToken ||
    req.query?.token
  );
}

// Add method to User model to check password change
User.prototype.changedPasswordAfter = function(JWTTimestamp) {
  if (this.password_changed_at) {
    const changedTimestamp = parseInt(
      this.password_changed_at.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = auth;