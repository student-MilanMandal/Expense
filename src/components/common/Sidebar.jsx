import React, { useState, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchRoute } from '../../utils/prefetchHelpers';
import logoImg from '../../assets/ExpensePailot.jpg';
import Modal from './Modal';
import {
  HiSquares2X2,
  HiCurrencyRupee,
  HiReceiptPercent,
  HiBookOpen,
  HiBuildingLibrary,
  HiScale,
  HiSparkles,
  HiDocumentText,
  HiClock,
  HiChartBar,
  HiDocumentChartBar,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
  HiMagnifyingGlass,
  HiXMark,
  HiExclamationTriangle,
} from 'react-icons/hi2';

const menuGroups = [
  {
    groupTitle: 'MAIN MENU',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: HiSquares2X2 },
      { name: 'Incomes', path: '/incomes', icon: HiCurrencyRupee },
      { name: 'Expenses', path: '/expenses', icon: HiReceiptPercent },
      { name: 'Khata Book', path: '/khata', icon: HiBookOpen },
      { name: 'Cash Book', path: '/cashbook', icon: HiBuildingLibrary },
    ],
  },
  {
    groupTitle: 'FEATURES',
    items: [
      { name: 'Budgets', path: '/budgets', icon: HiScale },
      { name: 'Savings Goals', path: '/savings', icon: HiSparkles },
      { name: 'Loans & EMI', path: '/loans', icon: HiDocumentText },
      { name: 'History', path: '/history', icon: HiClock },
      { name: 'Analytics', path: '/analytics', icon: HiChartBar },
      { name: 'Reports', path: '/reports', icon: HiDocumentChartBar },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handlePrefetch = useCallback((path) => {
    prefetchRoute(queryClient, path);
  }, [queryClient]);

  const handleConfirmLogout = useCallback(() => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 transform bg-white dark:bg-[#070F1E] border-r border-slate-200/80 dark:border-[#1F4759]/50 transition-transform duration-250 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Top Header & Search Bar */}
          <div className="p-4 space-y-4 border-b border-slate-100 dark:border-[#1F4759]/40">
            {/* Logo */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-2.5">
                <img
                  src={logoImg}
                  alt="ExpensePilot Logo"
                  className="w-9 h-9 rounded-xl object-cover shadow-xs border border-slate-200 dark:border-[#1F4759]"
                />
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  Expense<span className="text-[#089790] dark:text-[#86E3CE]">Pilot</span>
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close Mobile Sidebar"
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0A1325] border border-transparent hover:border-slate-200 dark:hover:border-[#1F4759]/60 transition-all active:scale-95 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <HiXMark className="w-5.5 h-5.5 text-slate-500 dark:text-slate-300" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-12 py-2 bg-slate-100 dark:bg-[#0A1325] border border-transparent dark:border-[#1F4759]/40 rounded-2xl text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#089790] transition-all"
              />
              <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                ⌘ K
              </span>
            </div>
          </div>

          {/* Grouped Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            {menuGroups.map((group) => {
              const filteredItems = group.items.filter((item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (filteredItems.length === 0) return null;

              return (
                <div key={group.groupTitle} className="space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1.5">
                    {group.groupTitle}
                  </h4>

                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        onMouseEnter={() => handlePrefetch(item.path)}
                        onFocus={() => handlePrefetch(item.path)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-linear-to-r from-[#018ABE] to-[#089790] text-white shadow-md shadow-[#089790]/25'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0A1325] hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                          <span>{item.name}</span>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              );
            })}

            {/* GENERAL section with Settings and Log out */}
            <div className="space-y-1 pt-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1.5">
                GENERAL
              </h4>

              <NavLink
                to="/settings"
                onClick={() => onClose && onClose()}
                onMouseEnter={() => handlePrefetch('/settings')}
                onFocus={() => handlePrefetch('/settings')}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                  location.pathname === '/settings'
                    ? 'bg-linear-to-r from-[#018ABE] to-[#089790] text-white shadow-md shadow-[#089790]/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#0A1325] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HiCog6Tooth className={`w-4.5 h-4.5 ${location.pathname === '/settings' ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>Settings</span>
              </NavLink>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl font-semibold text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-left cursor-pointer"
              >
                <HiArrowRightOnRectangle className="w-4.5 h-4.5" />
                <span>Log out</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Sign Out"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <HiExclamationTriangle className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              Are you sure you want to log out?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You will need to enter your email and password to log back into ExpensePilot.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default React.memo(Sidebar);
