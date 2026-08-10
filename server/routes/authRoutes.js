import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public Explicit Action Routes
router.post('/sendOTP', sendOTP);
router.post('/verifyOTP', verifyOTP);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);

// Protected Profile Action Routes
router.get('/getProfile', protect, getUserProfile);
router.put('/updateProfile', protect, upload.single('avatar'), updateUserProfile);

export default router;
