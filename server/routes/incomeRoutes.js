// Import Express Router
import express from 'express';
const router = express.Router();

// Import Income Controllers
import {
  addIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
} from '../controllers/incomeController.js';

// Import Auth & Upload Middlewares
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

// ********************************************************************************************************
//                                      Income Management Routes
// ********************************************************************************************************

// Create Income (With optional Receipt/Attachment Upload)
router.post('/addIncome', protect, upload.single('attachment'), addIncome);
router.post('/', protect, upload.single('attachment'), addIncome); // Alias for REST

// Read Incomes (Search, Filter, Pagination)
router.get('/getAllIncomes', protect, getIncomes);
router.get('/', protect, getIncomes); // Alias for REST

// Read Single Income by ID
router.get('/getIncomeById/:id', protect, getIncomeById);
router.get('/:id', protect, getIncomeById);

// Update Income
router.put('/updateIncome/:id', protect, upload.single('attachment'), updateIncome);
router.put('/:id', protect, upload.single('attachment'), updateIncome);

// Delete Income
router.delete('/deleteIncome/:id', protect, deleteIncome);
router.delete('/:id', protect, deleteIncome);

export default router;
