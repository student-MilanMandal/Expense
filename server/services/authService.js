import fs from 'fs';
import path from 'path';

import User from '../models/User.js';
import OTP from '../models/OTP.js';

import generateToken from '../utils/generateToken.js';
import mailSender from '../utils/mailSender.js';

import { uploadImageToCloudinary } from '../config/cloudinary.js';
import emailTemplate from '../mail/templates/emailVerificationTemplate.js';

// OTP validity duration
const OTP_EXPIRY_MINUTES = 5;

// OTP resend cooldown
const OTP_RESEND_COOLDOWN_SECONDS = 60;

// Generate a secure 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Normalize email consistently
const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Valid email address is required');
  }

  return email.trim().toLowerCase();
};

// Check whether OTP is expired
const isOTPExpired = (createdAt) => {
  const expiryTime =
    new Date(createdAt).getTime() + OTP_EXPIRY_MINUTES * 60 * 1000;

  return Date.now() > expiryTime;
};

// Get latest OTP for an email
const getLatestOTP = async (email) => {
  return OTP.findOne({ email }).sort({ createdAt: -1 });
};

export const authService = {
  /**
   * Send OTP for email verification
   */
  sendOTP: async (email) => {
    const cleanEmail = normalizeEmail(email);

    // Check previous OTP for resend cooldown
    const latestOTP = await getLatestOTP(cleanEmail);

    if (latestOTP) {
      const secondsSinceLastOTP =
        (Date.now() - new Date(latestOTP.createdAt).getTime()) / 1000;

      if (secondsSinceLastOTP < OTP_RESEND_COOLDOWN_SECONDS) {
        const remainingSeconds = Math.ceil(
          OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastOTP
        );

        throw new Error(
          `Please wait ${remainingSeconds} seconds before requesting a new OTP`
        );
      }
    }

    // Generate new OTP
    const generatedOtp = generateOTP();

    // IMPORTANT:
    // First send email.
    // Only save OTP if email sending succeeds.
    await mailSender(
      cleanEmail,
      'Verification OTP - ExpensePilot',
      emailTemplate(generatedOtp)
    );

    // Email successfully sent → save OTP
    await OTP.create({
      email: cleanEmail,
      otp: generatedOtp,
    });

    // Delete previous OTPs
    await OTP.deleteMany({
      email: cleanEmail,
      otp: { $ne: generatedOtp },
    });

    console.log('✅ Verification OTP email sent successfully');

    return {
      email: cleanEmail,
    };
  },

  /**
   * Verify email OTP
   */
  verifyOTP: async (email, otp) => {
    const cleanEmail = normalizeEmail(email);
    const cleanOTP = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOTP)) {
      throw new Error('OTP must be a valid 6-digit code');
    }

    const recentOtp = await getLatestOTP(cleanEmail);

    if (!recentOtp) {
      throw new Error('OTP not found. Please request a new OTP');
    }

    // Check expiry
    if (isOTPExpired(recentOtp.createdAt)) {
      await OTP.deleteMany({ email: cleanEmail });

      throw new Error('OTP has expired. Please request a new OTP');
    }

    // Check OTP
    if (recentOtp.otp !== cleanOTP) {
      throw new Error('Invalid OTP code');
    }

    return true;
  },

  /**
   * Register new user
   */
  registerUser: async (payload) => {
    const {
      name,
      email,
      password,
      currency,
      themePreference,
      otp,
    } = payload;

    if (!name || !email || !password || !otp) {
      throw new Error(
        'Name, email, password, and OTP are required'
      );
    }

    const cleanEmail = normalizeEmail(email);

    // Check existing user
    const userExists = await User.findOne({
      email: cleanEmail,
    });

    if (userExists) {
      throw new Error(
        'User already registered with this email'
      );
    }

    /*
     * OTP verification is mandatory for registration.
     */
    await authService.verifyOTP(cleanEmail, otp);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      currency: currency || 'INR',
      themePreference: themePreference || 'dark',
    });

    // OTP no longer needed
    await OTP.deleteMany({
      email: cleanEmail,
    });

    const token = generateToken(user._id);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      currency: user.currency,
      timezone: user.timezone,
      language: user.language,
      themePreference: user.themePreference,
      token,
    };
  },

  /**
   * Login user
   */
  loginUser: async (email, password) => {
    const cleanEmail = normalizeEmail(email);

    if (!password) {
      throw new Error('Password is required');
    }

    const user = await User.findOne({
      email: cleanEmail,
    }).select('+password');

    if (!user) {
      throw new Error(
        'User is not registered. Please sign up first'
      );
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      throw new Error('Incorrect password');
    }

    const token = generateToken(user._id);

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || '',
      currency: user.currency,
      timezone: user.timezone,
      language: user.language,
      themePreference: user.themePreference,
      token,
    };
  },

  /**
   * Send password reset OTP
   */
  forgotPassword: async (email) => {
    const cleanEmail = normalizeEmail(email);

    // Check user
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      throw new Error(
        'No account registered with this email address'
      );
    }

    // Check resend cooldown
    const latestOTP = await getLatestOTP(cleanEmail);

    if (latestOTP) {
      const secondsSinceLastOTP =
        (Date.now() - new Date(latestOTP.createdAt).getTime()) / 1000;

      if (secondsSinceLastOTP < OTP_RESEND_COOLDOWN_SECONDS) {
        const remainingSeconds = Math.ceil(
          OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastOTP
        );

        throw new Error(
          `Please wait ${remainingSeconds} seconds before requesting a new OTP`
        );
      }
    }

    const generatedOtp = generateOTP();

    // Send email first
    await mailSender(
      cleanEmail,
      'Password Reset OTP - ExpensePilot',
      emailTemplate(generatedOtp)
    );

    // Save only after successful email request
    await OTP.create({
      email: cleanEmail,
      otp: generatedOtp,
    });

    // Delete older OTPs
    await OTP.deleteMany({
      email: cleanEmail,
      otp: { $ne: generatedOtp },
    });

    console.log(`✅ Password reset OTP sent to ${cleanEmail}`);

    return {
      email: cleanEmail,
    };
  },

  /**
   * Verify reset OTP and update password
   */
  resetPassword: async (email, otp, newPassword) => {
    const cleanEmail = normalizeEmail(email);

    if (!otp || !newPassword) {
      throw new Error(
        'OTP and new password are required'
      );
    }

    if (newPassword.length < 6) {
      throw new Error(
        'Password must be at least 6 characters long'
      );
    }

    // Verify OTP
    await authService.verifyOTP(cleanEmail, otp);

    // Find user
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      throw new Error('User account not found');
    }

    // Update password
    user.password = newPassword;

    await user.save();

    // OTP can no longer be reused
    await OTP.deleteMany({
      email: cleanEmail,
    });

    return true;
  },

  /**
   * Get authenticated user profile
   */
  getUserProfile: async (userId) => {
    return User.findById(userId);
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (userId, payload, file) => {
    const user = await User.findById(userId);

    if (!user) {
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return null;
    }

    // Update name
    if (payload.name) {
      user.name = payload.name.trim();
    }

    // Update email
    if (payload.email) {
      user.email = normalizeEmail(payload.email);
    }

    // Update preferences
    if (payload.currency) {
      user.currency = payload.currency;
    }

    if (payload.timezone) {
      user.timezone = payload.timezone;
    }

    if (payload.language) {
      user.language = payload.language;
    }

    if (payload.themePreference) {
      user.themePreference = payload.themePreference;
    }

    // Handle avatar
    if (file) {
      if (
        process.env.CLOUD_NAME &&
        process.env.API_KEY &&
        process.env.API_SECRET
      ) {
        try {
          user.avatar = await uploadImageToCloudinary(
            file,
            'Expense tracker'
          );

          if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (cloudErr) {
          console.warn(
            'Cloudinary upload failed:',
            cloudErr.message
          );

          user.avatar = `/uploads/${path.basename(
            file.path
          )}`;
        }
      } else {
        user.avatar = `/uploads/${path.basename(
          file.path
        )}`;
      }
    } else if (payload.avatar) {
      user.avatar = payload.avatar;
    }

    // Update password
    if (payload.password) {
      if (payload.password.length < 6) {
        throw new Error(
          'Password must be at least 6 characters long'
        );
      }

      user.password = payload.password;
    }

    const updatedUser = await user.save();

    const token = generateToken(updatedUser._id);

    return {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar || '',
      currency: updatedUser.currency,
      timezone: updatedUser.timezone,
      language: updatedUser.language,
      themePreference: updatedUser.themePreference,
      token,
    };
  },
};