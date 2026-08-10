import express from 'express';
const router = express.Router();

import {
  createSavingsGoal,
  getSavingsGoals,
  addFunds,
  updateSavingsGoal,
  deleteSavingsGoal,
} from '../controllers/savingsController.js';

import { protect } from '../middleware/authMiddleware.js';

// ********************************************************************************************************
//                                      Savings Goals Routes
// ********************************************************************************************************

// Create Savings Goal
router.post('/createGoal', protect, createSavingsGoal);
router.post('/createSavingsGoal', protect, createSavingsGoal);
router.post('/', protect, createSavingsGoal);

// Read All Goals with Progress Percentage
router.get('/getAllGoals', protect, getSavingsGoals);
router.get('/getSavingsGoals', protect, getSavingsGoals);
router.get('/', protect, getSavingsGoals);

// Deposit / Add Funds to Goal
router.put('/addFunds/:id', protect, addFunds);
router.put('/:id/add-funds', protect, addFunds);
router.put('/:id/contribute', protect, addFunds);

// Update Goal
router.put('/updateGoal/:id', protect, updateSavingsGoal);
router.put('/:id', protect, updateSavingsGoal);

// Delete Goal
router.delete('/deleteGoal/:id', protect, deleteSavingsGoal);
router.delete('/:id', protect, deleteSavingsGoal);

export default router;
