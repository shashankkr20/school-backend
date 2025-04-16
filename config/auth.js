// config/auth.js
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');
const { User } = require('../models');
const { jwtConfig } = require('./config');

/**
 * Generate JWT tokens
 * @param {Object} user - User object
 * @returns {Object} Tokens with expiry
 */
const generateToken = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.accessExpiration }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    jwtConfig.secret,
    { expiresIn: jwtConfig.refreshExpiration }
  );

  return {
    access: {
      token: accessToken,
      expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    },
    refresh: {
      token: refreshToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  };
};

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Promise<Object>} Decoded token payload
 */
const verifyToken = async (token) => {
  try {
    return await jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {string} Token
 */
const generateResetPasswordToken = (email) => {
  return jwt.sign(
    { email },
    jwtConfig.secret,
    { expiresIn: jwtConfig.resetPasswordExpiration }
  );
};

/**
 * Authenticate user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const authenticate = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }

  if (!user.is_verified) {
    throw new ApiError(401, 'Please verify your email first');
  }

  return user;
};

/**
 * Check if user has required role
 * @param {string[]} requiredRoles
 * @param {string} userRole
 * @returns {boolean}
 */
const hasRole = (requiredRoles, userRole) => {
  return requiredRoles.includes(userRole);
};

module.exports = {
  generateToken,
  verifyToken,
  generateResetPasswordToken,
  authenticate,
  hasRole
};