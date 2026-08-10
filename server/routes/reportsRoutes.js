import express from 'express';
const router = express.Router();

import { generateReport } from '../controllers/reportsController.js';
import { protect } from '../middleware/authMiddleware.js';

// ********************************************************************************************************
//                                      Dynamic Reports Export Routes
// ********************************************************************************************************

// Generate Exportable Report Data (For CSV / PDF downloads)
router.post('/generateReport', protect, generateReport);
router.post('/generate', protect, generateReport);
router.get('/generateReport', protect, generateReport);
router.get('/generate', protect, generateReport);
router.get('/summary', protect, generateReport);
router.get('/export-csv', protect, generateReport);

export default router;
