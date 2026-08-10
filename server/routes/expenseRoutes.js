// Import Express Router
import express from 'express';
const router = express.Router();

// Import Expense Controllers
import {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';

// Import Auth & Upload Middlewares
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

// ********************************************************************************************************
//                                      Expense Management Routes
// ********************************************************************************************************

// Create Expense (With Receipt Upload)
router.post('/addExpense', protect, upload.single('receipt'), addExpense);
router.post('/', protect, upload.single('receipt'), addExpense); // Alias

// Read Expenses (Search, Filter, Pagination)
router.get('/getAllExpenses', protect, getExpenses);
router.get('/', protect, getExpenses); // Alias

// Read Single Expense by ID
router.get('/getExpenseById/:id', protect, getExpenseById);
router.get('/:id', protect, getExpenseById);

// Update Expense
router.put('/updateExpense/:id', protect, upload.single('receipt'), updateExpense);
router.put('/:id', protect, upload.single('receipt'), updateExpense);

// Delete Expense
router.delete('/deleteExpense/:id', protect, deleteExpense);
router.delete('/:id', protect, deleteExpense);

export default router;
