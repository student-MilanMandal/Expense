// Import Express Router
import express from 'express';
const router = express.Router();

// Import Analytics Controllers
import {
  getIncomeVsExpense,
  getCategorySpending,
  getSavingsTrend,
} from '../controllers/analyticsController.js';

// Import Auth Middleware
import { protect } from '../middleware/authMiddleware.js';

// ********************************************************************************************************
//                                      Analytics Aggregation Routes
// ********************************************************************************************************

// Income vs Expense Aggregation for Current Month
router.get('/getIncomeVsExpense', protect, getIncomeVsExpense);
router.get('/income-vs-expense', protect, getIncomeVsExpense);

// Category Spending Breakdown Aggregation for Doughnut Charts
router.get('/getCategorySpending', protect, getCategorySpending);
router.get('/category-spending', protect, getCategorySpending);

// Savings Trend Aggregation
router.get('/getSavingsTrend', protect, getSavingsTrend);
router.get('/savings-trend', protect, getSavingsTrend);

export default router;
