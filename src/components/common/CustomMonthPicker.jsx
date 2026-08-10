import React, { useState, useRef, useEffect } from 'react';
import { HiCalendarDays, HiChevronLeft, HiChevronRight, HiChevronDown } from 'react-icons/hi2';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const CustomMonthPicker = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current value "YYYY-MM"
  const now = new Date();
  const [yearStr, monthStr] = (value || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`).split('-');
  const selectedYear = parseInt(yearStr, 10);
  const selectedMonth = parseInt(monthStr, 10) - 1; // 0-11

  // Local view year inside picker
  const [viewYear, setViewYear] = useState(selectedYear);

  // Sync viewYear when selectedYear changes externally
  useEffect(() => {
    setViewYear(selectedYear);
  }, [selectedYear]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMonth = (monthIndex) => {
    const formattedMonth = String(monthIndex + 1).padStart(2, '0');
    onChange(`${viewYear}-${formattedMonth}`);
    setIsOpen(false);
  };

  const handleResetCurrentMonth = () => {
    const currYear = now.getFullYear();
    const currMonth = String(now.getMonth() + 1).padStart(2, '0');
    onChange(`${currYear}-${currMonth}`);
    setViewYear(currYear);
    setIsOpen(false);
  };

  const displayLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2.5 px-4 py-2.5 bg-white dark:bg-[#0A1325] border border-slate-200 dark:border-[#1F4759]/60 rounded-2xl shadow-xs hover:shadow-md hover:border-amber-500/50 active:scale-95 transition-all cursor-pointer group"
      >
        <HiCalendarDays className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">Filter Month</span>
          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-1">
            <span>{displayLabel}</span>
            <HiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </span>
        </div>
      </button>

      {/* Popover Dropdown UI */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white dark:bg-[#0E1A30] border border-slate-200 dark:border-[#1F4759] rounded-3xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
          {/* Year Header Selector */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setViewYear(viewYear - 1)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
            >
              <HiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {viewYear}
            </span>
            <button
              type="button"
              onClick={() => setViewYear(viewYear + 1)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
            >
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 12 Months Grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTH_SHORT.map((mShort, idx) => {
              const isSelected = viewYear === selectedYear && idx === selectedMonth;
              const isCurrentMonth = viewYear === now.getFullYear() && idx === now.getMonth();

              return (
                <button
                  key={mShort}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                  className={`py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 font-extrabold scale-105'
                      : isCurrentMonth
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {mShort}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer */}
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={handleResetCurrentMonth}
              className="text-amber-600 dark:text-amber-400 font-extrabold hover:underline cursor-pointer"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 font-bold hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMonthPicker;
