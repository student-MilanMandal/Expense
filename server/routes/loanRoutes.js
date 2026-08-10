import express from 'express';
const router = express.Router();

import {
  createLoan,
  getLoans,
  payEMI,
  updateLoan,
  deleteLoan,
} from '../controllers/loanController.js';

import { protect } from '../middleware/authMiddleware.js';

// ********************************************************************************************************
//                                      Loan Management Routes
// ********************************************************************************************************

// Create Loan (LENT / BORROWED)
router.post('/createLoan', protect, createLoan);
router.post('/addLoan', protect, createLoan);
router.post('/', protect, createLoan);

// Read All Loans (With Overdue Check)
router.get('/getAllLoans', protect, getLoans);
router.get('/getLoans', protect, getLoans);
router.get('/', protect, getLoans);

// Record EMI Payment / Repayment
router.post('/payEMI/:id', protect, payEMI);
router.post('/:id/pay-emi', protect, payEMI);
router.post('/:id/payment', protect, payEMI);
router.post('/:id/pay', protect, payEMI);

// Update Loan
router.put('/updateLoan/:id', protect, updateLoan);
router.put('/:id', protect, updateLoan);

// Delete Loan
router.delete('/deleteLoan/:id', protect, deleteLoan);
router.delete('/:id', protect, deleteLoan);

export default router;
