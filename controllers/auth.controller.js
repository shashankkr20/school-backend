const httpStatus = require('http-status');
const { ApiError } = require('../utils/apiError');
const { User } = require('../models');
const { 
  generateToken, 
  generateResetPasswordToken,
  authenticate 
} = require('../config/auth');
const { sendEmail } = require('../services/email.service');

const register = async (req, res, next) => {
  try {
    const { email, password, role, ...profileData } = req.body;
    
    if (await User.isEmailTaken(email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }

    const user = await User.create({ email, password, role });
    await user.createProfile(profileData);

    // Generate verification token and send email
    const verifyToken = generateResetPasswordToken(email);
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email</p>`
    });

    res.status(httpStatus.CREATED).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authenticate(email, password);
    const tokens = generateToken(user);

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        tokens
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshTokens = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = await verifyToken(refreshToken);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const tokens = generateToken(user);
    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No account found with this email');
    }

    const resetToken = generateResetPasswordToken(email);
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password</p>`
    });

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = await verifyToken(token);
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    const decoded = await verifyToken(token);
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    user.is_verified = true;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail
};