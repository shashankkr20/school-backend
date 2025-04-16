const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validation.middleware');
const {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail
} = require('../controllers/auth.controller');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  emailVerificationSchema
} = require('../validations/auth.validation');

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-tokens', validate(refreshTokenSchema), refreshTokens);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/send-verification-email', validate(emailVerificationSchema), sendVerificationEmail);
router.post('/verify-email', validate(emailVerificationSchema), verifyEmail);

// Protected routes
router.post('/logout', logout);

module.exports = router;