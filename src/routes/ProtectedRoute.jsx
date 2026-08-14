import React, { useState, useCallback } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import { RoundedPageLoader } from '../components/common/LoadingSkeleton';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <RoundedPageLoader text="Synchronizing Smart Expense Tracker..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Main Layout Area - Guaranteed no horizontal overflow on mobile */}
      <div className="lg:pl-64 flex flex-col min-h-screen w-full min-w-0 max-w-full overflow-x-hidden">
        <Navbar onOpenSidebar={handleOpenSidebar} />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full min-w-0 mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default React.memo(ProtectedRoute);
