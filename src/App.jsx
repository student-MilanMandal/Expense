import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './routes/ProtectedRoute';
import { RoundedPageLoader } from './components/common/LoadingSkeleton';

// Route-based Code Splitting using React.lazy()
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Incomes = lazy(() => import('./pages/Incomes'));
const Expenses = lazy(() => import('./pages/Expenses'));
const KhataBook = lazy(() => import('./pages/KhataBook'));
const CashBook = lazy(() => import('./pages/CashBook'));
const Budgets = lazy(() => import('./pages/Budgets'));
const SavingsGoals = lazy(() => import('./pages/SavingsGoals'));
const Loans = lazy(() => import('./pages/Loans'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const Reports = lazy(() => import('./pages/Reports'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));

const PageFallback = () => (
  <div className="py-12 max-w-7xl mx-auto space-y-6">
    <RoundedPageLoader text="Loading page content..." />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/khata" element={<KhataBook />} />
            <Route path="/cashbook" element={<CashBook />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/savings" element={<SavingsGoals />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/history" element={<TransactionHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<ProfileSettings />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;