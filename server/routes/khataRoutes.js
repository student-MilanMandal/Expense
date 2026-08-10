// Import Express Router
import express from 'express';
const router = express.Router();

// Import Khata Controllers
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  addTransaction,
  getCustomerTransactions,
  deleteCustomer,
} from '../controllers/khataController.js';

// Import Auth & Upload Middlewares
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

// ********************************************************************************************************
//                                      Khata Book (Customer Ledger) Routes
// ********************************************************************************************************

// Customer Endpoints
router.post('/addCustomer', protect, createCustomer);
router.post('/createCustomer', protect, createCustomer);
router.get('/getAllCustomers', protect, getCustomers);
router.get('/customers', protect, getCustomers);
router.post('/customers', protect, createCustomer);
router.put('/updateCustomer/:customerId', protect, updateCustomer);
router.put('/customers/:customerId', protect, updateCustomer);
router.delete('/deleteCustomer/:customerId', protect, deleteCustomer);
router.delete('/customers/:customerId', protect, deleteCustomer);

// Transaction Endpoints
router.post('/addTransaction', protect, upload.single('receipt'), addTransaction);
router.post('/transactions', protect, upload.single('receipt'), addTransaction);
router.get('/getCustomerTransactions/:customerId', protect, getCustomerTransactions);
router.get('/customers/:customerId/transactions', protect, getCustomerTransactions);

export default router;
