// Import Express Router
import express from 'express';
const router = express.Router();

// Import Budget Controllers
import {
  createBudget,
  getBudgets,
  getBudgetStatus,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';

// Import Auth Middleware
import { protect } from '../middleware/authMiddleware.js';

// ********************************************************************************************************
//                                      Budget Management Routes
// ********************************************************************************************************

// Create or Update Budget Limit
router.post('/createBudget', protect, createBudget);
router.post('/setBudget', protect, createBudget);
router.post('/', protect, createBudget);

// Read All Budgets
router.get('/getAllBudgets', protect, getBudgets);
router.get('/', protect, getBudgets);

// Get Budget Status (Calculates Spent, Remaining, Overspent Flag via Aggregation)
router.get('/getBudgetStatus', protect, getBudgetStatus);
router.get('/status', protect, getBudgetStatus);

// Update & Delete Budget
router.put('/updateBudget/:id', protect, updateBudget);
router.put('/:id', protect, updateBudget);

router.delete('/deleteBudget/:id', protect, deleteBudget);
router.delete('/:id', protect, deleteBudget);

export default router;
