const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");
const { AppError } = require("../utils/errors");
const mailSender = require("../utils/mailSender");
const { passwordUpdatedTemplate } = require("../mail/templates/passwordUpdate");
const config = require("../config/config");

class AuthService {
  /**
   * Register a new user
   */
  async registerUser(userData) {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = userData;

    // Check password match
    if (password !== confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User already exists with this email", 409);
    }

    // Verify OTP
    await this.verifyOTP(email, otp);

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      config.bcrypt.saltRounds
    );

    // Create profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber || null,
    });

    // Determine approval status
    const approved = accountType !== "Instructor";

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}%20${lastName}`,
    });

    // Generate token
    const token = this.generateToken(user);

    // Remove password from response
    user.password = undefined;

    return { user, token };
  }

  /**
   * Login user
   */
  async loginUser({ email, password }) {
    // Find user
    const user = await User.findOne({ email })
      .select("+password")
      .populate("additionalDetails");

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if account is approved
    if (!user.approved) {
      throw new AppError("Your account is pending approval", 403);
    }

    // Generate token
    const token = this.generateToken(user);

    // Remove password from response
    user.password = undefined;

    return { user, token };
  }

  /**
   * Send OTP to email
   */
  async sendOTP(email) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User already registered with this email", 409);
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Generate secure OTP
    const otp = this.generateSecureOTP();

    // Save OTP to database
    await OTP.create({ email, otp });

    // Send OTP via email
    await mailSender(
      email,
      "Email Verification - OTP",
      `Your OTP for email verification is: ${otp}. Valid for ${config.otp.expiryMinutes} minutes.`
    );
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email, otp) {
    // Find most recent OTP
    const otpRecord = await OTP.findOne({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (!otpRecord) {
      throw new AppError("OTP not found or expired", 400);
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      throw new AppError("Invalid OTP", 400);
    }

    // Check if OTP is expired
    const otpAge = Date.now() - otpRecord.createdAt.getTime();
    if (otpAge > config.otp.expiryMinutes * 60 * 1000) {
      throw new AppError("OTP has expired", 400);
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });
  }

  /**
   * Change user password
   */
  async changePassword(userId, { oldPassword, newPassword, confirmPassword }) {
    // Check if passwords match
    if (newPassword !== confirmPassword) {
      throw new AppError("New passwords do not match", 400);
    }

    // Check if new password is same as old
    if (oldPassword === newPassword) {
      throw new AppError(
        "New password must be different from old password",
        400
      );
    }

    // Find user
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      config.bcrypt.saltRounds
    );

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Send notification email
    try {
      await mailSender(
        user.email,
        "Password Updated Successfully",
        passwordUpdatedTemplate(
          user.email,
          `${user.firstName} ${user.lastName}`
        )
      );
    } catch (error) {
      // Log error but don't fail the request
      console.error("Failed to send password update email:", error);
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );
  }

  /**
   * Generate secure OTP
   */
  generateSecureOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }
}

module.exports = new AuthService();
