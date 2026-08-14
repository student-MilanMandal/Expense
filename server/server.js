import 'dotenv/config';

import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import mailSender from './utils/mailSender.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import khataRoutes from './routes/khataRoutes.js';
import cashbookRoutes from './routes/cashbookRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import savingsRoutes from './routes/savingsRoutes.js';
import loanRoutes from './routes/loanRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';

const app = express();

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static files (uploads only)
app.use('/uploads', express.static(path.join(ROOT, 'uploads')));

// Root info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ExpensePilot API Server is Running 🚀',
    health: '/api/health',
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ExpensePilot API Gateway is Active & Online 🚀',
    health: '/api/health',
    version: '1.0.0',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    dbState: mongoose.connection.readyState === 1
      ? 'Connected'
      : 'Offline',
  });
});

// Live Email Diagnostic Test Endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const recipient = req.query.to?.trim() || process.env.MAIL_USER?.trim() || 'delivered@resend.dev';

    const testResult = await mailSender(
      recipient,
      'ExpensePilot Live Diagnostic Test Email',
      '<h2>ExpensePilot Email Diagnostic Test Success! 🎉</h2><p>Resend / Email integration is functioning properly.</p>'
    );

    return res.json({
      success: true,
      message: `Test email successfully dispatched to ${recipient}`,
      result: testResult,
    });
  } catch (err) {
    console.error('Diagnostic email error:', err);
    return res.status(500).json({
      success: false,
      errorName: err.name,
      errorMessage: err.message,
    });
  }
});

// Database check
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable',
    });
  }

  next();
});

// API Routes
app.use('/api/auth', authRoutes);

app.use('/api/income', incomeRoutes);
app.use('/api/incomes', incomeRoutes);

app.use('/api/expenses', expenseRoutes);
app.use('/api/expense', expenseRoutes);

app.use('/api/khata', khataRoutes);
app.use('/api/cashbook', cashbookRoutes);

app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/loans', loanRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`
      );
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();