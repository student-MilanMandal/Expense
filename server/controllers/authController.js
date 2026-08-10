import fs from 'fs';
import { authService } from '../services/authService.js';

/**
 * Controller for Sending Email OTP
 * POST /api/auth/sendOTP
 */
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    await authService.sendOTP(email);
    return res.status(200).json({
      success: true,
      message: 'Verification OTP sent to your email successfully',
    });
  } catch (error) {
    console.error('Error in sendOTP controller:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to send OTP code via email. Please check server SMTP configuration.',
    });
  }
};

/**
 * Controller for Standalone OTP Verification
 * POST /api/auth/verifyOTP
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required',
      });
    }

    await authService.verifyOTP(email, otp);
    return res.status(200).json({
      success: true,
      message: 'Email Verification Successful',
    });
  } catch (error) {
    console.error('Error in verifyOTP controller:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to verify OTP',
    });
  }
};

/**
 * Controller for User Registration
 * POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields',
      });
    }

    const userData = await authService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userData,
    });
  } catch (error) {
    console.error('Error in registerUser controller:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Registration failed. Please try again',
    });
  }
};

/**
 * Controller for User Login
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const userData = await authService.loginUser(email, password);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userData,
    });
  } catch (error) {
    console.error('Error in loginUser controller:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Login failure. Please try again',
    });
  }
};

/**
 * Controller for Initiating Password Reset via Email OTP
 * POST /api/auth/forgotPassword
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    await authService.forgotPassword(email);
    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email address',
    });
  } catch (error) {
    console.error('Error in forgotPassword controller:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to initiate password reset',
    });
  }
};

/**
 * Controller for Verifying OTP and Updating Password
 * POST /api/auth/resetPassword
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required fields',
      });
    }

    await authService.resetPassword(email, otp, newPassword);
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now login with your new password',
    });
  } catch (error) {
    console.error('Error in resetPassword controller:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to reset password',
    });
  }
};

/**
 * Controller for Fetching Authenticated User Profile
 * GET /api/auth/getProfile
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error in getUserProfile controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user profile',
    });
  }
};

/**
 * Controller for Updating User Profile Details and Avatar
 * PUT /api/auth/updateProfile
 */
export const updateUserProfile = async (req, res) => {
  try {
    const updatedUserData = await authService.updateUserProfile(req.user._id, req.body, req.file);
    if (!updatedUserData) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUserData,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Error in updateUserProfile controller:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user profile',
    });
  }
};
