import express from 'express';
const router = express.Router();

import {
  addCashEntry,
  getDailySummary,
  getCashBookHistory,
  updateOpeningBalance,
} from '../controllers/cashbookController.js';

import { protect } from '../middleware/authMiddleware.js';

// ********************************************************************************************************
//                                      Cash Book Routes
// ********************************************************************************************************

// Add Cash Entry (Cash In / Cash Out)
router.post('/addCashEntry', protect, addCashEntry);
router.post('/entry', protect, addCashEntry);
router.post('/', protect, addCashEntry);

// Update / Set Opening Balance
router.put('/updateOpeningBalance', protect, updateOpeningBalance);
router.post('/updateOpeningBalance', protect, updateOpeningBalance);

// Get Daily Summary (Opening Balance, Cash In, Cash Out, Closing Balance)
router.get('/getDailySummary', protect, getDailySummary);
router.get('/daily-summary', protect, getDailySummary);
router.get('/', protect, getDailySummary);

// Get CashBook History
router.get('/getCashBookHistory', protect, getCashBookHistory);
router.get('/history', protect, getCashBookHistory);

export default router;
