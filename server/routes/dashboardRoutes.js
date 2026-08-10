// Import Express Router
import express from 'express';
const router = express.Router();

// Import Dashboard Controller
import { getDashboardSummary } from '../controllers/dashboardController.js';

// Import Auth Middleware
import { protect } from '../middleware/authMiddleware.js';

// ********************************************************************************************************
//                                      Dashboard Analytics Routes
// ********************************************************************************************************

// Get Complete Dashboard Cards & Charts Data
router.get('/getSummary', protect, getDashboardSummary);
router.get('/summary', protect, getDashboardSummary);

export default router;
