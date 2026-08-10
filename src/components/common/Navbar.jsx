import React, { useState, useEffect, useRef } from 'react';
import { formatDateDisplay } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { NavLink, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import Modal from './Modal';
import {
  HiBars3,
  HiSun,
  HiMoon,
  HiArrowRightOnRectangle,
  HiUser,
  HiBell,
  HiExclamationTriangle,
  HiSparkles,
  HiLightBulb,
  HiCurrencyRupee,
  HiReceiptPercent,
  HiBookOpen,
  HiBuildingLibrary,
  HiBanknotes,
  HiMagnifyingGlass,
} from 'react-icons/hi2';

// Production-grade Notification Configuration Map (O(1) Constant Time Lookup)
const NOTIFICATION_CONFIG = {
  INCOME: {
    icon: HiCurrencyRupee,
    iconColor: 'text-emerald-500',
    route: '/incomes',
  },
  EXPENSE: {
    icon: HiReceiptPercent,
    iconColor: 'text-rose-500',
    route: '/expenses',
  },
  KHATA: {
    icon: HiBookOpen,
    iconColor: 'text-amber-500',
    route: '/khata',
  },
  CASH: {
    icon: HiBuildingLibrary,
    iconColor: 'text-cyan-500',
    route: '/cashbook',
  },
  BUDGET: {
    icon: HiExclamationTriangle,
    iconColor: 'text-rose-500',
    route: '/budgets',
  },
  SAVINGS: {
    icon: HiSparkles,
    iconColor: 'text-purple-500',
    route: '/savings',
  },
  LOAN: {
    icon: HiBanknotes,
    iconColor: 'text-blue-500',
    route: '/loans',
  },
  SYSTEM: {
    icon: HiLightBulb,
    iconColor: 'text-indigo-500',
    route: '/settings',
  },
};

const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'Recently';
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getNotificationIcon = (type) => {
  const config = NOTIFICATION_CONFIG[type] || NOTIFICATION_CONFIG.SYSTEM;
  const IconComponent = config.icon;
  return <IconComponent className={`w-4 h-4 ${config.iconColor}`} />;
};

const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearAllNotifications,
  } = useNotifications();

  const navigate = useNavigate();

  // Refs for click outside handling
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Today', 'This Week'
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Click outside & Escape key handler to close drawers automatically
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [user?.avatar]);

  useEffect(() => {
    let isMounted = true;

    const checkSystemAlerts = async () => {
      try {
        const [budgetRes, loanRes] = await Promise.all([
          axiosClient.get('/budgets/getBudgetStatus'),
          axiosClient.get('/loans/getAllLoans'),
        ]);

        if (!isMounted) return;

        if (budgetRes.data?.success && Array.isArray(budgetRes.data.data)) {
          budgetRes.data.data.forEach((b) => {
            const spent = b.spent || 0;
            const limit = b.amount || 1;
            const percent = Math.round((spent / limit) * 100);
            if (percent >= 80) {
              const exists = notifications.some((n) => n.title?.includes(b.category) && n.message?.includes(`${percent}%`));
              if (!exists) {
                addNotification({
                  title: percent >= 100 ? `Budget Exceeded: ${b.category}` : `High Spending Alert: ${b.category}`,
                  message: `You have spent ₹${spent.toLocaleString('en-IN')} (${percent}% of ₹${limit.toLocaleString('en-IN')} limit).`,
                  type: 'BUDGET',
                });
              }
            }
          });
        }

        if (loanRes.data?.success && Array.isArray(loanRes.data.data)) {
          loanRes.data.data.forEach((l) => {
            if (l.status !== 'PAID' && l.dueDate) {
              const exists = notifications.some((n) => n.title?.includes(l.personName));
              if (!exists) {
                addNotification({
                  title: `Upcoming Loan / EMI Due: ${l.personName}`,
                  message: `Amount: ₹${l.amount.toLocaleString('en-IN')}. Due date: ${formatDateDisplay(l.dueDate)}`,
                  type: 'LOAN',
                });
              }
            }
          });
        }
      } catch (error) {
        // Silent error prevention for production stability
      }
    };

    if (user?._id) checkSystemAlerts();

    return () => {
      isMounted = false;
    };
  }, [user?._id]);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const handleNotificationItemClick = (n) => {
    markAsRead(n.id);
    setNotificationsOpen(false);

    const targetRoute = NOTIFICATION_CONFIG[n.type]?.route;
    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to count items per tab
  const getTabCount = (tabName) => {
    return notifications.filter((n) => {
      const past = new Date(n.timestamp || Date.now());
      const now = new Date();
      const diffHours = (now - past) / (1000 * 60 * 60);
      const diffDays = diffHours / 24;

      if (tabName === 'All') return true;
      if (tabName === 'Today') return diffHours < 24;
      if (tabName === 'This Week') return diffDays <= 7;
      return true;
    }).length;
  };

  // Filter notifications by Tab
  const filteredNotifications = notifications.filter((n) => {
    if (!n.timestamp) return true;
    const past = new Date(n.timestamp);
    const now = new Date();
    const diffHours = (now - past) / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (activeTab === 'Today') return diffHours < 24;
    if (activeTab === 'This Week') return diffDays <= 7;
    return true;
  });

  const rawFirstName = user?.name ? user.name.split(' ')[0] : 'User';
  const formattedFirstName = rawFirstName
    ? rawFirstName.charAt(0).toUpperCase() + rawFirstName.slice(1).toLowerCase()
    : 'User';

  return (
    <>
      <header className="sticky top-0 z-30 h-16 sm:h-20 bg-white/95 dark:bg-[#070F1E]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#1F4759]/40 px-3 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-200">
        {/* Left Greeting section */}
        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden min-w-0">
          <button
            onClick={onOpenSidebar}
            aria-label="Open Sidebar Menu"
            className="lg:hidden p-1.5 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0A1325] shrink-0"
          >
            <HiBars3 className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
          </button>

          <div className="overflow-hidden min-w-0">
            <h1 className="text-sm sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              <span className="hidden sm:inline">Welcome back, {user?.name || 'User'}</span>
              <span className="sm:hidden">Hi, {formattedFirstName}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-[#97CADB] font-medium mt-0.5 hidden sm:block truncate">
              It is the best time to track & control your daily expenses
            </p>
          </div>
        </div>

        {/* Right Controls section */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Search Circular Button */}
          <button
            onClick={() => navigate('/history')}
            aria-label="Search Transactions"
            className="w-9.5 h-9.5 sm:w-11 sm:h-11 rounded-full border border-slate-200/80 dark:border-[#1F4759]/60 bg-white dark:bg-[#0A1325] text-slate-600 dark:text-[#97CADB] hover:bg-slate-50 dark:hover:bg-[#1F4759]/40 flex items-center justify-center transition-all shadow-xs shrink-0 active:scale-95"
          >
            <HiMagnifyingGlass className="w-4 h-4 sm:w-5 sm:h-5 text-[#089790] dark:text-[#86E3CE]" />
          </button>

          {/* Theme Toggle Circular Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-9.5 h-9.5 sm:w-11 sm:h-11 rounded-full border border-slate-200/80 dark:border-[#1F4759]/60 bg-white dark:bg-[#0A1325] text-slate-600 dark:text-[#97CADB] hover:bg-slate-50 dark:hover:bg-[#1F4759]/40 flex items-center justify-center transition-all shadow-xs shrink-0 active:scale-95"
          >
            {theme === 'dark' ? (
              <HiSun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <HiMoon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            )}
          </button>

          {/* Notification Bell Container with Click Outside Ref */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setDropdownOpen(false);
              }}
              aria-label="View Notifications"
              className="w-9.5 h-9.5 sm:w-11 sm:h-11 rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0d121f] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-center transition-all shadow-xs relative shrink-0 active:scale-95"
            >
              <HiBell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-white font-black text-[9px] sm:text-[10px] flex items-center justify-center border-2 border-white dark:border-[#070a11] shadow-xs animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Modal */}
            {notificationsOpen && (
              <div className="fixed top-16 left-3 right-3 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 max-w-sm mx-auto bg-white dark:bg-[#070a11] rounded-3xl sm:rounded-4xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-3.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    Notification Center
                  </h4>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Segmented Control Tabs */}
                <div className="p-1 bg-slate-100 dark:bg-slate-800/70 rounded-2xl flex items-center justify-between text-xs font-medium mb-3.5 gap-1">
                  {['All', 'Today', 'This Week'].map((tab) => {
                    const count = getTabCount(tab);
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                            : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                      >
                        {tab} {count > 0 && <span className="opacity-75">({count})</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Notification Items */}
                <div className="space-y-3 max-h-[60vh] sm:max-h-80 overflow-y-auto pr-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications under "{activeTab}".
                    </div>
                  ) : (
                    filteredNotifications.map((n, idx) => (
                      <div
                        key={n.id || idx}
                        onClick={() => handleNotificationItemClick(n)}
                        className={`flex items-start space-x-3 p-2.5 rounded-2xl transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${idx !== filteredNotifications.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/60' : ''
                          } ${!n.read ? 'bg-indigo-500/5 dark:bg-indigo-950/20' : ''}`}
                      >
                        {/* Circular Icon Avatar */}
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-xs">
                          {getNotificationIcon(n.type)}
                        </div>

                        {/* Item Content */}
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-1.5 truncate pr-2">
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />}
                              <h5 className="font-bold text-slate-900 dark:text-white truncate">
                                {n.title}
                              </h5>
                            </div>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0 font-medium">
                              {getTimeAgo(n.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar Container */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotificationsOpen(false);
              }}
              aria-label="User Menu"
              className="p-0 sm:pl-1.5 sm:pr-4 sm:py-1.5 rounded-full border-0 sm:border border-slate-200/80 dark:border-slate-800/80 bg-transparent sm:bg-white sm:dark:bg-[#0d121f] hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center space-x-2.5 transition-all shrink-0 active:scale-95 cursor-pointer"
            >
              {user?.avatar && !imgError ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  onError={() => setImgError(true)}
                  className="w-9.5 h-9.5 sm:w-9 sm:h-9 rounded-full object-cover shadow-xs border border-slate-200/80 dark:border-slate-800/80 sm:border-0"
                />
              ) : (
                <div className="w-9.5 h-9.5 sm:w-9 sm:h-9 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="text-left hidden md:block overflow-hidden max-w-32.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-snug">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-none">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-3 w-56 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-[#070a11] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
                  {user?.avatar && !imgError ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>

                <NavLink
                  to="/settings"
                  className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <HiUser className="w-4 h-4 text-indigo-500" />
                  <span>My Profile & Settings</span>
                </NavLink>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <HiArrowRightOnRectangle className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

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
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmLogout}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
