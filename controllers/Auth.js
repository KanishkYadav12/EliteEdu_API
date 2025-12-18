// controllers/authController.js
const authService = require("../services/authService");
const { AppError } = require("../utils/errors");
const {
  validateSignup,
  validateLogin,
  validateOTP,
  validatePasswordChange,
} = require("../validators/authValidator");
const logger = require("../utils/logger");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
exports.signup = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validateSignup(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const result = await authService.registerUser(value);

    logger.info(`User registered successfully: ${value.email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validateLogin(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const result = await authService.loginUser(value);

    // Set secure HTTP-only cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("token", result.token, cookieOptions);

    logger.info(`User logged in: ${value.email}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send OTP for email verification
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
exports.sendOTP = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validateOTP(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    await authService.sendOTP(value.email);

    logger.info(`OTP sent to: ${value.email}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validatePasswordChange(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    await authService.changePassword(req.user.id, value);

    logger.info(`Password changed for user: ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    logger.info(`User logged out: ${req.user.id}`);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
