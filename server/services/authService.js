import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import generateToken from '../utils/generateToken.js';
import { uploadImageToCloudinary } from '../config/cloudinary.js';

export const authService = {
  /**
   * Generate and store OTP code for user email verification
   */
  sendOTP: async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      await OTP.create({
        email: cleanEmail,
        otp: generatedOtp,
      });
    } catch (err) {
      console.warn('OTP creation note:', err.message);
    }

    return { email: cleanEmail };
  },

  /**
   * Verify OTP code against latest database entry
   */
  verifyOTP: async (email, otp) => {
    const cleanEmail = email.trim().toLowerCase();
    const recentOtp = await OTP.find({ email: cleanEmail })
      .sort({ createdAt: -1 })
      .limit(1);

    if (recentOtp.length === 0 || recentOtp[0].otp !== otp) {
      throw new Error('Invalid or expired OTP code');
    }

    return true;
  },

  /**
   * Register new user account with password hashing & token generation
   */
  registerUser: async (payload) => {
    const { name, email, password, currency, themePreference, otp } = payload;
    const cleanEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      throw new Error('User already registered with this email');
    }

    if (otp) {
      const recentOtp = await OTP.find({ email: cleanEmail })
        .sort({ createdAt: -1 })
        .limit(1);

      if (recentOtp.length === 0 || recentOtp[0].otp !== otp) {
        throw new Error('Invalid or expired OTP. Please request a new OTP');
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      currency: currency || 'INR',
      themePreference: themePreference || 'dark',
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
   * Authenticate user credentials and return bearer JWT token
   */
  loginUser: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      throw new Error('User is not registered. Please sign up first');
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
   * Initiate password reset by generating an OTP
   */
  forgotPassword: async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      throw new Error('No account registered with this email address');
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      await OTP.create({ email: cleanEmail, otp: generatedOtp });
    } catch (otpErr) {
      console.warn('OTP creation note:', otpErr.message);
    }

    return { email: cleanEmail };
  },

  /**
   * Verify OTP and update user password
   */
  resetPassword: async (email, otp, newPassword) => {
    const cleanEmail = email.trim().toLowerCase();

    const recentOtp = await OTP.find({ email: cleanEmail })
      .sort({ createdAt: -1 })
      .limit(1);

    if (recentOtp.length === 0 || recentOtp[0].otp !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      throw new Error('User account not found');
    }

    user.password = newPassword;
    await user.save();

    return true;
  },

  /**
   * Get user profile details
   */
  getUserProfile: async (userId) => {
    return await User.findById(userId);
  },

  /**
   * Update user profile settings & optional avatar upload
   */
  updateUserProfile: async (userId, payload, file) => {
    const user = await User.findById(userId);
    if (!user) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return null;
    }

    if (payload.name) user.name = payload.name;
    if (payload.email) user.email = payload.email.toLowerCase();
    if (payload.currency) user.currency = payload.currency;
    if (payload.timezone) user.timezone = payload.timezone;
    if (payload.language) user.language = payload.language;
    if (payload.themePreference) user.themePreference = payload.themePreference;

    if (file) {
      if (process.env.CLOUD_NAME && process.env.API_KEY && process.env.API_SECRET) {
        try {
          user.avatar = await uploadImageToCloudinary(file, 'Expense tracker');
          if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        } catch (cloudErr) {
          console.warn('Cloudinary upload failed, falling back to local static URL:', cloudErr.message);
          user.avatar = `/uploads/${path.basename(file.path)}`;
        }
      } else {
        user.avatar = `/uploads/${path.basename(file.path)}`;
      }
    } else if (payload.avatar) {
      user.avatar = payload.avatar;
    }

    if (payload.password) {
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
